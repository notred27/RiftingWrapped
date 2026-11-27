"""Run: python backend/flask/test_queue.py (or pytest). Needs no database."""
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api

api.app.config["RATELIMIT_ENABLED"] = False
api.limiter.enabled = False
client = api.app.test_client()

# Already grouped and sorted, as the aggregate returns them.
ROWS = [
    {"_id": "na-amy", "remaining": 40, "region": "NA1"},
    {"_id": "eu-ben", "remaining": 10, "region": "EUW1"},
    {"_id": "old-cat", "remaining": 5},                  # no region: the consumer treats it as NA1
    {"_id": "eu-dan", "remaining": 20, "region": "EUN1"},
]


def queue(puuid, runs):
    api._queue_cache.clear()
    matches, runs_coll = mock.Mock(), mock.Mock()
    matches.aggregate.return_value = ROWS
    runs_coll.aggregate.return_value = runs
    with mock.patch.object(api, "get_matches_collection", return_value=matches), \
         mock.patch.object(api, "db", {"consumer-runs": runs_coll}):
        return client.get(f"/users/{puuid}/queue?year=2026").get_json()


def test_players_in_different_regions_each_lead_their_own_line():
    runs = [{"_id": "europe", "processed": 100, "busy": 100}, {"_id": "americas", "processed": 50, "busy": 100}]
    eu = queue("eu-ben", runs)
    assert eu["position"] == 1 and eu["matchesAhead"] == 0 and eu["queueLength"] == 2
    na = queue("na-amy", runs)
    assert na["position"] == 1 and na["queueLength"] == 2

    # Rate comes from each player's own region: 1/s * 0.85 for europe, 0.5/s * 0.85 for americas.
    dan = queue("eu-dan", runs)
    assert dan["position"] == 2 and dan["matchesAhead"] == 10
    assert dan["estimatedMinutes"] == 1                  # 30 matches / 0.85 per s ~ 35 s
    cat = queue("old-cat", runs)
    assert cat["position"] == 2 and cat["matchesAhead"] == 40
    assert cat["estimatedMinutes"] == 2                  # 45 / 0.425 ~ 106 s


def test_runs_without_routing_count_for_every_region_and_none_means_no_estimate():
    assert queue("eu-dan", [{"_id": "all", "processed": 85, "busy": 100}])["estimatedMinutes"] == 1
    assert queue("eu-dan", [{"_id": "americas", "processed": 50, "busy": 100}])["estimatedMinutes"] is None
    assert queue("nobody", [])["inQueue"] is False


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("queue tests passed")
