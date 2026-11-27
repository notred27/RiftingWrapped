import os
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError

from match_doc import needs_timeline, build_match_fields, build_match_update, add_to_player_grid, player_locations_name, riot_id_update
from scrape_window import compute_cutoff
from riot import RiotSession, get_routing_region, PLATFORMS

load_dotenv(Path(__file__).resolve().parent / ".env")

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2026"))
DB_NAME = os.getenv("DB_NAME", "rifting-wrapped")

# How far back to look for new matches. Each run picks up from where the last
# successful run started (see scrape_window.py), so a late or skipped
# GitHub schedule - which in practice fires every 5-10 hours, not hourly -
# doesn't drop the games played in between. Matches already stored are skipped
# by a database check, so a wider window costs almost no Riot calls.
#
# LOOKBACK_SECONDS is the minimum window (and the window when there's no run
# history yet); set it higher for a one-off backfill after downtime, e.g.
# LOOKBACK_SECONDS=1814400 for 21 days (or the workflow's `lookback_days` input).
# MAX_CATCHUP_SECONDS caps how far back an automatic catch-up goes.
LOOKBACK_SECONDS = int(os.getenv("LOOKBACK_SECONDS", str(2 * 60 * 60)))
MAX_CATCHUP_SECONDS = int(os.getenv("MAX_CATCHUP_SECONDS", str(14 * 24 * 60 * 60)))

# Never pull matches past the wrap year's boundary, even if WRAP_YEAR is
# stale when this runs (e.g. right after New Year's).
END_DATE = int(datetime(WRAP_YEAR + 1, 1, 1, tzinfo=timezone.utc).timestamp())
RUN_STARTED_AT = datetime.now(timezone.utc)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(threadName)s] %(message)s")
logger = logging.getLogger("sync")

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
player_collection = db["tracked-players"]  # shared across all wrap years
player_locations_collection = db[player_locations_name(WRAP_YEAR)]   # per-player kill/death grids

scraper_runs = db["scraper-runs"]   # one document per successful run

REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))

_last_run = scraper_runs.find_one({"year": WRAP_YEAR}, sort=[("started_at", -1)])
cutoffDate = compute_cutoff(RUN_STARTED_AT, _last_run["started_at"] if _last_run else None,
                            WRAP_YEAR, LOOKBACK_SECONDS, MAX_CATCHUP_SECONDS)

tracked_players = list(player_collection.find({}, {"puuid": 1, "region": 1, "_id": 0}))
tracked_puuids = {p["puuid"] for p in tracked_players}
puuid_region = {p["puuid"]: p.get("region", "NA1") for p in tracked_players}


newest_names = {}   # puuid -> riot_id_update() from the player's newest match this run
ddragon_version = None   # for profile icon links; set at start of the run
names_lock = threading.Lock()   # region threads share newest_names


def match_id_exists(match_id, puuid):
    return matches_collection.count_documents({"matchId": match_id, "puuid": puuid}, limit=1) > 0


def get_match_ids(rs, puuid, region, start=0, count=20):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": start, "count": count, "startTime": cutoffDate, "endTime": END_DATE}
    return rs.safe_request("GET", url, params=params)


def get_match_data(rs, match_id, region):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    return rs.safe_request("GET", url)


def get_timeline_data(rs, match_id, region):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
    return rs.safe_request("GET", url)


def store_match(match_data, timeline_data):
    match_id = match_data["metadata"]["matchId"]

    num_logged_players = 0
    for player in match_data["info"]["participants"]:
        puuid = player["puuid"]

        if puuid not in tracked_puuids:
            continue

        # Riot IDs, levels and icons change; recent matches carry the current
        # ones. Keep only each player's newest this run and save them at the end.
        name_update = riot_id_update(match_data, player, ddragon_version)
        with names_lock:
            if name_update and (puuid not in newest_names
                                or name_update[1]["$set"]["name_seen_at"] > newest_names[puuid][1]["$set"]["name_seen_at"]):
                newest_names[puuid] = name_update

        if match_id_exists(match_id, puuid):
            continue

        num_logged_players += 1

        # Same document shape as match_consumer.py writes (match_doc.py).
        # Previously this also stored all ten participants' puuids in
        # matchInfo.teams (~900 bytes per document) that nothing read.
        fields = build_match_fields(match_data, timeline_data, puuid)
        result = matches_collection.update_one(
            {"matchId": match_id, "puuid": puuid},
            build_match_update(fields),
            upsert=True,
        )
        # Only a match this call inserted counts towards the player's grid. If a
        # concurrent run (e.g. the consumer) got there first, it already did.
        if result.upserted_id is not None:
            add_to_player_grid(player_locations_collection, puuid, fields["locations"])

        player_collection.update_one(
            {"puuid": puuid},
            {"$inc": {"totalMatches": 1, "processedMatches": 1}}
        )

    logger.info("Stored match %s for %d players", match_id, num_logged_players)


def scan_region(players):
    """Fetch and store new matches for one routing region's players. Returns (stored, failed)."""
    rs = RiotSession(RIOT_API_KEY, rps=REQUESTS_PER_SECOND)
    num_processed = 0
    failed_matches = 0

    for user_puuid, region in players:
        offset = 0
        count = 100

        while True:
            try:
                match_ids = get_match_ids(rs, user_puuid, region, start=offset, count=count)
            except Exception:
                # One bad account (moved region, deleted) must not stop the
                # scan for every player after it.
                logger.exception("Couldn't list matches for %s; skipping this player", user_puuid)
                failed_matches += 1
                break
            if not match_ids:
                logger.info("No more matches found for %s.", user_puuid)
                break

            # One query per page instead of one per match: a catch-up window can
            # list tens of thousands of already-stored matches.
            stored = {d["matchId"] for d in matches_collection.find(
                {"puuid": user_puuid, "matchId": {"$in": match_ids}}, {"matchId": 1, "_id": 0})}

            for match_id in match_ids:
                if match_id in stored:
                    logger.info("Match %s already found from another query. Skipping.", match_id)
                    continue

                try:
                    match_data = get_match_data(rs, match_id, region)
                    timeline_data = get_timeline_data(rs, match_id, region) if needs_timeline(match_data) else {}
                    store_match(match_data, timeline_data)
                    num_processed += 1
                except Exception as e:
                    logger.exception("Error fetching match %s: %s", match_id, e)
                    failed_matches += 1

            offset += count

    return num_processed, failed_matches


if __name__ == "__main__":
    try:
        matches_collection.create_index(
            [("puuid", ASCENDING), ("matchId", ASCENDING)],
            unique=True,
            name="unique_puuid_matchId"
        )
        logger.info("Unique compound index created successfully.")
    except DuplicateKeyError as e:
        logger.error("Duplicate keys found! Clean up duplicates before creating the index.")
        logger.error(e)

    logger.info("Starting Riot match sync -> db '%s', collection 'matches-%02d'...", DB_NAME, yy)
    logger.info("Tracked players found: %d", len(tracked_puuids))
    logger.info("Fetching matches since %s (last successful run started %s)",
                datetime.fromtimestamp(cutoffDate, timezone.utc).isoformat(),
                _last_run["started_at"].isoformat() if _last_run else "never")

    try:
        ddragon_version = requests.get("https://ddragon.leagueoflegends.com/api/versions.json", timeout=10).json()[0]
    except Exception:
        logger.warning("Couldn't fetch ddragon version; icon links won't be updated this run.")

    # Riot rate-limits each routing region separately, so each region's
    # players are scanned by their own thread with their own request budget.
    by_routing = {}
    for user_puuid in tracked_puuids:
        region = (puuid_region.get(user_puuid) or "NA1").upper()
        if region not in PLATFORMS:
            logger.warning("Skipping %s: unknown region %r", user_puuid, region)
            continue
        by_routing.setdefault(get_routing_region(region), []).append((user_puuid, region))

    results = {}   # routing -> (stored, failed)

    def scan(routing, players):
        results[routing] = scan_region(players)

    threads = [threading.Thread(target=scan, args=item, name=item[0]) for item in by_routing.items()]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    # A region whose thread died has no result: count it as failed so this run isn't recorded.
    num_processed = sum(r[0] for r in results.values())
    failed_matches = sum(r[1] for r in results.values()) + len(by_routing) - len(results)

    # One write per player who played: their Riot ID (so they don't have to
    # search again after renaming), level and icon, all from their newest match.
    for name_update in newest_names.values():
        player_collection.update_one(*name_update)
    logger.info("Refreshed Riot IDs, levels and icons for %d players", len(newest_names))

    # Recorded only when every player was scanned and every match stored, so a
    # crash, a skipped player or a failed download (e.g. a Riot 503) makes the
    # next run retry from the last clean run. failed_matches also counts players
    # whose match list couldn't be fetched. shortcut: a match that always fails keeps every run at
    # the MAX_CATCHUP_SECONDS window (cheap: stored matches are one query per
    # page); skip such matches by ID if that ever gets slow.
    if failed_matches:
        logger.warning("%d match(es) failed; not recording this run so the next one retries them", failed_matches)
    else:
        scraper_runs.insert_one({
            "year": WRAP_YEAR,
            "started_at": RUN_STARTED_AT,
            "finished_at": datetime.now(timezone.utc),
            "cutoff": datetime.fromtimestamp(cutoffDate, timezone.utc),
            "processed": num_processed,
        })

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as fh:
            fh.write(f"num_matches={num_processed}\n")
    else:
        logger.info("GITHUB_OUTPUT not present; running locally.")
        with open("local-github-output.txt", "w", encoding="utf-8") as fh:
            fh.write(f"num_matches={num_processed}\n")