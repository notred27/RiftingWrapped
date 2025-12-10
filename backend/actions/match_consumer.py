# consumer.py
import os
import time
import logging
from datetime import datetime, timezone
from typing import Optional

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

load_dotenv(".env")

API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "rifting-wrapped-2024")

REQUESTS_PER_SECOND = float(os.getenv("REQUESTS_PER_SECOND", "10.0"))
MAX_RETRIES = 5
BACKOFF_BASE = 2.0

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
matches_collection = db["player-matches"]
player_collection = db["tracked-players"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("consumer")


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

    TARGET_QUEUES = [400, 420, 430, 440, 480, 490]

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
        matches_collection.update_one({"_id": match["_id"]}, {"$set": {"status": "processing"}})
        return match

    def extract_match_stats(self, match_data: dict, timeline_data: dict, puuid: str) -> dict:
        participant = next(p for p in match_data["info"]["participants"] if p["puuid"] == puuid)
        participant_id = participant["participantId"]
        team_id = int((participant["teamId"] / 100) - 1)
        teams = match_data.get("info", {}).get("teams", [])
        objectives = teams[team_id].get("objectives", {}) if team_id < len(teams) else {}

        ping_keys = [
            "allInPings", "assistMePings", "enemyMissingPings", "enemyVisionPings",
            "getBackPings", "needVisionPings", "onMyWayPings", "pushPings"
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

    def get_kill_death_positions(self, match_data: dict, timeline_data: dict, puuid: str, queue_id: int) -> dict:
        if queue_id not in self.TARGET_QUEUES:
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

    def process_match(self, match_doc: dict):
        match_id = match_doc["matchId"]
        puuid = match_doc["puuid"]
        region = match_doc.get("region", "NA1")
        try:
            R = get_routing_region(region)
            match_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}")
            timeline_data = self.rs.safe_request("GET", f"https://{R}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline")

            queue_id = match_data["info"].get("queueId", -1)
            stats = self.extract_match_stats(match_data, timeline_data, puuid)
            locations = self.get_kill_death_positions(match_data, timeline_data, puuid, queue_id)

            matches_collection.update_one(
                {"_id": match_doc["_id"]},
                {"$set": {
                    "status": "done",
                    "stats": stats,
                    "locations": locations,
                    "match_data": match_data,
                    "timeline_data": timeline_data,
                    # "processed_at": datetime.now(timezone.utc)
                }}
            )

            player_collection.update_one({"puuid": puuid}, {"$inc": {"processedMatches": 1}})
            logger.info("Processed match %s for player %s", match_id, puuid)


            remaining = matches_collection.count_documents({
                            "puuid": puuid,
                            "status": {"$in": ["pending", "processing"]}
                        })

            if remaining == 0:
                # Only set to done if the player was in "counting" state (avoids overwriting other states).
                player_collection.update_one(
                    {"puuid": puuid, "status": "counting"},
                    {"$set": {"status": "done", "countingFinishedAt": datetime.now(timezone.utc)}}
                )
                logger.info("Player %s has no remaining matches — set status to 'done'", puuid)

        except Exception as e:
            logger.exception("Failed to process match %s: %s", match_id, e)
            matches_collection.update_one({"_id": match_doc["_id"]}, {"$set": {"status": "failed", "error": str(e)}})

    def run(self):
        num_processed = 0
        while True:
            match_doc = self.process_next_match()
            if not match_doc:
                logger.info("No pending matches. Stopping this job")
            
                github_output = os.environ.get("GITHUB_OUTPUT")
                if github_output:
                    with open(github_output, "a", encoding="utf-8") as fh:
                        fh.write(f"num_matches={num_processed}\n")
                else:

                    print("GITHUB_OUTPUT not present; running locally.")
                    with open("local-github-output.txt", "w", encoding="utf-8") as fh:
                        fh.write(f"num_matches={num_processed}\n")
                break


            self.process_match(match_doc)
            num_processed += 1



if __name__ == "__main__":
    consumer = Consumer(API_KEY)
    consumer.run()
