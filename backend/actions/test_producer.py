"""Run: python backend/actions/test_producer.py (or pytest). Needs no database."""
import os
from unittest import mock

os.environ.setdefault("RIOT_API_KEY", "test")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:1")   # MongoClient connects lazily; never used

import user_producer

PUUID = "a" * 78


def register(known, puuid=PUUID):
    players = mock.Mock()
    players.find_one.return_value = known
    with mock.patch.object(user_producer.Producer, "_ensure_indexes"), \
         mock.patch.object(user_producer, "player_collection", players), \
         mock.patch.object(user_producer.requests, "get", side_effect=Exception("offline")), \
         mock.patch.object(user_producer.RiotSession, "safe_request",
                           side_effect=lambda m, url, **kw: {"puuid": PUUID} if "/accounts/" in url else {"summonerLevel": 30}) as riot:
        assert user_producer.Producer("key").register_player("Faker", "KR1", "KR", puuid) == PUUID
    return riot.call_count, players.update_one.call_args.args[1]["$set"]


def test_puuid_and_profile_from_the_api_skip_both_riot_calls():
    calls, fields = register({"level": 512, "icon": "https://x/29.png"})
    assert calls == 0 and "level" not in fields and "icon" not in fields   # keeps what the API saved


def test_missing_profile_still_fetches_the_summoner_only():
    calls, fields = register({})
    assert calls == 1 and fields["level"] == 30


def test_no_puuid_looks_everything_up():
    calls, _ = register(None, puuid=None)
    assert calls == 2


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("producer tests passed")
