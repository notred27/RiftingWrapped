
import os
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote
 
import requests
from dotenv import load_dotenv
from match_doc import PRIORITY_NEW_PLAYER, PRIORITY_RESCAN
from riot import RiotSession, get_routing_region
from pymongo import MongoClient, ASCENDING, UpdateOne
from pymongo.errors import BulkWriteError
 
load_dotenv(Path(__file__).resolve().parent / ".env")
 
RIOT_API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")


# All "which year are we wrapping" logic flows from this single value, so the
# DB name and the match-date cutoffs can never drift apart like they did before.
WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2026"))
DB_NAME = os.getenv("DB_NAME", "rifting-wrapped")
 
START_DATE = int(datetime(WRAP_YEAR, 1, 1, tzinfo=timezone.utc).timestamp())
END_DATE = int(datetime(WRAP_YEAR + 1, 1, 1, tzinfo=timezone.utc).timestamp())
 
MATCH_PAGE_SIZE = 100
REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))
BULK_OP_SIZE = 200
 
# logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("producer")
 
if not RIOT_API_KEY:
    logger.error("RIOT_API_KEY is not set. Check your .env file.")
    sys.exit(1)
 
if not MONGO_URI:
    logger.error("MONGO_URI is not set. Check your .env file.")
    sys.exit(1)
 
# DB collections
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
yy = WRAP_YEAR % 100
matches_collection = db[f"matches-{yy:02d}"]
player_collection = db["tracked-players"]
dlq_collection = db.get_collection("producer-dlq")
 
 
class Producer:
    def __init__(self, riot_api_key: str):
        self.rs = RiotSession(riot_api_key, rps=REQUESTS_PER_SECOND)
        self._ensure_indexes()
 
    def _ensure_indexes(self):
        # create unique compound index for matches (idempotent)
        try:
            matches_collection.create_index(
                [("puuid", ASCENDING), ("matchId", ASCENDING)],
                unique=True, name="unique_puuid_matchId", background=True,
            )
            # Serves the consumer's "next match" query and the API's queue
            # position: pending matches in QUEUE_SORT order (match_doc.py).
            matches_collection.create_index(
                [("status", ASCENDING), ("priority", ASCENDING),
                 ("created_at", ASCENDING), ("puuid", ASCENDING)],
                name="queue_order", background=True,
            )
            logger.info("Ensured necessary indexes.")
        except Exception as e:
            logger.exception("Index creation issue: %s", e)
 
    # ----- Riot / Summoner utilities -----
    def get_user_puuid(self, display_name: str, tag: str, region: str) -> str:
        R = get_routing_region(region, api_endpoint=True)
        # quote(): a name/tag is user input in a URL path segment.
        url = (
            f"https://{R}.api.riotgames.com"
            f"/riot/account/v1/accounts/by-riot-id/{quote(display_name, safe='')}/{quote(tag, safe='')}"
        )
        data = self.rs.safe_request("GET", url)
        if not data or "puuid" not in data:
            raise RuntimeError("Couldn't fetch puuid for user")
        return data["puuid"]
 
    def fetch_summoner_by_puuid(self, puuid: str, region: str) -> dict:
        url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        data = self.rs.safe_request("GET", url)
        if not data:
            raise RuntimeError(f"No summoner data returned for puuid {puuid}")
        return data
 
    # ----- Match list retrieval -----
    def get_match_ids(self, puuid: str, region: str, start: int = 0, count: int = MATCH_PAGE_SIZE) -> List[str]:
        R = get_routing_region(region)
        url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = {
            "start": start,
            "count": count,
            "startTime": START_DATE,
            "endTime": END_DATE,
        }
        data = self.rs.safe_request("GET", url, params=params)
        return data or []
 
    # ----- Producer operations -----
    def register_player(self, display_name: str, tag: str, region: str) -> str:
        """
        Register player in the DB (upsert) and return puuid.
        """
        puuid = self.get_user_puuid(display_name, tag, region)
        # fetch summoner details (platform region for this endpoint is the platform short code, not routing)
        summoner_data = self.fetch_summoner_by_puuid(puuid, region.upper())
        level = summoner_data.get("summonerLevel")
        profile_icon_id = summoner_data.get("profileIconId")
 
        # fetch latest ddragon version safely (failure here shouldn't break registration)
        version = None
        try:
            version = requests.get("https://ddragon.leagueoflegends.com/api/versions.json", timeout=10).json()[0]
        except Exception:
            logger.warning("Couldn't fetch ddragon version; icon link may be stale.")
 
        player_update = {
            "$set": {
                "displayName": display_name,
                "tag": tag,
                "puuid": puuid,
                "level": level,
                "icon": f"https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{profile_icon_id}.png" if version else None,
                "status": "counting",
                "region": region,
                # Reset on every registration (not just first insert) so a
                # re-run can't leave progress tracking pointing at stale counts.
                "processedMatches": 0,
                "totalMatches": 0,
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            },
        }
        player_collection.update_one({"puuid": puuid}, player_update, upsert=True)
        logger.info("Registered/updated player %s (%s)", display_name, puuid)
        return puuid
 
    def create_pending_matches(self, puuid: str, region: str) -> int:
        """
        Walk match list pages and bulk upsert match documents in 'pending' state.
        Returns total matches inserted (or seen).
        """
        offset = 0
        count = MATCH_PAGE_SIZE
        total_seen = 0
        bulk_ops = []
        # One timestamp for every match this scan queues: it's this player's
        # place in line, so all their matches are processed together.
        now_dt = datetime.now(timezone.utc)
        # Players who already have processed matches can view their Wrapped
        # while a re-scan runs, so their work waits behind first-time players.
        has_stats = matches_collection.find_one(
            {"puuid": puuid, "stats": {"$exists": True}}, {"_id": 1}
        ) is not None
        priority = PRIORITY_RESCAN if has_stats else PRIORITY_NEW_PLAYER
 
        while True:
            ids = self.get_match_ids(puuid, region, start=offset, count=count)
            if not ids:
                break
 
            for match_id in ids:
                doc = {
                    "matchId": match_id,
                    "puuid": puuid,
                    "region": region,
                    "status": "pending",
                    "created_at": now_dt,
                    "priority": priority,
                }
                op = UpdateOne(
                    {"matchId": match_id, "puuid": puuid},
                    {"$setOnInsert": doc},
                    upsert=True,
                )
                bulk_ops.append(op)
                total_seen += 1
 
            # Execute bulk write in batches to avoid giant operations
            if len(bulk_ops) >= BULK_OP_SIZE:
                self._commit_bulk(bulk_ops)
                bulk_ops = []
 
            offset += count
 
        # commit any remaining
        if bulk_ops:
            self._commit_bulk(bulk_ops)
 
        # Now update player's totalMatches and status. This doc is guaranteed
        # to already exist (register_player runs first), so no upsert/setOnInsert needed.
        #
        # Count what is actually left to do rather than assuming everything is
        # pending: a player with no games this year, or a re-scan where every
        # match is already stored, has nothing for the consumer to process -
        # and only processing one of a player's matches would ever have moved
        # them out of "pending", so they sat on the waiting page forever.
        remaining = matches_collection.count_documents(
            {"puuid": puuid, "status": {"$in": ["pending", "processing"]}}
        )
        handled = matches_collection.count_documents(
            {"puuid": puuid, "status": {"$in": ["done", "failed"]}}
        )
        player_update = {
            "totalMatches": total_seen,
            # Matches stored by earlier runs or the hourly scraper are already
            # done; count them so progress reads e.g. "290 / 300", not "0 / 300".
            "processedMatches": handled,
            "updated_at": datetime.now(timezone.utc),
        }
        if remaining == 0:
            failed = matches_collection.count_documents({"puuid": puuid, "status": "failed"})
            player_update["status"] = "done_with_errors" if failed else "done"
            player_update["finished_at"] = datetime.now(timezone.utc)
        else:
            player_update["status"] = "pending"

        player_collection.update_one({"puuid": puuid}, {"$set": player_update})
 
        logger.info("Queued %d matches for puuid %s (%d still to process, status=%s)",
                    total_seen, puuid, remaining, player_update["status"])
        return total_seen
 
    def _commit_bulk(self, ops: List[UpdateOne]):
        if not ops:
            return
        try:
            res = matches_collection.bulk_write(ops, ordered=False)
            logger.info("Bulk write: inserted=%s, modified=%s", getattr(res, "inserted_count", None), getattr(res, "modified_count", None))
        except BulkWriteError as bwe:
            logger.warning("Bulk write error (some ops failed): %s", bwe.details)
        except Exception:
            logger.exception("Unexpected error during bulk write.")
            raise
 
    def mark_player_failed(self, puuid: Optional[str], err_msg: str):
        try:
            if puuid:
                player_collection.update_one(
                    {"puuid": puuid},
                    {"$set": {"status": "failed", "error": err_msg, "updated_at": datetime.now(timezone.utc)}},
                )
            else:
                logger.error("Cannot mark player failed: puuid is None. Error: %s", err_msg)
            dlq_collection.insert_one({
                "puuid": puuid,
                "error": err_msg,
                "time": datetime.now(timezone.utc),
            })
        except Exception:
            logger.exception("Failed to mark player failed in DB.")
 
def main():
    if len(sys.argv) < 4:
        logger.error("Usage: python producer.py <displayName> <tag> <region>")
        sys.exit(2)
 
    username, tag, region = sys.argv[1], sys.argv[2], sys.argv[3]
 
    p = Producer(RIOT_API_KEY)
    puuid = None
    try:
        puuid = p.register_player(username, tag, region)
        p.create_pending_matches(puuid, region)
    except Exception as e:
        logger.exception("Error adding user: %s", e)
        try:
            p.mark_player_failed(puuid, str(e))
        except Exception:
            logger.exception("Failed to mark failed player.")
        sys.exit(1)
 
 
if __name__ == "__main__":
    main()
 
