import requests
from pymongo import MongoClient, ASCENDING
import time
from datetime import datetime
import os
from dotenv import load_dotenv
from pymongo.errors import DuplicateKeyError
import time

load_dotenv(".env")

API_KEY = os.getenv("REACT_APP_API_KEY") 
MONGO_URI_SECRET = os.getenv("MONGO_URI") 






# cutoffDate = 1735689600 # Jan 1st, 2025
# cutoffDate = 1754022272

# Current time minus 2 hours for batched jobs
cutoffDate = int(time.time()) - (2 * 60 * 60)



client = MongoClient(MONGO_URI_SECRET)
db = client["rifting-wrapped-2024"]
matches_collection = db["player-matches"]
player_collection = db["tracked-players"]

tracked_puuids = [doc['puuid'] for doc in player_collection.find({}, {'puuid': 1, '_id': 0})]



def safe_request(url, params=None):
    while True:
        try:
            r = requests.get(url, headers={"X-Riot-Token": API_KEY}, params=params)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.HTTPError as e:
            if r.status_code == 429:
                print("Rate limit exceeded (429). Waiting 20 seconds before retrying...")
                time.sleep(20)
            else:
                print(f"HTTP error: {e}")
                raise
        except requests.exceptions.RequestException as e:
            print(f"Network error: {e}")
            time.sleep(10)

def sanity_check(collection):
    pipeline = [
        {
            "$group": {
                "_id": {"puuid": "$puuid", "matchId": "$matchId"},
                "count": {"$sum": 1},
                "ids": {"$push": "$_id"}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        }
    ]

    duplicates = list(collection.aggregate(pipeline))

    print(f"Found {len(duplicates)} duplicate (puuid, matchId) combinations.")

    for dup in duplicates:
        print(f"\nDuplicate pair: {dup['_id']}")
        print(f"Document IDs: {dup['ids']}")



def match_id_exists(match_id, puuid):
    return matches_collection.count_documents({"matchId": match_id, "puuid":puuid}, limit=1) > 0

def get_match_ids(puuid, start=0, count=20):
    url = f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": start, "count": count, "startTime": cutoffDate}
    return safe_request(url, params=params)

def get_match_data(match_id):
    url = f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"
    return safe_request(url)

def get_timeline_data(match_id):
    url = f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
    return safe_request(url)




# Get stats related to the user's gameplay in this match
def extract_match_stats(match_data, timeline_data, puuid):
    participant = next(p for p in match_data["info"]["participants"] if p["puuid"] == puuid)
    participant_id = participant["participantId"]
    team_id = int((participant["teamId"] / 100) - 1)
    teams = match_data.get("info", {}).get("teams", [])
    objectives = teams[team_id].get("objectives", {}) if team_id < len(teams) else {}
    
    ping_keys = [
        "allInPings",
        "assistMePings",
        "enemyMissingPings",
        "enemyVisionPings",
        "getBackPings",
        "needVisionPings",
        "onMyWayPings",
        "pushPings",
    ]

    pings = {k: participant.get(k, 0) for k in ping_keys}

    dragon_types = []
    for frame in timeline_data.get("info", {}).get("frames", []):
        for event in frame.get("events", []):
            if (event.get("type") == "ELITE_MONSTER_KILL"
                and event.get("monsterType") == "DRAGON"
                and event.get("killerId") == participant_id):
                dragon_types.append(event.get("monsterSubType", "UNKNOWN"))

    deaths = participant.get("deaths", 0)
    kda = round((participant.get("kills", 0) + participant.get("assists", 0)) / max(1, deaths), 2)

    return {
        "matchId": match_data["metadata"]["matchId"],
        "champion": participant.get("championName", ""),
        "riotIdGameName": participant.get("riotIdGameName", ""),
        "riotIdTagline": participant.get("riotIdTagline", ""),

        "kills":participant.get("kills", 0),
        "deaths":participant.get("deaths", 0),
        "assists":participant.get("assists", 0),

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
        "towers":objectives.get("tower", {}).get("kills", 0),
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


# Get position of player's kills and deaths on the map
def get_kill_death_positions(match_data, timeline_data, puuid, queue_id):
    target_queues = [400, 420, 430, 440, 480, 490]
    if(queue_id not in target_queues):
        return {
        "kills": [],
        "deaths": []
    }

    # Find participantId of the player
    participant = next(p for p in match_data["info"]["participants"] if p["puuid"] == puuid)
    participant_id = participant["participantId"]

    kills = []
    deaths = []

    for frame in timeline_data.get("info", {}).get("frames", []):
        for event in frame.get("events", []):
            if event.get("type") == "CHAMPION_KILL":

                if event.get("killerId") == participant_id:
                    kills.append(
                        event.get("position", {}),
                    )

                if event.get("victimId") == participant_id:
                    deaths.append(
                        event.get("position", {}),
                    )
    return {
        "kills": kills,
        "deaths": deaths
    }



def store_match(match_data, timeline_data):
    match_id = match_data['metadata']['matchId']
    participants = match_data['info']['participants']

    queue_id = match_data["info"].get("queueId", -1)

    match_info = {
        "matchId": match_id,
        "gameCreated": datetime.fromtimestamp(match_data["info"].get("gameCreation", 0) / 1000),
        "gameDuration": match_data["info"].get("gameDuration", 0),
        "teams": {
            "blue": [p['puuid'] for p in participants if p['teamId'] == 100],
            "red": [p['puuid'] for p in participants if p['teamId'] == 200]
        },
        "gameType": match_data["info"].get("gameType", "Unknown"),
    }

    num_logged_players = 0
    for player in participants:
        puuid = player['puuid']

        # Skip logging for tracked players and already logged matches
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
            "queueId":queue_id,
            "team": "blue" if player['teamId'] == 100 else "red",
            "stats": stats,
            "locations": locations,
            "matchInfo": match_info
        }

        # Upsert to avoid dupes
        matches_collection.update_one(
            {"matchId": match_id, "puuid": puuid},
            {"$set": doc},
            upsert=True
        )

        print(f"Stored match {match_id} for {num_logged_players} players")




if __name__ == "__main__":
    try:
        matches_collection.create_index(
            [("puuid", ASCENDING), ("matchId", ASCENDING)],
            unique=True,
            name="unique_puuid_matchId"
        )
        print("Unique compound index created successfully.")
    except DuplicateKeyError as e:
        print("Duplicate keys found! Clean up duplicates before creating the index.")
        print(e)
        
    print("Starting Riot match sync...")

    version = requests.get("https://ddragon.leagueoflegends.com/api/versions.json").json()[0]
    

    for user_puuid in tracked_puuids:
        offset = 0
        count = 100

        # Update icon and level
        try:
            r = requests.get(
                f'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{user_puuid}',
                headers={"X-Riot-Token": API_KEY}
            )
            r.raise_for_status()
            summoner_data = r.json()


            level = summoner_data.get('summonerLevel')
            profile_icon_id = summoner_data.get('profileIconId')

            result = player_collection.update_one(
                {"puuid": user_puuid},
                {
                    "$set": {
                        "level": level,
                        "icon": f'https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{profile_icon_id}.png',
                    }
                }
            )

            print(f"Updated {user_puuid}: level {level}, icon {profile_icon_id}")

        except requests.exceptions.RequestException as e:
            print(f"Failed to update {user_puuid}: {e}")


        while True:
            match_ids = get_match_ids(user_puuid, start=offset, count=count)
            if not match_ids:
                print("No more matches found.")
                break

            for match_id in match_ids:

                if match_id_exists(match_id, user_puuid):
                    print(f"  Match {match_id} already found from another query. Skipping.")
                    continue

                try:
                    match_data = get_match_data(match_id)
                    timeline_data = get_timeline_data(match_id)

                    store_match(match_data, timeline_data)
                    time.sleep(1) 

                except Exception as e:
                    print(f"Error fetching match {match_id}: {e}")
                    time.sleep(1)

            offset += count
    
    sanity_check(matches_collection)


