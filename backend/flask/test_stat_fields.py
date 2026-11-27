"""Run: python backend/flask/test_stat_fields.py (or pytest). Needs no database."""
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api

client = api.app.test_client()

STORED = {"_id": "abc", "matchId": "NA1_1", "stats": {"ch": "Ahri", "k": 7, "d": 2, "a": 5, "kda": 6.0, "e": {"b": 1}}}


def test_whole_match_responses_use_long_names():
    matches = mock.Mock()
    matches.aggregate.side_effect = lambda pipeline: [dict(STORED, stats=dict(STORED["stats"]))]
    with mock.patch.object(api, "get_matches_collection", return_value=matches):
        data = client.get("/kda/p?year=2026").get_json()
        assert data["bestKDA"]["stats"] == {"champion": "Ahri", "kills": 7, "deaths": 2, "assists": 5, "kda": 6.0,
                                            "epicMonsters": {"barons": 1}}
        # and the query sorted on the stored name
        assert matches.aggregate.call_args_list[0].args[0][1] == {"$sort": {"stats.kda": -1, "matchInfo.gameDuration": -1}}

        games = client.get("/highestStatGames/p?year=2026&stat=kills").get_json()
        assert games[0]["stats"]["kills"] == 7
        assert matches.aggregate.call_args.args[0][1]["$sort"]["stats.k"] == -1


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("stat field tests passed")
