"""Run: python backend/actions/test_scrape_window.py (or pytest)."""
from datetime import datetime, timedelta, timezone

from scrape_window import compute_cutoff

H, D = 3600, 86400
NOW = datetime(2026, 11, 23, 13, 49, tzinfo=timezone.utc)


def hours_back(cutoff, now=NOW):
    return (now.timestamp() - cutoff) / H


def cutoff(last_run, lookback=2 * H, catchup=14 * D, now=NOW, year=2026):
    return compute_cutoff(now, last_run, year, lookback, catchup)


def test_no_history_uses_lookback():
    assert hours_back(cutoff(None)) == 2


def test_catches_up_from_last_run_with_overlap():
    last = (NOW - timedelta(hours=10.5)).replace(tzinfo=None)    # naive UTC, as pymongo returns it
    assert hours_back(cutoff(last)) == 11.5


def test_never_narrower_than_lookback():
    assert hours_back(cutoff(NOW - timedelta(minutes=30))) == 2


def test_catch_up_is_capped():
    assert hours_back(cutoff(NOW - timedelta(days=40))) == 14 * 24


def test_explicit_backfill_beats_the_cap():
    assert hours_back(cutoff(NOW - timedelta(hours=5), lookback=21 * D)) == 21 * 24


def test_never_reaches_into_last_year():
    jan2 = datetime(2027, 1, 2, tzinfo=timezone.utc)
    year_start = datetime(2027, 1, 1, tzinfo=timezone.utc).timestamp()
    assert cutoff(None, lookback=21 * D, now=jan2, year=2027) == year_start
    assert cutoff(datetime(2027, 1, 1, 0, 30), now=jan2, year=2027) == year_start   # 1h overlap


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("scrape_window tests passed")
