import os
from datetime import datetime, timezone
from math import floor
from random import sample
from pymongo import MongoClient

MONGO_URI = os.environ["MONGO_URI"]
WRAP_YEAR = int(os.environ.get("WRAP_YEAR", "2026"))
POOL_SIZE = int(os.environ.get("SPOTLIGHT_POOL_SIZE", "30"))
MIN_HOURS_PLAYED = int(os.environ.get("SPOTLIGHT_MIN_HOURS", "50"))

client = MongoClient(MONGO_URI)
db = client["rifting-wrapped"]

player_collection = db["tracked-players"]
matches_collection = db[f"matches-{WRAP_YEAR % 100:02d}"]
cache_collection = db["spotlight-cache"]


def build_spotlight_pool():
    # Only target up-to-date players
    done_players = list(player_collection.aggregate([
        {"$match": {"status": "done"}},
        {"$project": {"_id": 0, "displayName": 1, "icon": 1, "puuid": 1}},
    ]))
    done_puuids = [p["puuid"] for p in done_players]

    if not done_puuids:
        return []

    # Filter for playtime
    playtime_results = matches_collection.aggregate([
        {"$match": {"puuid": {"$in": done_puuids}}},
        {"$group": {"_id": "$puuid", "totalPlaytime": {"$sum": "$matchInfo.gameDuration"}}},
    ])

    min_seconds = MIN_HOURS_PLAYED * 3600
    playtime_by_puuid = {
        doc["_id"]: doc["totalPlaytime"]
        for doc in playtime_results
        if doc["totalPlaytime"] >= min_seconds
    }

    # Sample
    qualified_players = [p for p in done_players if p["puuid"] in playtime_by_puuid]
    sampled_players = sample(qualified_players, min(POOL_SIZE, len(qualified_players)))
    puuids = [p["puuid"] for p in sampled_players]

    if not puuids:
        return []

    # Precompute other stats
    champ_results = matches_collection.aggregate([
        {"$match": {"puuid": {"$in": puuids}}},
        {"$group": {"_id": {"puuid": "$puuid", "champ": "$stats.champion"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])

    top_champ_by_puuid = {}
    for doc in champ_results:
        puuid = doc["_id"]["puuid"]
        if puuid not in top_champ_by_puuid:
            top_champ_by_puuid[puuid] = doc["_id"]["champ"]

    cards = []
    for player in sampled_players:
        puuid = player["puuid"]
        champ_name = top_champ_by_puuid.get(puuid)
        playtime = playtime_by_puuid.get(puuid)

        if not champ_name:
            continue

        cards.append({
            "username": player.get("displayName"),
            "icon": player.get("icon"),
            "hoursPlayed": str(floor(playtime / 3600)),
            "champName": champ_name,
            "shareUrl": f"/player/{puuid}",
        })

    return cards


def main():
    cards = build_spotlight_pool()

    cache_collection.update_one(
        {"_id": f"spotlight-{WRAP_YEAR}"},
        {"$set": {
            "cards": cards,
            "updatedAt": datetime.now(timezone.utc),
            "year": WRAP_YEAR,
        }},
        upsert=True,
    )

    print(f"Cached {len(cards)} spotlight cards for {WRAP_YEAR}")


if __name__ == "__main__":
    main()