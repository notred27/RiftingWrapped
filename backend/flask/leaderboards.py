"""
Leaderboard building, shared by the API (friends boards, fallback) and the
hourly precompute job (backend/actions/precompute_leaderboards.py), which
stores the public boards in the leaderboard-cache collection so requests
don't scan the match collection.

Only needs pymongo - keep Flask out of here so the job can import it.
"""
from datetime import datetime, timedelta, timezone

LEADERBOARD_SIZE = 10
# Rates need enough games to mean something; a 1-0 week isn't a 100% win rate.
LEADERBOARD_MIN_GAMES = {"week": 10, "year": 100}
BOARD_MIN_GAMES = {"week": 3, "year": 20}     # friends play less than the public top 10

CACHE_COLLECTION = "leaderboard-cache"


def cache_id(period: str, year: int) -> str:
    return "week" if period == "week" else f"year-{year}"


def matches_collection(db, year: int):
    return db[f"matches-{year % 100:02d}"]


def leaderboard_totals(db, start: datetime, end: datetime, puuids=None) -> list:
    """
    Per-player totals for finished games in [start, end), across wrap-year
    collections. With `puuids`, only those players, each listed even with no games.
    """
    empty = {"games": 0, "wins": 0, "seconds": 0, "kills": 0, "deaths": 0, "assists": 0}
    totals = {} if puuids is None else {p: dict(empty) for p in puuids}
    match = {"stats": {"$exists": True}}
    if puuids is not None:
        match["puuid"] = {"$in": list(puuids)}
    last = (end - timedelta(microseconds=1)).year
    for year in range(start.year, last + 1):
        for r in matches_collection(db, year).aggregate([
            {"$match": match},
            {"$addFields": {"gameDate": {"$toDate": "$matchInfo.gameCreated"}}},
            {"$match": {"gameDate": {"$gte": start, "$lt": end}}},
            {"$group": {
                "_id": "$puuid",
                "games": {"$sum": 1},
                "wins": {"$sum": {"$cond": ["$stats.win", 1, 0]}},
                "seconds": {"$sum": "$matchInfo.gameDuration"},
                "kills": {"$sum": "$stats.kills"},
                "deaths": {"$sum": "$stats.deaths"},
                "assists": {"$sum": "$stats.assists"},
            }},
        ], allowDiskUse=True):
            t = totals.setdefault(r["_id"], dict(empty))
            for field in t:
                t[field] += r.get(field) or 0
    return [{"puuid": puuid, **t} for puuid, t in totals.items()]


def build_leaderboards(db, period: str, year: int, puuids=None) -> dict:
    """The public boards, or with `puuids` a friends board that ranks every member."""
    if period == "week":
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(weeks=1)
    else:
        start = datetime(year, 1, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)

    rows = leaderboard_totals(db, start, end, puuids)
    for r in rows:
        r["hours"] = round(r["seconds"] / 3600, 1)
        r["winRate"] = round(r["wins"] / r["games"] * 100, 1) if r["games"] else 0
        r["kda"] = round((r["kills"] + r["assists"]) / max(1, r["deaths"]), 2)

    min_games = (BOARD_MIN_GAMES if puuids is not None else LEADERBOARD_MIN_GAMES)[period]
    qualified = [r for r in rows if r["games"] >= min_games]
    boards = {
        "games": sorted(rows, key=lambda r: -r["games"]),
        "hours": sorted(rows, key=lambda r: -r["seconds"]),
        "kills": sorted(rows, key=lambda r: -r["kills"]),
        "winRate": sorted(qualified, key=lambda r: (-r["winRate"], -r["games"])),
        "kda": sorted(qualified, key=lambda r: (-r["kda"], -r["games"])),
    }
    if puuids is None:
        boards = {name: board[:LEADERBOARD_SIZE] for name, board in boards.items()}

    puuids = {r["puuid"] for board in boards.values() for r in board}
    players = {p["puuid"]: p for p in db["tracked-players"].find(
        {"puuid": {"$in": list(puuids)}},
        {"_id": 0, "puuid": 1, "displayName": 1, "tag": 1, "region": 1, "icon": 1},
    )}
    for name, board in boards.items():
        boards[name] = [
            {**players[r["puuid"]], **{k: r[k] for k in ("games", "wins", "hours", "kills", "winRate", "kda")}}
            for r in board if r["puuid"] in players       # skip players deleted since their games were stored
        ]

    return {
        "period": period,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "minGames": min_games,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "boards": boards,
    }


def cached_leaderboards(db, period: str, year: int, max_age: timedelta):
    """The precomputed public boards, or None if missing, too old, or from a past week."""
    doc = db[CACHE_COLLECTION].find_one({"_id": cache_id(period, year)})
    if not doc or not doc.get("payload"):
        return None
    payload = doc["payload"]
    now = datetime.now(timezone.utc)
    if now - datetime.fromisoformat(payload["updatedAt"]) > max_age:
        return None                                   # the hourly job has stopped running
    if period == "week" and now >= datetime.fromisoformat(payload["end"]):
        return None                                   # a new week started since it was built
    return payload


def store_leaderboards(db, period: str, year: int) -> dict:
    payload = build_leaderboards(db, period, year)
    db[CACHE_COLLECTION].replace_one({"_id": cache_id(period, year)}, {"payload": payload}, upsert=True)
    return payload
