"""
One-off: rename every stored match's `stats` fields to the short names in
backend/flask/stat_fields.py (e.g. stats.physicalDamageDealt -> stats.pdd),
which cuts each matches-YY document by ~40%.

Run it right after deploying the code that reads and writes short names: until
then the API reads names the documents don't have yet. Each batch is one
server-side update and a document is only picked up while it has no short
names, so it's safe to stop and re-run.

Dry run by default (counts what it would change). `--apply` writes.

    python backend/actions/shorten_stat_names.py           # dry run
    python backend/actions/shorten_stat_names.py --apply
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask"))
from stat_fields import STAT_FIELDS  # noqa: E402

load_dotenv(Path(__file__).resolve().parent / ".env")

BATCH = 5000
# Long-named documents: they have stats but not the short champion field.
NOT_DONE = {"stats": {"$exists": True}, "stats.ch": {"$exists": False}}


def short_stats_expr() -> dict:
    """Aggregation expression building the short-named stats from the long-named ones."""
    expr = {}
    for long, entry in STAT_FIELDS.items():
        if isinstance(entry, tuple):
            short, sub = entry
            expr[short] = {s: f"$stats.{long}.{l}" for l, s in sub.items()}
        else:
            expr[entry] = f"$stats.{long}"
    return expr   # fields missing from a document are left out, not set to null


def rename_pipeline(expr: dict) -> list:
    # Setting an object literal on an existing sub-document merges into it (the
    # long names would stay), so build it aside and assign it by reference.
    return [{"$set": {"_shortStats": expr}}, {"$set": {"stats": "$_shortStats"}}, {"$unset": "_shortStats"}]


def migrate(matches) -> int:
    expr, done = short_stats_expr(), 0
    while True:
        ids = [d["_id"] for d in matches.find(NOT_DONE, {"_id": 1}).limit(BATCH)]
        if not ids:
            return done
        done += matches.update_many({"_id": {"$in": ids}, **NOT_DONE}, rename_pipeline(expr)).modified_count
        print(f"  {done} documents renamed")


def main():
    apply = "--apply" in sys.argv
    year = int(os.getenv("WRAP_YEAR", "2026"))
    db = MongoClient(os.environ["MONGO_URI"])[os.getenv("DB_NAME", "rifting-wrapped")]
    matches = db[f"matches-{year % 100:02d}"]
    print(f"{matches.count_documents(NOT_DONE)} documents with long stat names in {matches.name}")
    if apply:
        migrate(matches)
        print(f"{matches.count_documents(NOT_DONE)} left")


if __name__ == "__main__":
    main()
