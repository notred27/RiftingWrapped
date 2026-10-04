import os
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

from match_doc import build_match_fields, unset_fields

load_dotenv(Path(__file__).resolve().parent / ".env")

RIOT_API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")



WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2026"))
DB_NAME = os.getenv("DB_NAME", f"rifting-wrapped")

REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))
MAX_RETRIES = 5
BACKOFF_BASE = 2.0

MAX_RUN_SECONDS = int(os.getenv("MAX_RUN_SECONDS", str(20 * 60)))  # default 20 min
POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "10.0"))          # seconds to wait when queue empty
# A match left in "processing" longer than this was abandoned by a run that was
# cancelled or crashed mid-match. Must exceed MAX_RUN_SECONDS so we never reset
# a match another run is still working on.
STALE_PROCESSING_SECONDS = int(os.getenv("STALE_PROCESSING_SECONDS", str(30 * 60)))

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("consumer")

if not RIOT_API_KEY:
    logger.error("RIOT_API_KEY is not set. Check your .env file.")
    raise SystemExit(1)

if not MONGO_URI:
    logger.error("MONGO_URI is not set. Check your .env file.")
    raise SystemExit(1)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
yy = WRAP_YEAR % 100
matches_collection = db[f"matches-{yy:02d}"]
player_collection = db["tracked-players"]
dlq_collection = db.get_collection("producer-dlq")


def get_routing_region(region: str, api_endpoint: bool = False) -> str:
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
        return "asia" if api_endpoint else "sea"
    return r.lower() or "unknown"


class RiotSession:
    """Riot API wrapper with retries and rate-limiting."""

    def __init__(self, api_key: str, rps: float = 1.0):
        self.sess = requests.Session()
        self.sess.headers.update({"X-Riot-Token": api_key})
        self.last_request_at = 0.0
        self.min_interval = 1.0 / max(rps, 0.1)

    def safe_request(self, method: str, url: str, params: Optional[dict] = None, timeout: int = 30):
        attempt = 0
        while True:
            now = time.time()
            elapsed = now - self.last_request_at
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)

            try:
                resp = self.sess.request(method, url, params=params, timeout=timeout)
                self.last_request_at = time.time()

                if resp.status_code == 429:
                    wait = int(resp.headers.get("Retry-After", 20))
                    logger.warning("Rate limited. Waiting %s seconds", wait)
                    time.sleep(wait)
                    attempt += 1
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                if 500 <= resp.status_code < 600:
                    attempt += 1
                    backoff = BACKOFF_BASE ** attempt
                    logger.warning("Server error %s. Backing off %ss", resp.status_code, backoff)
                    time.sleep(backoff)
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                resp.raise_for_status()
                return resp.json() if resp.content else None
            except requests.RequestException as e:
                attempt += 1
                backoff = min(BACKOFF_BASE ** attempt, 60)
                logger.warning("Network error: %s. Retry in %ss", e, backoff)
                time.sleep(backoff)
                if attempt > MAX_RETRIES:
                    raise


class Consumer:
    """Processes pending matches, extracts stats, prioritizing recent users."""

    def __init__(self, riot_api_key: str):
        self.rs = RiotSession(riot_api_key, rps=REQUESTS_PER_SECOND)

    def process_next_match(self) -> Optional[dict]:
        pipeline = [
            {"$match": {"status": "pending"}},
            {"$lookup": {
                "from": "tracked-players",
                "localField": "puuid",
                "foreignField": "puuid",
                "as": "player"
            }},
            {"$unwind": "$player"},
            {"$sort": {"player.created_at": -1, "created_at": ASCENDING}},
            {"$limit": 1}
        ]

        matches = list(matches_collection.aggregate(pipeline))
        if not matches:
            return None

        match = matches[0]
        matches_collection.update_one(
            {"_id": match["_id"]},
            {"$set": {"status": "processing", "processing_started_at": datetime.now(timezone.utc)}},
        )
        return match

    def recover_stuck_work(self):
        """
        Repair state left behind by earlier runs, so no player waits forever:

        1. Matches stuck in "processing" (the run that claimed them was
           cancelled or crashed) go back to "pending". Matches claimed before
           processing_started_at existed have no timestamp, so they count as
           stale too.
        2. Players still marked "pending" with nothing left in the queue - e.g.
           a re-scan that found no new matches - get finalized. Previously
           only processing one of that player's matches could finalize them.
        """
        cutoff = datetime.fromtimestamp(time.time() - STALE_PROCESSING_SECONDS, tz=timezone.utc)
        reset = matches_collection.update_many(
            {
                "status": "processing",
                "$or": [
                    {"processing_started_at": {"$lt": cutoff}},
                    {"processing_started_at": {"$exists": False}},
                ],
            },
            {"$set": {"status": "pending"}, "$unset": {"processing_started_at": ""}},
        )
        if reset.modified_count:
            logger.warning("Reset %d stale 'processing' matches back to 'pending'", reset.modified_count)

        for player in player_collection.find({"status": "pending"}, {"puuid": 1, "_id": 0}):
            self._finalize_player_if_done(player["puuid"])

    def _finalize_player_if_done(self, puuid: str):
        """
        Check whether any matches are still pending/processing for this
        player; if none remain, finalize their profile status.
        """
        remaining = matches_collection.count_documents(
            {"puuid": puuid, "status": {"$in": ["pending", "processing"]}}
        )
        if remaining > 0:
            return

        failed = matches_collection.count_documents({"puuid": puuid, "status": "failed"})
        new_status = "done_with_errors" if failed > 0 else "done"

        player_collection.update_one(
            {"puuid": puuid},
            {"$set": {"status": new_status, "finished_at": datetime.now(timezone.utc)}},
        )
        logger.info("Player %s finished processing (status=%s, failed_matches=%d)", puuid, new_status, failed)

    def process_match(self, match_doc: dict):
        match_id = match_doc["matchId"]
        puuid = match_doc["puuid"]
        region = match_doc.get("region", "NA1")
        try:
            R = get_routing_region(region)
            match_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}")
            timeline_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline")

            # Same document shape as the hourly scraper writes (match_doc.py);
            # drops the queue-only fields now that the match is done.
            matches_collection.update_one(
                {"_id": match_doc["_id"]},
                {"$set": build_match_fields(match_data, timeline_data, puuid),
                 "$unset": unset_fields()},
            )

            player_collection.update_one({"puuid": puuid}, {"$inc": {"processedMatches": 1}})
            logger.info("Processed match %s for player %s", match_id, puuid)

        except Exception as e:
            logger.exception("Failed to process match %s: %s", match_id, e)
            matches_collection.update_one(
                {"_id": match_doc["_id"]},
                {"$set": {"status": "failed", "error": str(e)}, "$unset": {"processing_started_at": ""}},
            )
            # Still count as "handled" for progress purposes, even though it failed.
            player_collection.update_one({"puuid": puuid}, {"$inc": {"processedMatches": 1}})

        finally:
            # Whether this match succeeded or failed, check if the player's
            # queue is now empty and finalize their status if so.
            self._finalize_player_if_done(puuid)

    def run(self):
        num_processed = 0
        start_time = time.time()
        logger.info("Consumer started; will run for up to %s seconds", MAX_RUN_SECONDS)

        try:
            self.recover_stuck_work()
        except Exception:
            # Housekeeping must never stop the queue from being processed.
            logger.exception("recover_stuck_work failed; continuing")

        try:
            while True:
                elapsed = time.time() - start_time
                if elapsed >= MAX_RUN_SECONDS:
                    logger.info("Max run time reached (%.1fs). Stopping.", elapsed)
                    break

                match_doc = self.process_next_match()
                if not match_doc:
                    # No work right now — sleep and keep polling until timeout
                    remaining = MAX_RUN_SECONDS - (time.time() - start_time)
                    logger.debug("No pending matches. Sleeping %ss (remaining time: %.1fs)", POLL_INTERVAL, remaining)
                    sleep_for = min(POLL_INTERVAL, max(0.0, remaining))
                    if sleep_for <= 0:
                        logger.info("No remaining time to wait. Exiting.")
                        break
                    time.sleep(sleep_for)
                    continue

                self.process_match(match_doc)
                num_processed += 1

        except KeyboardInterrupt:
            logger.info("Interrupted by user (KeyboardInterrupt). Exiting early.")
        except Exception:
            logger.exception("Unhandled exception in consumer.run()")
        finally:
            github_output = os.environ.get("GITHUB_OUTPUT")
            if github_output:
                try:
                    with open(github_output, "a", encoding="utf-8") as fh:
                        fh.write(f"num_matches={num_processed}\n")
                except Exception as e:
                    logger.exception("Failed to write GITHUB_OUTPUT: %s", e)
            else:
                logger.info("GITHUB_OUTPUT not present; writing local-github-output.txt")
                try:
                    with open("local-github-output.txt", "w", encoding="utf-8") as fh:
                        fh.write(f"num_matches={num_processed}\n")
                except Exception as e:
                    logger.exception("Failed to write local output file: %s", e)

            logger.info("Consumer finished. Total matches processed: %d", num_processed)


if __name__ == "__main__":
    consumer = Consumer(RIOT_API_KEY)
    consumer.run()