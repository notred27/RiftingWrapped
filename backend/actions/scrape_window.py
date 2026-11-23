"""How far back the hourly scraper (fetch-and-store.py) asks Riot for matches.
No database or network here, so it can be tested on its own."""

from datetime import datetime, timezone

RUN_OVERLAP_SECONDS = 60 * 60


def compute_cutoff(now: datetime, last_run_started_at, wrap_year: int,
                   lookback_seconds: int, max_catchup_seconds: int) -> int:
    """
    Unix time to fetch matches from: the last successful run's start less an
    overlap, but at least `lookback_seconds` back, at most
    max(`max_catchup_seconds`, `lookback_seconds`) back, and never before
    Jan 1 of `wrap_year` (UTC) - earlier games belong to last year's Wrapped.
    """
    now_ts = int(now.timestamp())
    cutoff = now_ts - lookback_seconds
    if last_run_started_at is not None:
        if last_run_started_at.tzinfo is None:            # pymongo returns naive UTC
            last_run_started_at = last_run_started_at.replace(tzinfo=timezone.utc)
        cutoff = min(cutoff, int(last_run_started_at.timestamp()) - RUN_OVERLAP_SECONDS)
    cutoff = max(cutoff, now_ts - max(max_catchup_seconds, lookback_seconds))

    year_start = int(datetime(wrap_year, 1, 1, tzinfo=timezone.utc).timestamp())
    year_end = int(datetime(wrap_year + 1, 1, 1, tzinfo=timezone.utc).timestamp())
    return min(max(cutoff, year_start), year_end)
