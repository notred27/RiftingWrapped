"""Run: python backend/actions/test_spotlight.py (or pytest). Needs no database."""
import os
from datetime import datetime, timedelta, timezone
from unittest import mock

os.environ.setdefault("MONGO_URI", "mongodb://localhost:1")   # MongoClient connects lazily; never used

import precompute_spotlight as spotlight


def run(updated_ago, force=False):
    cache = mock.Mock()
    cache.find_one.return_value = {"updatedAt": datetime.now(timezone.utc) - updated_ago} if updated_ago else None
    with mock.patch.object(spotlight, "cache_collection", cache), \
         mock.patch.object(spotlight, "FORCE", force), \
         mock.patch.object(spotlight, "build_spotlight_pool", return_value=[]) as build:
        spotlight.main()
    return build.called


def test_rebuilds_at_most_daily_unless_forced():
    assert not run(timedelta(hours=3))
    assert run(timedelta(hours=25))
    assert run(None)                                  # no cache yet
    assert run(timedelta(hours=3), force=True)        # manual run


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("spotlight tests passed")
