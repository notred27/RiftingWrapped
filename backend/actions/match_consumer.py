import os
import threading
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient, ReturnDocument

from match_doc import (
    build_match_fields, build_match_update, add_to_player_grid, player_locations_name,
    QUEUE_SORT, PRIORITY_NEW_PLAYER, needs_timeline,
)
from notify import send_ready_emails
from precompute_leaderboards import refresh_leaderboards
from riot import RiotSession, get_routing_region, MATCH_ROUTING, PLATFORMS

load_dotenv(Path(__file__).resolve().parent / ".env")

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")



WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2026"))
DB_NAME = os.getenv("DB_NAME", f"rifting-wrapped")

REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))

MAX_RUN_SECONDS = int(os.getenv("MAX_RUN_SECONDS", str(20 * 60)))  # default 20 min
POLL_INTERVAL = float(os.getenv("POLL_INTERVAL", "10.0"))          # seconds to wait when queue empty
# A match left in "processing" longer than this was abandoned by a run that was
# cancelled or crashed mid-match. Must exceed MAX_RUN_SECONDS so we never reset
# a match another run is still working on.
STALE_PROCESSING_SECONDS = int(os.getenv("STALE_PROCESSING_SECONDS", str(30 * 60)))
# The producer moves a sign-up out of "starting" within a minute or two of the
# API dispatching it; one still there after this never got a working run.
STALE_STARTING_SECONDS = int(os.getenv("STALE_STARTING_SECONDS", str(60 * 60)))
# The precompute workflow's hourly schedule really runs every 6-11 hours, so
# the consumer (running ~4 hours at a time) refreshes the leaderboard cache too.
LEADERBOARD_REFRESH_SECONDS = 60 * 60

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(threadName)s] %(message)s")
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
player_locations_collection = db[player_locations_name(WRAP_YEAR)]   # per-player kill/death grids
player_collection = db["tracked-players"]
dlq_collection = db.get_collection("producer-dlq")
runs_collection = db["consumer-runs"]   # per-run throughput, for queue wait estimates
stop = threading.Event()                # set on Ctrl-C so every region's thread winds down


def claim_filter(routing: str) -> dict:
    """Pending matches one routing region's consumer may claim."""
    if routing == "americas":
        # The consumer treats a missing region as NA1, so americas also takes
        # docs with no (or an unknown) region: everything no other runner claims.
        others = sorted(p for r, ps in MATCH_ROUTING.items() if r != "americas" for p in ps)
        return {"status": "pending", "region": {"$nin": others}}
    return {"status": "pending", "region": {"$in": sorted(MATCH_ROUTING[routing])}}


class Consumer:
    """
    Processes one match-v5 routing region's pending matches (Riot rate-limits
    each region separately, so main() runs one Consumer per region in parallel).
    """

    def __init__(self, riot_api_key: str, routing: str):
        self.routing = routing
        self.rs = RiotSession(riot_api_key, rps=REQUESTS_PER_SECOND)
        self.num_processed = 0

    def process_next_match(self) -> Optional[dict]:
        """
        Claim the next pending match in queue order (match_doc.QUEUE_SORT):
        first-time players before re-scans, then first come first served.
        A player's matches share one queue time, so they're processed
        together - one player is finished before the next one starts.

        find_one_and_update makes the claim atomic, so two overlapping runs
        can never pick up the same match, including runs for different
        routing regions.
        """
        return matches_collection.find_one_and_update(
            claim_filter(self.routing),
            {"$set": {"status": "processing", "processing_started_at": datetime.now(timezone.utc)}},
            sort=QUEUE_SORT,
            return_document=ReturnDocument.AFTER,
        )

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
        3. Players stuck in "starting" (the dispatched producer run never
           started, or died before it knew their puuid) become "failed", so
           the waiting page stops spinning and searching again retries them.
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

        # Matches queued before priorities existed: treat them as first-time
        # work, and give any without a queue time one now, so they join the
        # back of the line instead of sorting ahead of everyone (MongoDB sorts
        # missing values first).
        queued = {"status": {"$in": ["pending", "processing"]}}
        matches_collection.update_many({**queued, "priority": {"$exists": False}},
                                       {"$set": {"priority": PRIORITY_NEW_PLAYER}})
        matches_collection.update_many({**queued, "created_at": {"$exists": False}},
                                       {"$set": {"created_at": datetime.now(timezone.utc)}})

        for player in player_collection.find({"status": "pending"}, {"puuid": 1, "_id": 0}):
            self._finalize_player_if_done(player["puuid"])

        starting_cutoff = datetime.fromtimestamp(time.time() - STALE_STARTING_SECONDS, tz=timezone.utc)
        stuck = player_collection.update_many(
            {
                "status": "starting",
                "$or": [
                    {"updated_at": {"$lt": starting_cutoff}},
                    # Sign-ups from before the API stamped updated_at: use the insert time.
                    {"updated_at": {"$exists": False}, "_id": {"$lt": ObjectId.from_datetime(starting_cutoff)}},
                ],
            },
            {"$set": {"status": "failed", "error": "Processing never started", "updated_at": datetime.now(timezone.utc)}},
        )
        if stuck.modified_count:
            logger.warning("Marked %d players stuck in 'starting' as failed", stuck.modified_count)

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
        send_ready_emails(db, puuid)

    def process_match(self, match_doc: dict):
        match_id = match_doc["matchId"]
        puuid = match_doc["puuid"]
        region = match_doc.get("region", "NA1")
        try:
            if region.upper() not in PLATFORMS:
                raise ValueError(f"Unknown region {region!r}")   # never put it in a host name with the key
            R = get_routing_region(region)
            match_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}")
            timeline_data = {}
            if needs_timeline(match_data):
                timeline_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline")

            # Same document shape as the hourly scraper writes (match_doc.py);
            # drops the queue-only fields now that the match is done.
            # "status != done" makes this the one write that finishes the match:
            # if another run already finished it, nothing matches and its
            # positions must not be added to the player's grid a second time.
            fields = build_match_fields(match_data, timeline_data, puuid)
            result = matches_collection.update_one(
                {"_id": match_doc["_id"], "status": {"$ne": "done"}},
                build_match_update(fields),
            )
            if result.matched_count == 1:
                add_to_player_grid(player_locations_collection, puuid, fields["locations"])

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

    def record_run(self, started_at: datetime, num_processed: int, busy_seconds: float):
        """
        Store this run's throughput. The API divides recent throughput into
        the queue to estimate a waiting player's wait. busy_seconds counts
        only time spent processing (not polling an empty queue), so quiet
        periods don't make estimates look slower than they are.
        """
        try:
            runs_collection.create_index("finished_at", expireAfterSeconds=2 * 24 * 3600)  # keep 2 days
            runs_collection.insert_one({
                "year": WRAP_YEAR,
                "started_at": started_at,
                "finished_at": datetime.now(timezone.utc),
                "processed": num_processed,
                "busy_seconds": round(busy_seconds, 1),
                "routing": self.routing,
            })
        except Exception:
            logger.exception("Failed to record consumer run stats")

    def run(self, refresh_boards: bool = False):
        num_processed = 0
        busy_seconds = 0.0
        run_started_at = datetime.now(timezone.utc)
        start_time = time.time()

        last_leaderboard_refresh = 0.0
        try:
            while True:
                if refresh_boards and time.time() - last_leaderboard_refresh >= LEADERBOARD_REFRESH_SECONDS:
                    last_leaderboard_refresh = time.time()
                    try:
                        refresh_leaderboards(db, WRAP_YEAR)
                    except Exception:
                        logger.exception("Leaderboard refresh failed; continuing")   # never stop the queue for it

                elapsed = time.time() - start_time
                if elapsed >= MAX_RUN_SECONDS or stop.is_set():
                    logger.info("Stopping after %.1fs.", elapsed)
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
                    stop.wait(sleep_for)
                    continue

                t0 = time.time()
                self.process_match(match_doc)
                busy_seconds += time.time() - t0
                num_processed += 1

        except Exception:
            logger.exception("Unhandled exception in consumer.run()")
            # End the whole job so the next run restarts every region, instead of
            # the other threads keeping it alive for hours with this region idle.
            stop.set()
        finally:
            self.num_processed = num_processed
            self.record_run(run_started_at, num_processed, busy_seconds)
            logger.info("Consumer finished. Matches processed: %d", num_processed)


def main():
    consumers = [Consumer(RIOT_API_KEY, routing) for routing in MATCH_ROUTING]
    logger.info("Consumer started for %s; will run for up to %s seconds", ", ".join(MATCH_ROUTING), MAX_RUN_SECONDS)

    # Shared housekeeping runs once, before the regions start.
    try:
        consumers[0].recover_stuck_work()
    except Exception:
        # Housekeeping must never stop the queue from being processed.
        logger.exception("recover_stuck_work failed; continuing")

    # Players finished elsewhere (e.g. by the producer, when they had no new
    # matches) and emails that failed to send last run.
    send_ready_emails(db)

    threads = [threading.Thread(target=c.run, kwargs={"refresh_boards": i == 0}, name=c.routing)
               for i, c in enumerate(consumers)]
    for t in threads:
        t.start()
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        logger.info("Interrupted by user (KeyboardInterrupt). Stopping every region.")
        stop.set()
        for t in threads:
            t.join()

    num_processed = sum(c.num_processed for c in consumers)
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
    logger.info("All regions finished. Total matches processed: %d", num_processed)


if __name__ == "__main__":
    main()
