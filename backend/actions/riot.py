"""
Riot API access shared by the Actions scripts (producer, consumer, scraper).
The Flask API deploys separately and keeps its own small region map.
"""

import logging
import time
from typing import Optional

import requests

logger = logging.getLogger("riot")

MAX_RETRIES = 5
BACKOFF_BASE = 2.0

# match-v5 routing region -> its platforms. Riot rate-limits each routing region
# separately. The API's queue estimate (backend/flask/app.py) keeps a copy: keep them in sync.
MATCH_ROUTING = {
    "americas": {"NA1", "BR1", "LA1", "LA2"},
    "europe": {"EUN1", "EUW1", "TR1", "RU", "ME1"},
    "asia": {"KR", "JP1"},
    "sea": {"SG2", "OC1", "TW2", "VN2", "PH2", "TH2"},
}


def get_routing_region(region: str, api_endpoint: bool = False) -> str:
    """
    Platform region (e.g. "NA1") -> regional routing host for Riot endpoints.
    account-v1 has no "sea" cluster, so pass api_endpoint=True for it.
    """
    r = (region or "").strip().upper()
    for routing, platforms in MATCH_ROUTING.items():
        if r in platforms:
            return "asia" if routing == "sea" and api_endpoint else routing
    return r.lower() or "unknown"


class RiotSession:
    """requests.Session with request spacing, 429/5xx/network retries."""

    def __init__(self, api_key: str, rps: float = 1.0):
        self.sess = requests.Session()
        self.sess.headers.update({"X-Riot-Token": api_key})
        self.last_request_at = 0.0
        self.min_interval = 1.0 / max(rps, 0.1)

    def safe_request(self, method: str, url: str, params: Optional[dict] = None, timeout: int = 30):
        attempt = 0
        while True:
            elapsed = time.time() - self.last_request_at
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)

            try:
                resp = self.sess.request(method, url, params=params, timeout=timeout)
                self.last_request_at = time.time()

                if resp.status_code == 429:
                    retry_after = resp.headers.get("Retry-After")
                    wait = int(retry_after) if retry_after and retry_after.isdigit() else 20
                    logger.warning("Rate limited (429). Waiting %s seconds and retrying.", wait)
                    time.sleep(wait)
                    attempt += 1
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                if 500 <= resp.status_code < 600:
                    attempt += 1
                    backoff = BACKOFF_BASE ** attempt
                    logger.warning("Server error %s. Backing off %ss (attempt %s).", resp.status_code, backoff, attempt)
                    time.sleep(backoff)
                    if attempt > MAX_RETRIES:
                        resp.raise_for_status()
                    continue

                resp.raise_for_status()
                if resp.status_code == 204 or not resp.content:
                    return None
                return resp.json()
            except requests.HTTPError:
                raise   # 4xx, or retries used up: not worth retrying
            except requests.RequestException as exc:
                attempt += 1
                if attempt > MAX_RETRIES:
                    raise
                backoff = min(BACKOFF_BASE ** attempt, 60)
                logger.warning("Network error: %s. Retry in %ss (attempt %s).", exc, backoff, attempt)
                time.sleep(backoff)
