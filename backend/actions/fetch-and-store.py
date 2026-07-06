import os
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError

load_dotenv(Path(__file__).resolve().parent / ".env")

RIOT_API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2025"))
DB_NAME = os.getenv("DB_NAME", f"rifting-wrapped-{WRAP_YEAR}")

# Only pull matches from the last 2 hours
END_DATE = int(datetime(WRAP_YEAR + 1, 1, 1, tzinfo=timezone.utc).timestamp())
cutoffDate = min(int(time.time()) - (2 * 60 * 60), END_DATE)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("sync")

if not RIOT_API_KEY:
    logger.error("RIOT_API_KEY is not set. Check your .env file.")
    raise SystemExit(1)

if not MONGO_URI:
    logger.error("MONGO_URI is not set. Check your .env file.")
    raise SystemExit(1)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
matches_collection = db["player-matches"]
player_collection = db["tracked-players"]

tracked_players = list(player_collection.find({}, {"puuid": 1, "region": 1, "_id": 0}))
tracked_puuids = {p["puuid"] for p in tracked_players}
# region per puuid, so each player's API calls route to the right cluster
puuid_region = {p["puuid"]: p.get("region", "NA1") for p in tracked_players}


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


def safe_request(url, params=None):
    while True:
        try:
            r = requests.get(url, headers={"X-Riot-Token": RIOT_API_KEY}, params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.HTTPError:
            if r.status_code == 429:
                logger.warning("Rate limit exceeded (429). Waiting 20 seconds before retrying...")
                time.sleep(20)
            else:
                logger.exception("HTTP error")
                raise
        except requests.exceptions.RequestException as e:
            logger.warning("Network error: %s", e)
            time.sleep(10)


def sanity_check(collection):
    pipeline = [
        {"$group": {"_id": {"puuid": "$puuid", "matchId": "$matchId"}, "count": {"$sum": 1}, "ids": {"$push": "$_id"}}},
        {"$match": {"count": {"$gt": 1}}}
    ]
    duplicates = list(collection.aggregate(pipeline))
    logger.info("Found %d duplicate (puuid, matchId) combinations.", len(duplicates))
    for dup in duplicates:
        logger.info("Duplicate pair: %s -- Document IDs: %s", dup["_id"], dup["ids"])


def match_id_exists(match_id, puuid):
    return matches_collection.count_documents({"matchId": match_id, "puuid": puuid}, limit=1) > 0


def get_match_ids(puuid, region, start=0, count=20):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": start, "count": count, "startTime": cutoffDate, "endTime": END_DATE}
    return safe_request(url, params=params)


def get_match_data(match_id, region):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    return safe_request(url)


def get_timeline_data(match_id, region):
    R = get_routing_region(region)
    url = f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
    return safe_request(url)


def extract_match_stats(match_data, timeline_data, puuid):
    participant = next(p for p in match_data["info"]["participants"] if p["puuid"] == puuid)
    participant_id = participant["participantId"]
    team_id_raw = participant["teamId"]
    teams = match_data.get("info", {}).get("teams", [])
    team = next((t for t in teams if t.get("teamId") == team_id_raw), {})
    objectives = team.get("objectives", {})

    ping_keys = [
        "allInPings", "assistMePings", "enemyMissingPings", "enemyVisionPings",
        "getBackPings", "needVisionPings", "onMyWayPings", "pushPings",
    ]
    pings = {k: participant.get(k, 0) for k in ping_keys}

    dragon_types = []
    for frame in timeline_data.get("info", {}).get("frames", []):
        for event in frame.get("events", []):
            if event.get("type") == "ELITE_MONSTER_KILL" and event.get("monsterType") == "DRAGON" and event.get("killerId") == participant_id:
                dragon_types.append(event.get("monsterSubType", "UNKNOWN"))

    deaths = participant.get("deaths", 0)
    kda = round((participant.get("kills", 0) + participant.get("assists", 0)) / max(1, deaths), 2)

    return {
        "matchId": match_data["metadata"]["matchId"],
        "champion": participant.get("championName", ""),
        "riotIdGameName": participant.get("riotIdGameName", ""),
        "riotIdTagline": participant.get("riotIdTagline", ""),

        "kills": participant.get("kills", 0),
        "deaths": participant.get("deaths", 0),
        "assists": participant.get("assists", 0),

        "win": participant.get("win", False),

        "magicDamageTaken": participant.get("magicDamageTaken", 0),
        "physicalDamageTaken": participant.get("physicalDamageTaken", 0),
        "trueDamageTaken": participant.get("trueDamageTaken", 0),

        "magicDamageDealt": participant.get("magicDamageDealtToChampions", 0),
        "physicalDamageDealt": participant.get("physicalDamageDealtToChampions", 0),
        "trueDamageDealt": participant.get("trueDamageDealtToChampions", 0),

        "timeCCingOthers": participant.get("timeCCingOthers", 0),
        "kda": kda,
        "position": participant.get("teamPosition", ""),

        "cs": participant.get("totalMinionsKilled", 0),
        "jungleCs": participant.get("neutralMinionsKilled", 0),
        "visionScore": participant.get("visionScore", 0),

        "killingSprees": participant.get("killingSprees", 0),
        "timeSpentDead": participant.get("totalTimeSpentDead", 0),
        "turretKills": participant.get("turretKills", 0),
        "towerTakedowns": participant.get("challenges", {}).get("turretTakedowns", 0),
        "inhibitors": objectives.get("inhibitor", {}).get("kills", 0),
        "towers": objectives.get("tower", {}).get("kills", 0),
        "pings": pings,
        "epicMonsters": {
            "barons": objectives.get("baron", {}).get("kills", 0),
            "dragons": objectives.get("dragon", {}).get("kills", 0),
            "riftHeralds": objectives.get("riftHerald", {}).get("kills", 0),
            "dragonTypes": dragon_types,
            "voidGrubs": objectives.get("horde", {}).get("kills", 0),
            "atakhan": objectives.get("atakhan", {}).get("kills", 0),
        },
        "gameEndedInEarlySurrender": participant.get("gameEndedInEarlySurrender", False),
        "gameEndedInSurrender": participant.get("gameEndedInSurrender", False),
    }


def get_kill_death_positions(match_data, timeline_data, puuid, queue_id):
    target_queues = [400, 420, 430, 440, 480, 490]
    if queue_id not in target_queues:
        return {"kills": [], "deaths": []}

    participant = next(p for p in match_data["info"]["participants"] if p["puuid"] == puuid)
    participant_id = participant["participantId"]

    kills, deaths = [], []
    for frame in timeline_data.get("info", {}).get("frames", []):
        for event in frame.get("events", []):
            if event.get("type") == "CHAMPION_KILL":
                if event.get("killerId") == participant_id:
                    kills.append(event.get("position", {}))
                if event.get("victimId") == participant_id:
                    deaths.append(event.get("position", {}))
    return {"kills": kills, "deaths": deaths}


def store_match(match_data, timeline_data):
    match_id = match_data["metadata"]["matchId"]
    participants = match_data["info"]["participants"]
    queue_id = match_data["info"].get("queueId", -1)

    game_created_ms = match_data["info"].get("gameCreation", 0)
    match_info = {
        "matchId": match_id,
        "gameCreated": datetime.fromtimestamp(game_created_ms / 1000, tz=timezone.utc),
        "gameDuration": match_data["info"].get("gameDuration", 0),
        "teams": {
            "blue": [p["puuid"] for p in participants if p["teamId"] == 100],
            "red": [p["puuid"] for p in participants if p["teamId"] == 200],
        },
        "gameType": match_data["info"].get("gameType", "Unknown"),
    }

    num_logged_players = 0
    for player in participants:
        puuid = player["puuid"]

        if puuid not in tracked_puuids:
            continue

        if match_id_exists(match_id, puuid):
            continue

        num_logged_players += 1

        stats = extract_match_stats(match_data, timeline_data, puuid)
        locations = get_kill_death_positions(match_data, timeline_data, puuid, queue_id)

        doc = {
            "puuid": puuid,
            "matchId": match_id,
            "queueId": queue_id,
            "status": "done",
            "team": "blue" if player["teamId"] == 100 else "red",
            "stats": stats,
            "locations": locations,
            "matchInfo": match_info,
        }

        matches_collection.update_one(
            {"matchId": match_id, "puuid": puuid},
            {"$set": doc},
            upsert=True
        )

        player_collection.update_one(
            {"puuid": puuid},
            {"$inc": {"totalMatches": 1, "processedMatches": 1}}
        )

    logger.info("Stored match %s for %d players", match_id, num_logged_players)


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

    logger.info("Starting Riot match sync for DB '%s'...", DB_NAME)

    version = None
    try:
        version = requests.get("https://ddragon.leagueoflegends.com/api/versions.json", timeout=10).json()[0]
    except Exception:
        logger.warning("Couldn't fetch ddragon version; icon links won't be updated this run.")

    num_processed = 0

    for user_puuid in tracked_puuids:
        region = puuid_region.get(user_puuid, "NA1")
        offset = 0
        count = 100

        # Update icon and level (platform region, not routing region)
        try:
            r = requests.get(
                f"https://{region.upper()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{user_puuid}",
                headers={"X-Riot-Token": RIOT_API_KEY},
                timeout=30,
            )
            r.raise_for_status()
            summoner_data = r.json()

            level = summoner_data.get("summonerLevel")
            profile_icon_id = summoner_data.get("profileIconId")

            update_fields = {"level": level}
            if version:
                update_fields["icon"] = f"https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{profile_icon_id}.png"

            player_collection.update_one({"puuid": user_puuid}, {"$set": update_fields})
            logger.info("Updated %s: level %s, icon %s", user_puuid, level, profile_icon_id)

        except requests.exceptions.RequestException as e:
            logger.warning("Failed to update %s: %s", user_puuid, e)

        while True:
            match_ids = get_match_ids(user_puuid, region, start=offset, count=count)
            if not match_ids:
                logger.info("No more matches found for %s.", user_puuid)
                break

            for match_id in match_ids:
                if match_id_exists(match_id, user_puuid):
                    logger.info("Match %s already found from another query. Skipping.", match_id)
                    continue

                try:
                    match_data = get_match_data(match_id, region)
                    timeline_data = get_timeline_data(match_id, region)

                    store_match(match_data, timeline_data)

                    num_processed += 1
                    time.sleep(1)

                except Exception as e:
                    logger.exception("Error fetching match %s: %s", match_id, e)
                    time.sleep(1)

            offset += count

    sanity_check(matches_collection)

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as fh:
            fh.write(f"num_matches={num_processed}\n")
    else:
        logger.info("GITHUB_OUTPUT not present; running locally.")
        with open("local-github-output.txt", "w", encoding="utf-8") as fh:
            fh.write(f"num_matches={num_processed}\n")