"""Run: python backend/flask/test_signup.py (or pytest). Needs no database or network."""
import os
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api

api.app.config["RATELIMIT_ENABLED"] = False
api.limiter.enabled = False


def resp(status, body=None, headers=None):
    r = mock.Mock(status_code=status, headers=headers or {}, text="")
    r.json.return_value = body or {}
    return r


ACCOUNT = resp(200, {"puuid": "P1", "gameName": "Faker", "tagLine": "KR1"})
SUMMONER = resp(200, {})


def post(riot_responses, existing=None, gh_status=204):
    players = mock.Mock()
    players.find_one.return_value = existing
    players.update_one.return_value = mock.Mock(upserted_id=None if existing else "new", matched_count=0, modified_count=0)
    with mock.patch.object(api, "player_collection", players), \
         mock.patch.object(api.requests, "get", side_effect=riot_responses) as get, \
         mock.patch.object(api.requests, "post", return_value=resp(gh_status)), \
         mock.patch.object(api.time, "sleep"), \
         mock.patch.dict(os.environ, {"RIOT_API_KEY": "k"}):
        r = api.app.test_client().post("/users", data={"displayName": "faker", "tag": "kr1", "region": "KR"})
    return r, get, players


def test_riot_rate_limit_is_retried_once():
    r, get, _ = post([resp(429, headers={"Retry-After": "1"}), ACCOUNT, SUMMONER])
    assert r.status_code == 201 and get.call_count == 3


def test_persistent_rate_limit_is_a_503_not_a_502():
    r, _, _ = post([resp(429), resp(429)])
    assert r.status_code == 503


def test_riot_404_is_not_retried():
    r, get, _ = post([resp(404)])
    assert r.status_code == 404 and get.call_count == 1


def test_existing_player_is_a_409():
    r, _, _ = post([ACCOUNT, SUMMONER], existing={"puuid": "P1", "status": "done"})
    assert r.status_code == 409


def test_renamed_player_gets_new_name_not_a_dead_end():
    # Stored as an old Riot ID; Riot now returns "Faker#KR1" for the same puuid.
    r, _, players = post([ACCOUNT, SUMMONER], existing={"puuid": "P1", "status": "done", "displayName": "OldName", "tag": "OLD", "region": "KR"})
    assert r.status_code == 409 and r.get_json()["user"]["displayName"] == "Faker"
    assert players.update_one.call_args[0] == ({"puuid": "P1"}, {"$set": {"displayName": "Faker", "tag": "KR1", "region": "KR"}})


def test_unchanged_existing_player_is_not_rewritten():
    r, _, players = post([ACCOUNT, SUMMONER], existing={"puuid": "P1", "status": "done", "displayName": "Faker", "tag": "KR1", "region": "KR"})
    assert r.status_code == 409 and not players.update_one.called


def test_failed_player_registers_again():
    r, _, players = post([ACCOUNT, SUMMONER], existing={"puuid": "P1", "status": "failed"})
    assert r.status_code == 200
    update = players.update_one.call_args[0][1]
    assert update["$set"]["status"] == "starting" and "error" in update["$unset"]


def test_failed_dispatch_puts_a_retried_player_back_to_failed():
    r, _, players = post([ACCOUNT, SUMMONER], existing={"puuid": "P1", "status": "failed"}, gh_status=500)
    assert r.status_code == 502
    assert players.update_one.call_args[0][1] == {"$set": {"status": "failed"}}


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("signup tests passed")
