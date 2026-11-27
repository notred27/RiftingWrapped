"""
Builds the public week and year leaderboards and stores them in
leaderboard-cache, so GET /leaderboards reads one document instead of
scanning the match collection. Runs with the spotlight precompute, and the
match consumer calls refresh_leaderboards() hourly while it runs (GitHub
starts the "hourly" schedule only every 6-11 hours).
"""
import os
import sys

from pymongo import MongoClient

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask"))
from leaderboards import store_leaderboards  # noqa: E402  (shared with the API)

WRAP_YEAR = int(os.environ.get("WRAP_YEAR") or "2026")


def refresh_leaderboards(db, year: int = WRAP_YEAR):
    for period in ("week", "year"):
        payload = store_leaderboards(db, period, year)
        print(f"Cached {period} leaderboard ({len(payload['boards']['games'])} players on the games board)")


if __name__ == "__main__":
    refresh_leaderboards(MongoClient(os.environ["MONGO_URI"])["rifting-wrapped"])
