"""
The single definition of a stored match document.

Both writers - match_consumer.py (new sign-ups) and fetch-and-store.py (the
hourly scraper) - build documents here, so every document in matches-YY has
the same shape. Before this module existed the two had drifted apart: the
scraper stored all ten participants' puuids (~900 bytes per document) and the
player's Riot ID, the consumer didn't, and both stored fields nothing reads.

A finished ("done") match document looks like:

    {
      "_id", "puuid", "matchId", "status": "done", "queueId",
      "matchInfo": {"gameCreated", "gameDuration"},
      "stats": {...see extract_match_stats...},
      "locations": {"kills": [{x, y}], "deaths": [{x, y}]},
    }

Only add a field here if the API (backend/flask/app.py) or the frontend reads
it - every byte is repeated in every match of every player.
"""

from datetime import datetime, timezone

# Queues whose timelines we keep kill/death positions for (Summoner's Rift).
SUMMONERS_RIFT_QUEUES = {400, 420, 430, 440, 480, 490}

# Riot participant field -> how it's summed by GET /pings.
PING_KEYS = [
    "allInPings", "assistMePings", "enemyMissingPings", "enemyVisionPings",
    "getBackPings", "needVisionPings", "onMyWayPings", "pushPings",
]

# Fields a match only needs while it waits in the queue (the consumer uses
# them to fetch and order work). Removed once the match is done.
QUEUE_ONLY_FIELDS = ("region", "created_at", "priority", "processing_started_at", "error")

# Queue order, shared by the consumer (which match to process next) and the
# API (a player's position in line). Lower priority first; within a priority,
# first come first served by queue time. Every match a player's scan queues
# shares one created_at, and puuid breaks any tie, so the consumer finishes
# one player's matches before starting the next player's.
PRIORITY_NEW_PLAYER = 0   # no processed matches yet: waiting for their first Wrapped
PRIORITY_RESCAN = 1       # already has stats; can view their Wrapped meanwhile
QUEUE_SORT = [("priority", 1), ("created_at", 1), ("puuid", 1), ("_id", 1)]

# Fields older code stored that nothing reads. They're dropped by
# backend/migrations/migrate_to_new_project.py. When a writer rewrites a match,
# replacing "stats" and "matchInfo" wholesale already removes the nested ones;
# only the top-level ones need an explicit $unset (see unset_fields).
LEGACY_TOP_LEVEL_FIELDS = (
    "team",                                   # scraper: which side the player was on
)
LEGACY_NESTED_FIELDS = (
    "stats.matchId",                          # duplicate of the top-level matchId
    "stats.riotIdGameName", "stats.riotIdTagline",  # the player's own name; read from tracked-players instead
    "stats.visionScore",
    "stats.towers",                           # team total; the API uses stats.turretKills
    "stats.epicMonsters.dragonTypes",
    "stats.gameEndedInEarlySurrender",
    "matchInfo.matchId",                      # duplicate
    "matchInfo.teams",                        # all ten participants' puuids
    "matchInfo.gameType",
)


def extract_match_stats(match_data: dict, participant: dict) -> dict:
    """Per-player numbers the stats endpoints aggregate over."""
    teams = match_data.get("info", {}).get("teams", [])
    team = next((t for t in teams if t.get("teamId") == participant["teamId"]), {})
    objectives = team.get("objectives", {})

    deaths = participant.get("deaths", 0)
    kda = round((participant.get("kills", 0) + participant.get("assists", 0)) / max(1, deaths), 2)

    return {
        "champion": participant.get("championName", ""),
        "kills": participant.get("kills", 0),
        "deaths": deaths,
        "assists": participant.get("assists", 0),
        "win": participant.get("win", False),
        "kda": kda,
        "position": participant.get("teamPosition", ""),

        "magicDamageTaken": participant.get("magicDamageTaken", 0),
        "physicalDamageTaken": participant.get("physicalDamageTaken", 0),
        "trueDamageTaken": participant.get("trueDamageTaken", 0),
        "magicDamageDealt": participant.get("magicDamageDealtToChampions", 0),
        "physicalDamageDealt": participant.get("physicalDamageDealtToChampions", 0),
        "trueDamageDealt": participant.get("trueDamageDealtToChampions", 0),
        "timeCCingOthers": participant.get("timeCCingOthers", 0),

        "cs": participant.get("totalMinionsKilled", 0),
        "jungleCs": participant.get("neutralMinionsKilled", 0),
        "killingSprees": participant.get("killingSprees", 0),
        "timeSpentDead": participant.get("totalTimeSpentDead", 0),
        "turretKills": participant.get("turretKills", 0),
        "towerTakedowns": participant.get("challenges", {}).get("turretTakedowns", 0),
        "inhibitors": objectives.get("inhibitor", {}).get("kills", 0),

        "pings": {k: participant.get(k, 0) for k in PING_KEYS},
        "epicMonsters": {
            "barons": objectives.get("baron", {}).get("kills", 0),
            "dragons": objectives.get("dragon", {}).get("kills", 0),
            "riftHeralds": objectives.get("riftHerald", {}).get("kills", 0),
            "voidGrubs": objectives.get("horde", {}).get("kills", 0),
            "atakhan": objectives.get("atakhan", {}).get("kills", 0),
        },
        "gameEndedInSurrender": participant.get("gameEndedInSurrender", False),
    }


def get_kill_death_positions(timeline_data: dict, participant_id: int, queue_id: int) -> dict:
    """Map coordinates of this player's kills and deaths (Rift queues only)."""
    if queue_id not in SUMMONERS_RIFT_QUEUES:
        return {"kills": [], "deaths": []}

    kills, deaths = [], []
    for frame in timeline_data.get("info", {}).get("frames", []):
        for event in frame.get("events", []):
            if event.get("type") != "CHAMPION_KILL":
                continue
            position = event.get("position", {})
            if event.get("killerId") == participant_id:
                kills.append({"x": position.get("x"), "y": position.get("y")})
            if event.get("victimId") == participant_id:
                deaths.append({"x": position.get("x"), "y": position.get("y")})
    return {"kills": kills, "deaths": deaths}


def build_match_fields(match_data: dict, timeline_data: dict, puuid: str) -> dict:
    """
    Everything a finished match document stores besides its identity
    (_id, puuid, matchId). Use with $set, together with unset_fields().
    """
    info = match_data["info"]
    participant = next(p for p in info["participants"] if p["puuid"] == puuid)
    queue_id = info.get("queueId", -1)

    return {
        "status": "done",
        "queueId": queue_id,
        "matchInfo": {
            "gameCreated": datetime.fromtimestamp(info.get("gameCreation", 0) / 1000, tz=timezone.utc),
            "gameDuration": info.get("gameDuration", 0),
        },
        "stats": extract_match_stats(match_data, participant),
        "locations": get_kill_death_positions(timeline_data, participant["participantId"], queue_id),
    }


def unset_fields() -> dict:
    """
    $unset spec to pair with $set of build_match_fields(): strips queue-only and
    legacy top-level fields. (Nested legacy fields can't be listed here - MongoDB
    rejects $unset of "stats.x" in the same update that $sets "stats" - and
    don't need to be, since that $set replaces the whole sub-document.)
    """
    return {field: "" for field in QUEUE_ONLY_FIELDS + LEGACY_TOP_LEVEL_FIELDS}
