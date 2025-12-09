import os
import sys
import time
import logging
from datetime import datetime, timezone
from typing import List, Optional, Set

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, UpdateOne
from pymongo.errors import BulkWriteError

load_dotenv(".env")

API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "rifting-wrapped-2024")


CUTOFF_DATE = 1735689600  # Jan 1st, 2025

MATCH_PAGE_SIZE = 100
REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))
MAX_RETRIES = 5
BACKOFF_BASE = 2.0
BULK_OP_SIZE = 200

# DB collections
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
matches_collection = db["player-matches"]
player_collection = db["tracked-players"]
dlq_collection = db.get_collection("producer-dlq")

# logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("producer")


def get_routing_region(region: str, api_endpoint: bool = False) -> str:
    """
    Map summoner region code to routing or platform region for Riot endpoints.
    """
    r = (region or "").strip().upper()
    americas = {"NA1", "BR1", "LA1", "LA2"}
    europe = {"EUN1", "EUW1", "TR1", "RU", "ME1"}
    asia = {"KR", "JP1"}
    sea = {"SG2", "OC1", "TW2", "VN2", "PH2", "TH2"}

    if r in americas:
        return "americas"
    if r in europe:
        return "europe"
    if r in asia:
        return "asia"
    if r in sea:
        # Riot quirk
        return "asia" if api_endpoint else "sea"
    return r.lower() or "unknown"


class RiotSession:
    """
    Wrapper around requests.Session to handle rate limiting and retries.
    """

    def __init__(self, api_key: str, rps: float = 1.0):
        self.sess = requests.Session()
        self.sess.headers.update({"X-Riot-Token": api_key})
        self.last_request_at = 0.0
        self.min_interval = 1.0 / max(rps, 0.1)

    def safe_request(self, method: str, url: str, params: Optional[dict] = None, timeout: int = 30):
        attempt = 0
        while True:
            # enforce spacing between requests
            now = time.time()
            elapsed = now - self.last_request_at
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)

            try:
                resp = self.sess.request(method, url, params=params, timeout=timeout)
                self.last_request_at = time.time()

                # handle rate limit 429
                if resp.status_code == 429:
                    retry_after = resp.headers.get("Retry-After")
                    wait = int(retry_after) if retry_after and retry_after.isdigit() else 20
                    logger.warning("Rate limited (429). Waiting %s seconds and retrying.", wait)
                    time.sleep(wait)
                    attempt += 1
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                # 5xx -> retry with backoff
                if 500 <= resp.status_code < 600:
                    attempt += 1
                    backoff = BACKOFF_BASE ** attempt
                    logger.warning("Server error %s. Backing off %ss (attempt %s).", resp.status_code, backoff, attempt)
                    time.sleep(backoff)
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                resp.raise_for_status()
                if resp.status_code == 204 or not resp.content:
                    return None
                return resp.json()
            except requests.RequestException as exc:
                attempt += 1
                backoff = min(BACKOFF_BASE ** attempt, 60)
                logger.warning("Network error: %s. Retry in %ss (attempt %s).", exc, backoff, attempt)
                time.sleep(backoff)
                if attempt > MAX_RETRIES:
                    raise


class Producer:
    def __init__(self, riot_api_key: str, tracked_cache: Optional[Set[str]] = None):
        self.rs = RiotSession(riot_api_key, rps=REQUESTS_PER_SECOND)
        # cache tracked puuids to speed membership checks (refresh after registering new player)
        self.tracked_puuids: Set[str] = tracked_cache or set()
        self._ensure_indexes()

    def _ensure_indexes(self):
        # create unique compound index for matches (idempotent)
        try:
            matches_collection.create_index([("puuid", ASCENDING), ("matchId", ASCENDING)], unique=True, name="unique_puuid_matchId", background=True)
            matches_collection.create_index([("status", ASCENDING), ("available_at", ASCENDING), ("account_created_at", ASCENDING), ("created_at", ASCENDING)], background=True)
            player_collection.create_index([("puuid", ASCENDING)], unique=True, background=True)
            logger.info("Ensured necessary indexes.")
        except Exception as e:
            logger.exception("Index creation issue: %s", e)

    def refresh_tracked_cache(self):
        # Load all tracked puuids (if this is large, consider another approach such as tagging players)
        self.tracked_puuids = set(doc["puuid"] for doc in player_collection.find({}, {"puuid": 1}))
        logger.info("Loaded %d tracked puuids into cache.", len(self.tracked_puuids))

    # ----- Riot / Summoner utilities -----
    def get_user_puuid(self, display_name: str, tag: str, region: str) -> str:
        R = get_routing_region(region, api_endpoint=True)
        url = f"https://{R}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{display_name}/{tag}"
        data = self.rs.safe_request("GET", url)
        if not data or "puuid" not in data:
            raise RuntimeError("Couldn't fetch puuid for user")
        return data["puuid"]

    def fetch_summoner_by_puuid(self, puuid: str, region: str) -> dict:
        url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return self.rs.safe_request("GET", url)

    # ----- Match list retrieval -----
    def get_match_ids(self, puuid: str, region: str, start: int = 0, count: int = MATCH_PAGE_SIZE) -> List[str]:
        R = get_routing_region(region)
        url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = {"start": start, "count": count, "startTime": CUTOFF_DATE}
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
                "icon": f'https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{profile_icon_id}.png' if version else None,
                "status": "counting",
                "region": region,
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
                "processedMatches": 0,
                "totalMatches":0}
        }
        player_collection.update_one({"puuid": puuid}, player_update, upsert=True)
        logger.info("Registered/updated player %s (%s)", display_name, puuid)

        # refresh tracked cache to include this new player
        self.tracked_puuids.add(puuid)
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
        now_dt = datetime.now(timezone.utc)

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
                }

                op = UpdateOne(
                    {"matchId": match_id, "puuid": puuid},
                    {"$setOnInsert": doc},
                    upsert=True
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

        # Now update player's totalMatches and status
        player_collection.update_one(
            {"puuid": puuid},
            {"$set": {"status": "pending",
                      "totalMatches": total_seen, 
                      "updated_at": datetime.now(timezone.utc)},
                      "$setOnInsert": {"created_at": datetime.now(timezone.utc)}}
        )

        logger.info("Queued %d matches for puuid %s", total_seen, puuid)
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
                player_collection.update_one({"puuid": puuid}, {"$set": {"status": "failed", "error": err_msg, "updated_at": datetime.now(timezone.utc)}})
            else:
                logger.error("Cannot mark player failed: puuid is None. Error: %s", err_msg)
            dlq_collection.insert_one({
                "puuid": puuid,
                "error": err_msg,
                "time": datetime.now(timezone.utc)
            })
        except Exception:
            logger.exception("Failed to mark player failed in DB.")

    def sanity_check_duplicates(self):
        pipeline = [
            {"$group": {"_id": {"puuid": "$puuid", "matchId": "$matchId"}, "count": {"$sum": 1}, "ids": {"$push": "$_id"}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        duplicates = list(matches_collection.aggregate(pipeline))
        logger.info("Found %d duplicate (puuid, matchId) combinations.", len(duplicates))
        return duplicates



if __name__ == "__main__":
    if len(sys.argv) < 4:
        logger.error("Usage: python producer.py <displayName> <tag> <region>")
        sys.exit(2)

    USERNAME = sys.argv[1]
    TAG = sys.argv[2]
    REGION = sys.argv[3]

    p = Producer(API_KEY)
    try:
        puuid = p.register_player(USERNAME, TAG, REGION)
        p.refresh_tracked_cache()  # all tracked puuids
        p.create_pending_matches(puuid, REGION)
    except Exception as e:
        logger.exception("Error adding user: %s", e)
        # puuid may not exist if get_user_puuid failed; attempt to mark if present
        try:
            p.mark_player_failed(locals().get("puuid"), str(e))
        except Exception:
            logger.exception("Failed to mark failed player.")
        sys.exit(1)
