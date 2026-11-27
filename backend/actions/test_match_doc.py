"""Run: python backend/actions/test_match_doc.py (or pytest)."""
from unittest import mock

import requests

from datetime import datetime, timezone

from match_doc import GRID_SIZE, build_match_fields, cell_index, extract_match_stats, player_locations_inc, riot_id_update
from shorten_stat_names import short_stats_expr
from stat_fields import F, P, STAT_FIELDS, expand, shorten
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

    # Level and icon come along, under the same newer-match guard.
    _, update = riot_id_update(match, {"puuid": "P1", "riotIdGameName": "jar", "riotIdTagline": "oaks",
                                       "summonerLevel": 312, "profileIcon": 29}, "15.1.1")
    assert update["$set"]["level"] == 312
    assert update["$set"]["icon"] == "https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/29.png"


MATCH = {"info": {"queueId": 450, "gameCreation": 1_764_000_000_000, "gameDuration": 1200,
                  "teams": [{"teamId": 100, "objectives": {"baron": {"kills": 1}, "dragon": {"kills": 2}}}],
                  "participants": [{"puuid": "p", "participantId": 1, "teamId": 100, "championName": "Ahri",
                                    "kills": 7, "deaths": 2, "assists": 5, "win": True, "pushPings": 3}]}}


def test_stats_are_stored_short_and_expand_back():
    long = extract_match_stats(MATCH, MATCH["info"]["participants"][0])
    stored = build_match_fields(MATCH, {}, "p")["stats"]
    assert stored["ch"] == "Ahri" and stored["k"] == 7 and stored["e"]["b"] == 1 and stored["p"]["pu"] == 3
    assert expand(stored) == long and shorten(long) == stored
    assert P("kills") == "stats.k" and F("epicMonsters.barons") == "$stats.e.b" and P("pings.pushPings") == "stats.p.pu"


def test_short_names_are_unique_and_migration_matches_the_writer():
    top = [e[0] if isinstance(e, tuple) else e for e in STAT_FIELDS.values()]
    assert len(top) == len(set(top))
    for e in STAT_FIELDS.values():
        if isinstance(e, tuple):
            assert len(e[1]) == len(set(e[1].values()))

    # Evaluate the migration's expression against a long-named document, as MongoDB would.
    long = extract_match_stats(MATCH, MATCH["info"]["participants"][0])

    def resolve(expr):
        if isinstance(expr, dict):
            return {k: v for k, v in ((k, resolve(v)) for k, v in expr.items()) if v is not None}
        node = {"stats": long}
        for part in expr[1:].split("."):
            node = node.get(part) if isinstance(node, dict) else None
        return node
    assert resolve(short_stats_expr()) == shorten(long)


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
