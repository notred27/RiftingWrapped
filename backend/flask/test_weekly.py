"""Run: python backend/flask/test_weekly.py (or pytest). Needs no database."""
from datetime import datetime, timedelta, timezone
from unittest import mock

with mock.patch("requests.get", side_effect=Exception("offline")):   # app fetches ddragon on import
    import app as api

UTC_MINUS_5 = timezone(timedelta(hours=-5))
MONDAY = datetime(2026, 11, 16, tzinfo=UTC_MINUS_5)


def game(local_dt, **kw):
    return {"gameDate": local_dt.astimezone(timezone.utc), "matchId": str(local_dt), **kw}


def test_tz_param_matches_javascript_offsets():
    # Date.getTimezoneOffset() is positive west of UTC: 300 = UTC-5.
    with api.app.test_request_context("/weekly/x?tz=300"):
        tz, name = api._weekly_tz()
    assert name == "-05:00" and tz.utcoffset(None) == timedelta(hours=-5)
    with api.app.test_request_context("/weekly/x?tz=-330"):
        assert api._weekly_tz()[1] == "+05:30"


def test_sunday_night_game_counts_on_sunday():
    # 23:30 Sunday in UTC-5 is already Monday 04:30 UTC.
    sunday_night = MONDAY + timedelta(days=6, hours=23, minutes=30)
    details = api._week_details([game(MONDAY + timedelta(hours=1), win=True), game(sunday_night, win=True)],
                                MONDAY, UTC_MINUS_5)
    assert details["days"] == [1, 0, 0, 0, 0, 0, 1]
    assert details["longestWinStreak"] == 2


def test_week_start_is_local_monday_midnight():
    start = api._week_start(0, UTC_MINUS_5)
    assert start.weekday() == 0 and (start.hour, start.minute) == (0, 0)
    assert api._week_start(2, UTC_MINUS_5) == start - timedelta(weeks=2)


def test_totals_handle_zero_deaths_and_empty_week():
    assert api._week_totals([])["kda"] == 0
    assert api._week_totals([{"kills": 5, "assists": 3, "deaths": 0}])["kda"] == 8


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("weekly tests passed")
