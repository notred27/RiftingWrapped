"""
One-off: move raw kill/death positions still on matches-YY documents into the
players' grids (player-locations-YY), then drop the raw field.

468 matches-26 documents were written on 2026-11-19 by a run still on the
pre-grid code, so they kept `locations` and were never added to any grid.

Dry run by default (prints what it would add). `--apply` writes.
Each document's `locations` is removed in the same atomic step that reads it,
so a re-run or a crash part way can never add a match to a grid twice (a crash
between the two writes loses at most that one match's positions).

    python backend/actions/fold_raw_locations.py           # dry run
    python backend/actions/fold_raw_locations.py --apply
"""

import os
import sys
from collections import Counter
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

from match_doc import add_to_player_grid, player_locations_inc, player_locations_name

load_dotenv(Path(__file__).resolve().parent / ".env")


def fold(matches, grids) -> Counter:
    """Fold every document with raw `locations` into its player's grid. Returns events added per player."""
    added = Counter()
    while True:
        # Read and remove in one step: this match can't be folded twice.
        doc = matches.find_one_and_update(
            {"locations": {"$exists": True}},
            {"$unset": {"locations": ""}},
            projection={"puuid": 1, "locations": 1},
        )
        if doc is None:
            break
        add_to_player_grid(grids, doc["puuid"], doc["locations"])
        added[doc["puuid"]] += sum(player_locations_inc(doc["locations"]).values())
    return added


def dry_run(matches) -> Counter:
    added = Counter()
    for doc in matches.find({"locations": {"$exists": True}}, {"puuid": 1, "locations": 1}):
        added[doc["puuid"]] += sum(player_locations_inc(doc["locations"]).values())
    return added


def main():
    apply = "--apply" in sys.argv
    year = int(os.getenv("WRAP_YEAR", "2026"))
    db = MongoClient(os.environ["MONGO_URI"])[os.getenv("DB_NAME", "rifting-wrapped")]
    matches = db[f"matches-{year % 100:02d}"]
    grids = db[player_locations_name(year)]

    print(f"{matches.count_documents({'locations': {'$exists': True}})} documents with raw locations")
    added = fold(matches, grids) if apply else dry_run(matches)
    for puuid, n in added.items():
        print(f"  {puuid[:12]}...  {n} kill/death events {'added' if apply else 'would be added'}")
    if apply:
        print(f"{matches.count_documents({'locations': {'$exists': True}})} documents with raw locations left")


if __name__ == "__main__":
    main()
