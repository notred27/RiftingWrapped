"""Run: python backend/flask/test_leaderboards.py (or pytest). Needs no database."""
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api
import leaderboards
from datetime import timedelta


def row(puuid, games, wins, kills=0, deaths=0, assists=0, seconds=0):
    return {"puuid": puuid, "games": games, "wins": wins, "kills": kills,
            "deaths": deaths, "assists": assists, "seconds": seconds}


ROWS = [
    row("grinder", games=40, wins=20, kills=300, deaths=200, assists=100, seconds=40 * 1800),
    row("lucky", games=2, wins=2, kills=30, deaths=0, assists=10, seconds=2 * 1800),   # too few games for rates
    row("solid", games=12, wins=9, kills=60, deaths=20, assists=60, seconds=12 * 1800),
    row("deleted", games=99, wins=0, seconds=99 * 1800),                                 # no tracked-players doc
]
PLAYERS = [{"puuid": p, "displayName": p.title(), "tag": "NA1", "region": "na1", "icon": ""}
           for p in ("grinder", "lucky", "solid")]


def build(period="week"):
    fake_players = mock.Mock()
    fake_players.find.return_value = PLAYERS
    with mock.patch.object(leaderboards, "leaderboard_totals", return_value=[dict(r) for r in ROWS]):
        return leaderboards.build_leaderboards({"tracked-players": fake_players}, period, 2026)


def cache_db(payload):
    cache = mock.Mock()
    cache.find_one.return_value = {"payload": payload} if payload else None
    return {leaderboards.CACHE_COLLECTION: cache}


def test_counts_rank_everyone_and_skip_deleted_players():
    boards = build()["boards"]
    assert [r["puuid"] for r in boards["games"]] == ["grinder", "solid", "lucky"]
    assert boards["hours"][0]["hours"] == 20.0


def test_rates_need_minimum_games():
    boards = build()["boards"]
    assert [r["puuid"] for r in boards["winRate"]] == ["solid", "grinder"]    # 75% beats 50%; lucky's 2-0 excluded
    assert boards["kda"][0]["puuid"] == "solid" and boards["kda"][0]["kda"] == 6.0
    assert build("year")["boards"]["winRate"] == []                            # nobody has 100 games


def test_week_starts_monday_utc():
    data = build()
    assert data["start"].endswith("T00:00:00+00:00")
    assert api.datetime.fromisoformat(data["start"]).weekday() == 0


def test_precomputed_board_is_used_until_stale():
    fresh = build()
    hours3 = timedelta(hours=3)
    assert leaderboards.cached_leaderboards(cache_db(fresh), "week", 2026, hours3) == fresh
    assert leaderboards.cached_leaderboards(cache_db(None), "week", 2026, hours3) is None

    old = dict(fresh, updatedAt=(api.datetime.fromisoformat(fresh["updatedAt"]) - timedelta(hours=4)).isoformat())
    assert leaderboards.cached_leaderboards(cache_db(old), "week", 2026, hours3) is None      # job stopped

    last_week = dict(fresh, end=fresh["start"])
    assert leaderboards.cached_leaderboards(cache_db(last_week), "week", 2026, hours3) is None  # new week began


def test_endpoint_serves_precomputed_without_scanning():
    with mock.patch.object(api, "cached_leaderboards", return_value={"boards": {}, "period": "week"}), \
         mock.patch.object(api, "build_leaderboards", side_effect=AssertionError("should not rebuild")):
        res = api.app.test_client().get("/leaderboards?period=week")
    assert res.status_code == 200 and res.get_json()["period"] == "week"


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("leaderboard tests passed")
