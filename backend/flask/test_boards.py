"""Run: python backend/flask/test_boards.py (or pytest). Needs no database."""
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api
import leaderboards

api.app.config["RATELIMIT_ENABLED"] = False
api.limiter.enabled = False
client = api.app.test_client()

PLAYERS = [{"puuid": p, "displayName": p.title(), "tag": "NA1", "region": "na1", "icon": ""} for p in ("amy", "ben", "cat")]


def fake_players():
    m = mock.Mock()
    m.find.side_effect = lambda q, proj=None: [p for p in PLAYERS if p["puuid"] in q["puuid"]["$in"]]
    m.find_one.side_effect = lambda q, proj=None: next((p for p in PLAYERS if p["puuid"] == q["puuid"]), None)
    return m


def test_friends_board_lists_every_member_even_with_no_games():
    totals = [{"puuid": "amy", "games": 5, "wins": 4, "seconds": 9000, "kills": 40, "deaths": 10, "assists": 20},
              {"puuid": "ben", "games": 0, "wins": 0, "seconds": 0, "kills": 0, "deaths": 0, "assists": 0}]
    with mock.patch.object(leaderboards, "leaderboard_totals", return_value=totals):
        data = leaderboards.build_leaderboards({"tracked-players": fake_players()}, "week", 2026, ["amy", "ben"])
    assert [r["puuid"] for r in data["boards"]["games"]] == ["amy", "ben"]
    assert data["minGames"] == 3 and [r["puuid"] for r in data["boards"]["winRate"]] == ["amy"]


def test_join_adds_tracked_player_and_respects_cap():
    boards = mock.Mock()
    boards.find_one.return_value = {"_id": "abcdEFGH", "members": ["amy"]}
    boards.update_one.return_value = mock.Mock(matched_count=1)
    with mock.patch.object(api, "board_collection", boards), mock.patch.object(api, "player_collection", fake_players()):
        assert client.post("/boards/abcdEFGH/join", json={"puuid": "ben"}).status_code == 200
        query, update = boards.update_one.call_args.args
        assert query == {"_id": "abcdEFGH", "members.49": {"$exists": False}} and update == {"$addToSet": {"members": "ben"}}

        boards.update_one.return_value = mock.Mock(matched_count=0)          # board full
        assert client.post("/boards/abcdEFGH/join", json={"puuid": "cat"}).status_code == 409
        assert client.post("/boards/abcdEFGH/join", json={"puuid": "nobody"}).status_code == 404
        assert client.post("/boards/bad id!/join", json={"puuid": "ben"}).status_code == 404


def test_create_board_returns_url_safe_id():
    boards = mock.Mock()
    with mock.patch.object(api, "board_collection", boards), mock.patch.object(api, "player_collection", fake_players()), \
         mock.patch.object(api, "_board_indexes_ready", True):
        res = client.post("/boards", json={"puuid": "amy"})
    doc = boards.insert_one.call_args.args[0]
    assert res.status_code == 201 and api.BOARD_ID_RE.match(res.get_json()["id"])
    assert doc["members"] == ["amy"] and doc["_id"] == res.get_json()["id"]


def test_invite_page_previews_board_then_redirects():
    boards = mock.Mock()
    boards.find_one.side_effect = lambda q: {"_id": "abcdEFGH", "members": ["amy", "ben"]} if q["_id"] == "abcdEFGH" else None
    with mock.patch.object(api, "board_collection", boards), mock.patch.object(api, "player_collection", fake_players()):
        html = client.get("/board-invite/abcdEFGH").get_data(as_text=True)
        assert 'content="Join Amy&#39;s friends board"' in html and "2 players ranked" in html
        assert "/leaderboards/abcdEFGH?ref=invite" in html
        assert client.get("/board-invite/zzzzzzzz").status_code == 302          # unknown board
        assert client.get("/board-invite/bad id!").status_code == 302


def test_players_sitemap_lists_finished_players():
    players = mock.Mock()
    players.distinct.return_value = ["amy", "b/c"]
    with mock.patch.object(api, "player_collection", players):
        xml = client.get("/sitemap-players.xml").get_data(as_text=True)
    assert players.distinct.call_args.args[1] == {"status": {"$in": ["done", "done_with_errors"]}}
    assert "<loc>https://www.riftingwrapped.com/player/amy</loc>" in xml and "/player/b%2Fc<" in xml


def test_board_view_is_cached_until_someone_joins():
    boards = mock.Mock()
    boards.find_one.return_value = {"_id": "abcdEFGH", "members": ["amy"]}
    boards.update_one.return_value = mock.Mock(matched_count=1)
    api._board_cache.clear()
    with mock.patch.object(api, "board_collection", boards), mock.patch.object(api, "player_collection", fake_players()), \
         mock.patch.object(api, "build_leaderboards", return_value={"boards": {}}) as build:
        client.get("/boards/abcdEFGH?period=week")
        client.get("/boards/abcdEFGH?period=week")
        assert build.call_count == 1
        client.post("/boards/abcdEFGH/join", json={"puuid": "ben"})
        client.get("/boards/abcdEFGH?period=week")
        assert build.call_count == 2


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("board tests passed")
