"""Run: python backend/actions/test_match_doc.py (or pytest)."""
from unittest import mock

import requests

from datetime import datetime, timezone

from match_doc import GRID_SIZE, cell_index, player_locations_inc, riot_id_update
from riot import RiotSession, get_routing_region


def test_cell_index_corners_and_clamping():
    assert cell_index(0, 0) == 0
    assert cell_index(14999, 14999) == GRID_SIZE * GRID_SIZE - 1
    assert cell_index(15000, 0) == GRID_SIZE - 1        # right edge clamps into the grid
    assert cell_index(-50, 99999) == (GRID_SIZE - 1) * GRID_SIZE
    assert cell_index(None, 5) is None


def test_player_locations_inc_counts_and_skips_missing():
    inc = player_locations_inc({
        "kills": [{"x": 0, "y": 0}, {"x": 10, "y": 10}, {"x": None, "y": 3}],
        "deaths": [{"x": 14999, "y": 14999}],
    })
    assert inc == {"kills.0": 2, f"deaths.{GRID_SIZE * GRID_SIZE - 1}": 1}
    assert player_locations_inc({"kills": [], "deaths": []}) == {}


def test_riot_id_update_only_replaces_older_names():
    match = {"info": {"gameCreation": 1_764_000_000_000}}
    query, update = riot_id_update(match, {"puuid": "P1", "riotIdGameName": "jar", "riotIdTagline": "oaks"})
    seen = datetime.fromtimestamp(1_764_000_000, timezone.utc)
    assert update == {"$set": {"displayName": "jar", "tag": "oaks", "name_seen_at": seen}}
    # Only matches a record whose name came from an earlier game (or has no date yet).
    assert query == {"puuid": "P1", "$or": [{"name_seen_at": {"$lt": seen}}, {"name_seen_at": {"$exists": False}}]}
    assert riot_id_update(match, {"puuid": "P1", "riotIdGameName": "", "riotIdTagline": "oaks"}) is None
    assert riot_id_update({"info": {}}, {"puuid": "P1", "riotIdGameName": "jar", "riotIdTagline": "oaks"}) is None


def test_routing_regions():
    assert get_routing_region("na1") == "americas"
    assert get_routing_region("PH2") == "sea"
    assert get_routing_region("PH2", api_endpoint=True) == "asia"   # account-v1 has no sea cluster


def test_riot_session_does_not_retry_404():
    rs = RiotSession("key", rps=1000)
    resp = mock.Mock(status_code=404, content=b"")
    resp.raise_for_status.side_effect = requests.HTTPError("404")
    with mock.patch.object(rs.sess, "request", return_value=resp) as req, mock.patch("time.sleep"):
        try:
            rs.safe_request("GET", "https://x")
            raise AssertionError("expected HTTPError")
        except requests.HTTPError:
            pass
    assert req.call_count == 1


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("match_doc tests passed")
