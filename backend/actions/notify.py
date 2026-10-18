"""
"Your Wrapped is ready" emails.

Visitors on the waiting page can leave an email address (POST
/users/<puuid>/notify in backend/flask/app.py, stored in the
ready-notifications collection). Once a player's matches are processed, this
sends each of those addresses one email and deletes it. Nothing else is ever
sent to these addresses.

Sent through Resend's HTTP API (https://resend.com; free tier: 100/day,
3,000/month). Needs:
    RESEND_API_KEY   secret
    NOTIFY_FROM      e.g. "Rifting Wrapped <noreply@riftingwrapped.com>"
                     (the domain must be verified in Resend)
Without RESEND_API_KEY nothing is sent; sign-ups wait (and expire after 14
days via the collection's TTL index).
"""

import html
import logging
import os

import requests

logger = logging.getLogger("notify")

DEFAULT_FROM = "Rifting Wrapped <noreply@riftingwrapped.com>"
DEFAULT_SITE_URL = "https://www.riftingwrapped.com"

READY_STATUSES = ("done", "done_with_errors")


def _email_body(name: str, url: str, year: int):
    safe_name, safe_url = html.escape(name), html.escape(url, quote=True)
    text = (
        f"Hi {name},\n\n"
        f"Your League of Legends year in review is ready:\n{url}\n\n"
        "You're getting this because you asked to be emailed when it finished. "
        "This is the only email we'll send, and we've now deleted your address.\n\n"
        "- Rifting Wrapped"
    )
    body = f"""\
<div style="background:#0a0e14;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#ffffff">
  <div style="max-width:480px;margin:0 auto;background:#141a21;border-radius:16px;padding:32px;border-left:6px solid #c52184">
    <p style="margin:0 0 8px;color:#e0428f;font-size:13px;font-weight:700;letter-spacing:.08em">RIFTING WRAPPED {year}</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2">{safe_name}, your Wrapped is ready</h1>
    <p style="margin:0 0 24px;color:#9DA3A6;font-size:16px;line-height:1.5">
      Your League of Legends year in review is done: top champions, hours played, your best and worst games, and more.
    </p>
    <a href="{safe_url}" style="display:inline-block;background:#c52184;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">See your Wrapped</a>
    <p style="margin:28px 0 0;color:#9DA3A6;font-size:12px;line-height:1.5">
      You asked to be emailed when this finished. This is the only email we'll send, and your address has now been deleted.
    </p>
  </div>
</div>"""
    return text, body


def _send(api_key: str, to: str, subject: str, text: str, body: str) -> bool:
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"from": os.getenv("NOTIFY_FROM") or DEFAULT_FROM, "to": [to], "subject": subject, "text": text, "html": body},
        timeout=15,
    )
    if resp.status_code >= 400:
        logger.warning("Ready email failed (%s): %s", resp.status_code, resp.text[:200])
        return False
    return True


def send_ready_emails(db, puuid=None):
    """
    Email everyone waiting on a player whose Wrapped is now ready (just
    `puuid`, or every waiting sign-up when None), deleting each address once
    sent. Failures are left in place and retried on the consumer's next run.
    Never raises - a notification problem must not stop match processing.
    """
    try:
        notifications = db["ready-notifications"]
        query = {"puuid": puuid} if puuid else {}
        pending = list(notifications.find(query))
        if not pending:
            return
        # Read at call time: the consumer loads .env after importing this module.
        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            logger.info("%d ready email(s) waiting; RESEND_API_KEY not set, not sending", len(pending))
            return

        players = db["tracked-players"]
        for sub in pending:
            player = players.find_one({"puuid": sub["puuid"]}, {"status": 1, "displayName": 1})
            if not player:
                notifications.delete_one({"_id": sub["_id"]})   # player was removed
                continue
            if player.get("status") not in READY_STATUSES:
                continue

            year = sub.get("year")
            site_url = os.getenv("SITE_URL") or DEFAULT_SITE_URL
            url = f"{site_url}/player/{sub['puuid']}?year={year}&utm_source=ready_email"
            name = player.get("displayName") or "Summoner"
            text, body = _email_body(name, url, year)
            try:
                sent = _send(api_key, sub["email"], f"Your Rifting Wrapped {year} is ready", text, body)
            except requests.RequestException as e:
                logger.warning("Ready email failed: %s", e)
                sent = False
            if sent:
                notifications.delete_one({"_id": sub["_id"]})
                logger.info("Sent ready email for player %s", sub["puuid"])
    except Exception:
        logger.exception("send_ready_emails failed")
