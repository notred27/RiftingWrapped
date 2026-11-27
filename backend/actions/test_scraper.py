"""Run: python backend/actions/test_scraper.py (or pytest). Needs no database."""
import importlib
import os
from unittest import mock

os.environ.setdefault("RIOT_API_KEY", "test")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:1")

with mock.patch("pymongo.MongoClient") as client:      # the script reads run history and players on import
    client.return_value.__getitem__.return_value.__getitem__.return_value.find_one.return_value = None
    client.return_value.__getitem__.return_value.__getitem__.return_value.find.return_value = []
    scraper = importlib.import_module("fetch-and-store")


def test_scan_region_skips_stored_matches_and_counts_failures():
    matches = mock.Mock()
    matches.find.return_value = [{"matchId": "EUW1_1"}]                 # already stored
    pages = {0: ["EUW1_1", "EUW1_2", "EUW1_3"], 100: []}
    rift = {"metadata": {"matchId": "EUW1_2"}, "info": {"queueId": 420, "participants": []}}

    def riot(method, url, params=None):
        if url.endswith("/ids"):
            return pages[params["start"]]
        if url.endswith("EUW1_3"):
            raise RuntimeError("503")
        return rift if url.endswith("EUW1_2") else {}

    with mock.patch.object(scraper, "matches_collection", matches), \
         mock.patch.object(scraper.RiotSession, "safe_request", side_effect=riot) as calls, \
         mock.patch.object(scraper, "store_match") as store:
        stored, failed = scraper.scan_region([("p1", "EUW1")])
    assert (stored, failed) == (1, 1)
    assert store.call_count == 1
    assert sum("europe.api.riotgames.com" in c.args[1] for c in calls.call_args_list) == calls.call_count


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("scraper tests passed")
