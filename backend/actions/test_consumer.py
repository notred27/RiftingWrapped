"""Run: python backend/actions/test_consumer.py (or pytest). Needs no database."""
import os
from unittest import mock

os.environ.setdefault("REACT_APP_API_KEY", "test")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:1")   # MongoClient connects lazily; never used

import match_consumer


def claimed_filter(routing):
    coll = mock.Mock()
    with mock.patch.object(match_consumer, "CONSUMER_ROUTING", routing), \
         mock.patch.object(match_consumer, "matches_collection", coll):
        match_consumer.Consumer.process_next_match(None)
    return coll.find_one_and_update.call_args.args[0]


def test_unset_routing_claims_everything():
    assert claimed_filter(None) == {"status": "pending"}


def test_europe_claims_only_european_platforms():
    f = claimed_filter("europe")
    assert f["status"] == "pending" and set(f["region"]["$in"]) == {"EUN1", "EUW1", "TR1", "RU", "ME1"}


def test_americas_also_claims_missing_and_unknown_regions():
    f = claimed_filter("americas")
    others = set(f["region"]["$nin"])
    assert "NA1" not in others and "EUW1" in others and "KR" in others and "OC1" in others
    # $nin matches docs without a region field, which the consumer treats as NA1.


def test_every_platform_has_exactly_one_runner():
    for platforms in match_consumer.MATCH_ROUTING.values():
        for p in platforms:
            owners = [r for r in match_consumer.MATCH_ROUTING
                      if p in claimed_filter(r)["region"].get("$in", [])
                      or ("$nin" in claimed_filter(r)["region"] and p not in claimed_filter(r)["region"]["$nin"])]
            assert len(owners) == 1, (p, owners)


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("consumer tests passed")
