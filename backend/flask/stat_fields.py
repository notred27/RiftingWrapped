"""
Short names for the per-match `stats` fields in matches-YY.

Field names are stored in every document, and the long ones were most of each
match's size (~420 of ~880 bytes), so documents store the short names below.
Code keeps using the readable long names through these helpers:

    F("kills")              -> "$stats.k"     (aggregation expressions)
    P("epicMonsters.barons") -> "stats.e.b"   (field paths: $match, $sort)
    shorten(stats)  / expand(stats)           (whole sub-documents)

Shared by the API and backend/actions (which writes the documents). Changing
a short name needs a migration of every stored document
(backend/actions/shorten_stat_names.py).
"""

# long name -> stored name. Nested groups map to (stored name, {long: stored}).
STAT_FIELDS = {
    "champion": "ch",
    "kills": "k",
    "deaths": "d",
    "assists": "a",
    "win": "w",
    "kda": "kda",
    "position": "pos",
    "magicDamageTaken": "mdt",
    "physicalDamageTaken": "pdt",
    "trueDamageTaken": "tdt",
    "magicDamageDealt": "mdd",
    "physicalDamageDealt": "pdd",
    "trueDamageDealt": "tdd",
    "timeCCingOthers": "cc",
    "cs": "cs",
    "jungleCs": "jcs",
    "killingSprees": "ks",
    "timeSpentDead": "dead",
    "turretKills": "tk",
    "towerTakedowns": "tt",
    "inhibitors": "inh",
    "gameEndedInSurrender": "ff",
    "pings": ("p", {
        "allInPings": "ai",
        "assistMePings": "am",
        "commandPings": "cmd",
        "enemyMissingPings": "em",
        "enemyVisionPings": "ev",
        "getBackPings": "gb",
        "needVisionPings": "nv",
        "onMyWayPings": "omw",
        "pushPings": "pu",
    }),
    "epicMonsters": ("e", {
        "barons": "b",
        "dragons": "d",
        "riftHeralds": "h",
        "voidGrubs": "g",
        "atakhan": "a",
    }),
}


def P(name: str) -> str:
    """Stored path of a stat: P("kills") -> "stats.k", P("pings.pushPings") -> "stats.p.pu"."""
    group, _, sub = name.partition(".")
    entry = STAT_FIELDS[group]
    if sub:
        return f"stats.{entry[0]}.{entry[1][sub]}"
    return f"stats.{entry[0] if isinstance(entry, tuple) else entry}"


def F(name: str) -> str:
    """P() as an aggregation field reference: F("kills") -> "$stats.k"."""
    return "$" + P(name)


def _rename(doc: dict, fields: dict, to_short: bool) -> dict:
    out = {}
    for long, entry in fields.items():
        short, sub = entry if isinstance(entry, tuple) else (entry, None)
        src, dst = (long, short) if to_short else (short, long)
        if src in doc:
            out[dst] = _rename(doc[src], sub, to_short) if sub and isinstance(doc[src], dict) else doc[src]
    return out


def shorten(stats: dict) -> dict:
    """Long-named stats (as extracted from Riot data) -> the stored form."""
    return _rename(stats, STAT_FIELDS, True)


def expand(stats: dict) -> dict:
    """Stored stats -> long names, for API responses that return whole match documents."""
    return _rename(stats or {}, STAT_FIELDS, False)
