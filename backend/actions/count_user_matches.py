from dotenv import load_dotenv
from pymongo import MongoClient
import os


load_dotenv(".env")

API_KEY = os.getenv("REACT_APP_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "rifting-wrapped-2024")

# DB collections
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
matches_collection = db["player-matches"]
player_collection = db["tracked-players"]
dlq_collection = db.get_collection("producer-dlq")


puuid = "diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"

pipeline = [
    {"$match": {"puuid": puuid}},
    {"$group": {"_id": "$status", "count": {"$sum": 1}}}
]

res = list(matches_collection.aggregate(pipeline))
counts = {doc["_id"]: doc["count"] for doc in res}
pending = counts.get("pending", 0)
done = counts.get("done", 0)

print(f"PUUID {puuid}: done={done}, pending={pending}")

