"""
Builds the public week and year leaderboards and stores them in
leaderboard-cache, so GET /leaderboards reads one document instead of
scanning the match collection. Runs hourly with the spotlight precompute.
"""
import os
import sys

from pymongo import MongoClient

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask"))
from leaderboards import store_leaderboards  # noqa: E402  (shared with the API)

WRAP_YEAR = int(os.environ.get("WRAP_YEAR") or "2026")


def main():
    db = MongoClient(os.environ["MONGO_URI"])["rifting-wrapped"]
    for period in ("week", "year"):
        payload = store_leaderboards(db, period, WRAP_YEAR)
        print(f"Cached {period} leaderboard ({len(payload['boards']['games'])} players on the games board)")


if __name__ == "__main__":
    main()
