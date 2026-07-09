from flask import Flask, request, render_template, abort
from flask import jsonify
from flask_cors import CORS
import requests
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from werkzeug.exceptions import HTTPException
import os
import re
from datetime import datetime
from math import floor

app = Flask(__name__, template_folder='./templates')
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

DB_NAME = "rifting-wrapped"
db = client[DB_NAME]

# Global player collection 
player_collection = db["tracked-players"]

# The year new player registrations get written to. This is a server-side deployment setting
WRAP_YEAR = int(os.getenv("WRAP_YEAR", "2026"))


def get_matches_collection(year: int):
    """Return the matches collection for a given wrap year, e.g. matches-25 for 2025."""
    yy = year % 100
    return db[f"matches-{yy:02d}"]


def require_year_param() -> int:
    """
    Every match-data route needs to know which year's match collection to
    query. Missing or non-integer `year` is a client error (400), not a 404 --
    distinguishing "you forgot a required param" from "that player/year has
    no data." Routes that only touch the global player collection do not
    need this.
    """
    year_param = request.args.get('year', type=int)
    if year_param is None:
        abort(400, description="Missing or invalid `year` query parameter (expected an integer, e.g. ?year=2025)")
    return year_param


# ----------------------------------------------------------------------------
# Global error handlers
# ----------------------------------------------------------------------------
@app.errorhandler(PyMongoError)
def handle_db_error(e):
    return jsonify({"error": "Internal Server Error", "message": f"Database error occurred: {str(e)}"}), 500


@app.errorhandler(HTTPException)
def handle_http_exception(e):
    return jsonify({"error": e.name, "message": e.description}), e.code



try:
    LOL_VERSION = requests.get("https://ddragon.leagueoflegends.com/api/versions.json", timeout=10).json()[0]
    print(f"Using LoL version: {LOL_VERSION}")
except Exception:
    LOL_VERSION = None
    print("Warning: couldn't fetch ddragon version at startup.")


# Helper translation for regions
def get_routing_region(region: str) -> str:
    region = (region or "").upper()

    americas = {"NA1", "BR1", "LA1", "LA2", "OC1"}
    europe = {"EUN1", "EUW1", "TR1", "RU", "ME1"}
    asia = {"KR", "JP1", "SG2", "TW2", "VN2"}

    if region in americas:
        return "americas"
    elif region in europe:
        return "europe"
    elif region in asia:
        return "asia"
    else:
        return "unknown"


### ======================= GENERAL ======================= ###

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "message": "Server is up"
    }), 200


### ======================= ACCOUNT ======================= ###


@app.route('/users/count', methods=['GET'])
def get_user_count():
    count = player_collection.count_documents({})
    return jsonify({"count": count}), 200


@app.route('/users/all', methods=['GET'])
def get_all_users():
    users = list(player_collection.find(
        {},
        {"_id": 0, "displayName": 1, "tag": 1, "region": 1, "icon": 1, "puuid": 1}
    ))
    return jsonify(users), 200


@app.route('/users/<puuid>', methods=['GET'])
def get_user_info(puuid):
    result = player_collection.find_one({"puuid": puuid}, {"_id": 0})
    if not result:
        abort(404, description=f"No user found with puuid `{puuid}`")

    return jsonify(result), 200


@app.route('/users/by-riot-id/<displayName>/<tag>/<region>', methods=['GET'])
def get_user_info_by_name(displayName, tag, region):
    query = {
        "displayName": {"$regex": f"^{re.escape(displayName)}$", "$options": "i"},
        "tag": {"$regex": f"^{re.escape(tag)}$", "$options": "i"},
        "region": {"$regex": f"^{re.escape(region)}$", "$options": "i"},
    }

    result = player_collection.find_one(query, {"_id": 0})
    if not result:
        abort(404, description=f"No user found with displayName `{displayName}`, tag `{tag}`, and region `{region}`")

    return jsonify(result), 200


MAX_DISPLAYNAME_LEN = 20
MAX_TAG_LEN = 6
RIOT_TIMEOUT = 5  # seconds

@app.route('/users', methods=['POST'])
def add_by_display_name():
    if 'displayName' not in request.form or 'tag' not in request.form:
        return {"msg": "Payload is missing displayName or tag"}, 400

    displayName = request.form.get('displayName')
    tag = request.form.get('tag')
    region = request.form.get('region')

    if not (displayName and tag and region):
        return jsonify({"error": "Bad Request", "message": "Must provide a valid RIOT account displayName, tag, AND region"}), 400

    if len(displayName) > MAX_DISPLAYNAME_LEN or len(tag) > MAX_TAG_LEN:
        return jsonify({"error": "Bad Request", "message": "displayName or tag too long"}), 400

    displayName = displayName.strip()
    tag = tag.strip()
    region = region.strip().upper()

    # Reject garbage regions before spending a Riot API call on them.
    VALID_REGIONS = {
        "NA1", "BR1", "LA1", "LA2", "EUN1", "EUW1", "TR1", "RU", "ME1",
        "KR", "JP1", "SG2", "OC1", "TW2", "VN2", "PH2", "TH2",
    }
    if region not in VALID_REGIONS:
        return jsonify({"error": "Bad Request", "message": f"Unknown region '{region}'"}), 400

    riot_key = os.getenv("RIOT_API_KEY")
    if not riot_key:
        print("Missing Riot API key in environment (add logger)")
        return jsonify({"error": "Server Misconfiguration", "message": "Riot API key missing"}), 500

    riot_url = f'https://{get_routing_region(region)}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{displayName}/{tag}'

    try:
        r = requests.get(riot_url, headers={"X-Riot-Token": riot_key}, timeout=RIOT_TIMEOUT)
    except requests.RequestException:
        print("Riot API request failed")
        return jsonify({"error": "Bad Gateway", "message": "Failed to contact Riot API"}), 502

    if r.status_code == 404:
        return jsonify({"error": "Not Found", "message": "User not found on Riot's servers"}), 404

    if r.status_code != 200:
        return jsonify({"error": "Bad Gateway", "message": "Riot API encountered an error"}), 502

    try:
        riot_data = r.json()
        puuid = riot_data["puuid"]
    except (ValueError, KeyError) as e:
        return jsonify({"error": "Bad Gateway", "message": f"Invalid Riot response format {str(e)}"}), 502

    # Confirm the account actually lives on the region the user selected.
    summoner_check_url = f'https://{region.lower()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}'
    try:
        sr = requests.get(summoner_check_url, headers={"X-Riot-Token": riot_key}, timeout=RIOT_TIMEOUT)
    except requests.RequestException:
        return jsonify({"error": "Bad Gateway", "message": "Failed to contact Riot API"}), 502

    if sr.status_code == 404:
        return jsonify({
            "error": "Not Found",
            "message": f"{displayName}#{tag} was found, but has no account on region '{region}'. Double-check your region."
        }), 404

    if sr.status_code != 200:
        return jsonify({"error": "Bad Gateway", "message": "Riot API encountered an error validating region"}), 502

    existing = player_collection.find_one({"puuid": puuid}, {"_id": 0})
    if existing:
        return jsonify({"error": "Conflict", "message": "User exists", "user": existing}), 409

    user_doc = {
        "$set": {
            "displayName": displayName,
            "tag": tag,
            "puuid": puuid,
            "region": region,
            "status": "starting",
        },
    }

    result = player_collection.update_one({"puuid": puuid}, user_doc, upsert=True)

    try:
        GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
        url = "https://api.github.com/repos/notred27/RiftingWrapped/actions/workflows/player_init.yaml/dispatches"
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {GITHUB_TOKEN}"
        }
        payload = {
            "ref": "master",
            "inputs": {"displayName": displayName, "tag": tag, "region": region}
        }
        gh_resp = requests.post(url, headers=headers, json=payload, timeout=RIOT_TIMEOUT)
        if gh_resp.status_code == 204:
            print(f"GitHub Action triggered for {displayName}#{tag} in {region}")
        else:
            print(f"Failed to trigger workflow: {gh_resp.status_code} {gh_resp.text}")
    except Exception as e:
        print(f"Failed to trigger GitHub Action: {e}")

    status_code = 201 if result.upserted_id else 200
    message = "User created successfully" if result.upserted_id else "User updated successfully"

    return jsonify({
        "puuid": puuid,
        "status": "starting",
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
        "upserted_id": str(result.upserted_id) if result.upserted_id else None,
        "message": message
    }), status_code


ADMIN_API_KEY = os.getenv("RIFTING_WRAPPED_ADMIN_KEY")

def require_admin_key():
    api_key = request.headers.get("X-API-Key") or request.args.get("api_key")
    if not api_key or api_key != ADMIN_API_KEY:
        abort(401, description="Unauthorized")


@app.route('/users/<puuid>', methods=['DELETE'])
def delete_by_puuid(puuid):
    """
    Deletion now needs an explicit `scope` because player identity and match
    data no longer live in the same per-year database:

      - scope=year (default): delete only this year's matches, keep the
        global player record intact (e.g. wiping a bad 2024 backfill without
        de-registering the player).
      - scope=all: delete this year's matches AND the global player record,
        fully removing the player.
    """
    require_admin_key()
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    scope = request.args.get("scope", default="year")
    if scope not in ("year", "all"):
        abort(400, description="`scope` must be `year` or `all`")

    match_count = matches_collection.count_documents({"puuid": puuid})
    user_doc = player_collection.find_one({"puuid": puuid}, {"_id": 1, "displayName": 1, "tag": 1})

    if not user_doc and match_count == 0:
        return jsonify({"error": "Not Found", "message": "No user or matches found"}), 404

    # Try to get confirmation
    confirm_raw = request.args.get("confirm")
    if confirm_raw is None:
        confirm = (request.get_json(silent=True) or {}).get("confirm")
    else:
        confirm = confirm_raw.lower() in ("1", "true", "yes")

    if not confirm:
        return jsonify({
            "puuid": puuid,
            "user_exists": bool(user_doc),
            "user_preview": {"displayName": user_doc.get("displayName"), "tag": user_doc.get("tag")} if user_doc else None,
            "num_matches_to_delete": match_count,
            "scope": scope,
            "will_delete_player_record": scope == "all",
            "message": "Re-run with ?confirm=true to perform deletion"
        }), 200

    result = matches_collection.delete_many({"puuid": puuid})

    user_deleted_count = 0
    if scope == "all":
        user = player_collection.delete_one({"puuid": puuid})
        user_deleted_count = user.deleted_count

    # 200, not 204 -- a 204 response must not carry a body.
    return jsonify({
        "puuid": puuid,
        "numUserDeleted": user_deleted_count,
        "numMatchesDeleted": result.deleted_count,
        "scope": scope,
        "status": "success" if (result.deleted_count > 0 or user_deleted_count > 0) else "no matches found"
    }), 200


### ======================= GET ======================= ###
@app.route('/champs/<puuid>', methods=['GET'])
def get_champ_counts(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": "$stats.champion",
            "count": {"$sum": 1},
        }},
        {"$sort": {"count": -1}}
    ]

    results = list(matches_collection.aggregate(pipeline))
    print(results)
    for doc in results:
        doc['champion'] = doc.pop('_id')

    return jsonify(results)


@app.route('/matchesByDate/<puuid>', methods=['GET'])
def get_game_dates(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$addFields": {"gameDate": {"$toDate": "$matchInfo.gameCreated"}}},
        {"$addFields": {"dateString": {"$dateToString": {"format": "%Y-%m-%d", "date": "$gameDate"}}}},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$gameDate"},
                    "month": {"$month": "$gameDate"},
                    "date": "$dateString"
                },
                "dailyMatchCount": {"$sum": 1}
            }
        },
        {
            "$group": {
                "_id": {"year": "$_id.year", "month": "$_id.month"},
                "totalMatches": {"$sum": "$dailyMatchCount"},
                "uniqueDays": {"$sum": 1}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]


    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/damage/<puuid>', methods=['GET'])
def get_damage(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": puuid,
            "magicDamageTaken": {"$sum": "$stats.magicDamageTaken"},
            "physicalDamageTaken": {"$sum": "$stats.physicalDamageTaken"},
            "trueDamageTaken": {"$sum": "$stats.trueDamageTaken"},

            "magicDamageDealt": {"$sum": "$stats.magicDamageDealt"},
            "physicalDamageDealt": {"$sum": "$stats.physicalDamageDealt"},
            "trueDamageDealt": {"$sum": "$stats.trueDamageDealt"},

            "avgTaken": {"$avg": {"$add": ["$stats.magicDamageTaken", "$stats.physicalDamageTaken", "$stats.trueDamageTaken"]}},
            "avgDealt": {"$avg": {"$add": ["$stats.magicDamageDealt", "$stats.physicalDamageDealt", "$stats.trueDamageDealt"]}},
            "timeCC": {"$sum": "$stats.timeCCingOthers"},
        }},
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/forfeit/<puuid>', methods=['GET'])
def get_forfeit(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum": 1},
            "numSurrenders": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", 1, 0]}},
            "numSurrendersWon": {"$sum": {"$cond": [{"$and": ["$stats.gameEndedInSurrender", "$stats.win"]}, 1, 0]}},
            "gamesEndingBefore16": {"$sum": {"$cond": [{"$and": ["$stats.gameEndedInSurrender", {"$lt": ["$matchInfo.gameDuration", 960]}]}, 1, 0]}},
            "totalSurrenderTime": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", "$matchInfo.gameDuration", 0]}},
            "totalNonSurrenderTime": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", 0, "$matchInfo.gameDuration"]}},
        }},
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/objectives/<puuid>', methods=['GET'])
def get_objectives(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum": 1},
            "barons": {"$sum": "$stats.epicMonsters.barons"},
            "dragons": {"$sum": "$stats.epicMonsters.dragons"},
            "riftHeralds": {"$sum": "$stats.epicMonsters.riftHeralds"},
            "voidGrubs": {"$sum": "$stats.epicMonsters.voidGrubs"},
            "atakhans": {"$sum": "$stats.epicMonsters.atakhan"},
            "towers": {"$sum": "$stats.turretKills"},
            "inhibitors": {"$sum": "$stats.inhibitors"}
        }},
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/timeBreakdown/<puuid>', methods=['GET'])
def get_breakdown(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum": 1},
            "numSurrenders": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", 1, 0]}},
            "numSurrendersWon": {"$sum": {"$cond": [{"$and": ["$stats.gameEndedInSurrender", "$stats.win"]}, 1, 0]}},
            "gamesEndingBefore16": {"$sum": {"$cond": [{"$and": ["$stats.gameEndedInSurrender", {"$lt": ["$matchInfo.gameDuration", 960]}]}, 1, 0]}},
            "totalSurrenderTime": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", "$matchInfo.gameDuration", 0]}},
            "totalNonSurrenderTime": {"$sum": {"$cond": ["$stats.gameEndedInSurrender", 0, "$matchInfo.gameDuration"]}},
        }},
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/role/<puuid>', methods=['GET'])
def get_role(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": "$stats.position",
            "count": {"$sum": 1},
            "winsInRole": {"$sum": {"$cond": ["$stats.win", 1, 0]}},
        }},
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/matchTotals/<puuid>', methods=['GET'])
def get_matchTotals(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$group": {
                "_id": puuid,
                "numGames": {"$sum": 1},
                "totalKills": {"$sum": "$stats.kills"},
                "totalDeaths": {"$sum": "$stats.deaths"},
                "totalTimeDead": {"$sum": "$stats.timeSpentDead"},
                "totalKillingSprees": {"$sum": "$stats.killingSprees"},
                "totalTowerTakedowns": {"$sum": "$stats.towerTakedowns"},
                "positiveWR": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$gte": [{"$add": ["$stats.kills", "$stats.assists"]}, "$stats.deaths"]},
                                {"$eq": ["$stats.win", True]}
                            ]},
                            1, 0
                        ]
                    }
                },
                "negativeWR": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$lt": [{"$add": ["$stats.kills", "$stats.assists"]}, "$stats.deaths"]},
                                {"$eq": ["$stats.win", True]}
                            ]},
                            1, 0
                        ]
                    }
                },
                "totalPositiveGames": {
                    "$sum": {"$cond": [{"$gte": [{"$add": ["$stats.kills", "$stats.assists"]}, "$stats.deaths"]}, 1, 0]}
                },
                "totalNegativeGames": {
                    "$sum": {"$cond": [{"$lt": [{"$add": ["$stats.kills", "$stats.assists"]}, "$stats.deaths"]}, 1, 0]}
                },
            }
        },
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


ALLOWED_GAME_STATS = {
    'kills': 'stats.kills',
    'deaths': 'stats.deaths',
    'assists': 'stats.assists'
}

MAX_GAMES_LIMIT = 10

@app.route('/highestStatGames/<puuid>', methods=['GET'])
def get_highest_games(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    stat = request.args.get('stat', default='kills', type=str).lower()
    limit = request.args.get('limit', default=5, type=int)

    if stat not in ALLOWED_GAME_STATS:
        abort(400, description=f"Invalid stat. Allowed: {', '.join(ALLOWED_GAME_STATS.keys())}")

    limit = max(1, min(limit, MAX_GAMES_LIMIT))
    sort_field = ALLOWED_GAME_STATS[stat]

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$sort": {sort_field: -1, "matchInfo.gameDuration": -1}},
        {"$limit": limit}
    ]

    results = list(matches_collection.aggregate(pipeline))

    if not results:
        exists = matches_collection.find_one({"puuid": puuid})
        if not exists:
            abort(404, description=f"No user found with puuid `{puuid}` for year {year_param}")
        abort(422, description="No data available for this stat")

    for doc in results:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])

    return jsonify(results)


@app.route('/killFrequency/<puuid>', methods=['GET'])
def get_kill_frequency(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        # `$type: "number"` excludes matches with a missing/null/corrupted
        # kills field at the database level, instead of letting a single bad
        # record crash max() below with a None-vs-int comparison.
        {"$match": {"puuid": puuid, "stats.kills": {"$type": "number"}}},
        {"$group": {"_id": "$stats.kills", "count": {"$sum": 1}}}
    ]

    results = list(matches_collection.aggregate(pipeline))
    if not results:
        return jsonify([])

    max_kills = max(0, max(doc['_id'] for doc in results))
    freq_array = [0] * (max_kills + 1)
    for doc in results:
        if 0 <= doc['_id'] <= max_kills:
            freq_array[doc['_id']] = doc['count']

    return jsonify(freq_array)


@app.route('/deathFrequency/<puuid>', methods=['GET'])
def get_death_frequency(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid, "stats.deaths": {"$type": "number"}}},
        {"$group": {"_id": "$stats.deaths", "count": {"$sum": 1}}}
    ]

    results = list(matches_collection.aggregate(pipeline))
    if not results:
        return jsonify([])

    max_deaths = max(0, max(doc['_id'] for doc in results))
    freq_array = [0] * (max_deaths + 1)
    for doc in results:
        if 0 <= doc['_id'] <= max_deaths:
            freq_array[doc['_id']] = doc['count']

    return jsonify(freq_array)


@app.route('/kda/<puuid>', methods=['GET'])
def get_kda_extremes(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    base_pipeline = [{"$match": {"puuid": puuid}}]

    best_kda_pipeline = base_pipeline + [
        {"$sort": {"stats.kda": -1, "matchInfo.gameDuration": -1}},
        {"$limit": 1}
    ]
    worst_kda_pipeline = base_pipeline + [
        {"$sort": {"stats.kda": 1, "matchInfo.gameDuration": -1}},
        {"$limit": 1}
    ]

    best_kda = list(matches_collection.aggregate(best_kda_pipeline))
    worst_kda = list(matches_collection.aggregate(worst_kda_pipeline))

    def convert_id(doc):
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    return jsonify({
        "bestKDA": convert_id(best_kda[0]) if best_kda else {},
        "worstKDA": convert_id(worst_kda[0]) if worst_kda else {}
    })


@app.route('/mapEvents/<puuid>', methods=['GET'])
def get_map_events(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {
            "puuid": puuid,
            "queueId": {"$in": [400, 420, 430, 440, 480]}
        }},
        {"$project": {"_id": 0, "locations.kills": 1, "locations.deaths": 1}}
    ]

    result = list(matches_collection.aggregate(pipeline))

    kills = []
    deaths = []
    for match in result:
        for k in match.get("locations", {}).get("kills", []):
            kills.append(k)
        for d in match.get("locations", {}).get("deaths", []):
            deaths.append(d)

    return jsonify({"kills": kills, "deaths": deaths})


@app.route('/cs/<puuid>', methods=['GET'])
def get_cs_extremes(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    base_pipeline = [
        {"$match": {"puuid": puuid}},
        {"$addFields": {"totalCs": {"$add": ["$stats.cs", "$stats.jungleCs"]}}}
    ]

    best_cs_pipeline = base_pipeline + [
        {"$match": {"queueId": {"$in": [400, 420, 430, 440, 480]}}},
        {"$sort": {"totalCs": -1}},
        {"$limit": 3}
    ]

    worst_cs_pipeline = base_pipeline + [
        {"$match": {
            "queueId": {"$in": [400, 420, 430, 440, 480]},
            "matchInfo.gameDuration": {"$gte": 900}
        }},
        {"$sort": {"totalCs": 1}},
        {"$limit": 3}
    ]

    cs_stats_pipeline = base_pipeline + [
        {
            "$group": {
                "_id": None,
                "numGames": {"$sum": 1},
                "totalMinions": {"$sum": "$stats.cs"},
                "totalJungleMinions": {"$sum": "$stats.jungleCs"},
                "lowCsGames": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$lt": [{"$add": ["$stats.cs", "$stats.jungleCs"]}, 100]},
                                {"$gt": ["$matchInfo.gameDuration", 900]},
                                {"$in": ["$queueId", [400, 420, 430, 440, 480]]}
                            ]},
                            1, 0
                        ]
                    }
                }
            }
        }
    ]

    def convert_id(results):
        for doc in results:
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
        return results

    best_cs = convert_id(list(matches_collection.aggregate(best_cs_pipeline)))
    worst_cs = convert_id(list(matches_collection.aggregate(worst_cs_pipeline)))
    other_stats = convert_id(list(matches_collection.aggregate(cs_stats_pipeline)))

    return jsonify({"bestCs": best_cs, "worstCs": worst_cs, "stats": other_stats})


@app.route('/pings/<puuid>', methods=['GET'])
def get_ping_sums(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$group": {
                "_id": puuid,
                "All In": {"$sum": "$stats.pings.allInPings"},
                "Assist Me": {"$sum": "$stats.pings.assistMePings"},
                "Command Ping": {"$sum": "$stats.pings.commandPings"},
                "Enemy Missing": {"$sum": "$stats.pings.enemyMissingPings"},
                "Enemy Vision": {"$sum": "$stats.pings.enemyVisionPings"},
                "Get Back": {"$sum": "$stats.pings.getBackPings"},
                "Need Vision": {"$sum": "$stats.pings.needVisionPings"},
                "On My Way": {"$sum": "$stats.pings.onMyWayPings"},
                "Push": {"$sum": "$stats.pings.pushPings"},
            },
        },
        {"$project": {"_id": 0}}
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/totalStats/<puuid>', methods=['GET'])
def get_total_stats(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {
            "_id": puuid,
            "totalPlaytime": {"$sum": "$matchInfo.gameDuration"},
            "totalRankedTime": {"$sum": {"$cond": [{"$in": ["$queueId", [420, 440]]}, "$matchInfo.gameDuration", 0]}},
            "totalSummonersRift": {"$sum": {"$cond": [{"$in": ["$queueId", [400, 430, 480, 490]]}, "$matchInfo.gameDuration", 0]}},
            "totalRoamTime": {"$sum": {"$cond": [
                {"$gt": ["$matchInfo.gameDuration", 900]},
                {"$subtract": ["$matchInfo.gameDuration", 900]},
                0,
            ]}},
            "totalTimeDead": {"$sum": "$stats.timeSpentDead"},
            "timeCCingOthers": {"$sum": "$stats.timeCCingOthers"},
            "barons": {"$sum": "$stats.epicMonsters.barons"},
            "dragons": {"$sum": "$stats.epicMonsters.dragons"},
        }},
        {"$project": {"_id": 0}}
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)


@app.route('/allMatchIds/<puuid>', methods=['GET'])
def get_unique_match_ids(puuid):
    year_param = require_year_param()
    matches_collection = get_matches_collection(year_param)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$addFields": {"gameDate": {"$toDate": "$matchInfo.gameCreated"}}},
        {"$sort": {"gameDate": 1}},
        {"$project": {"_id": 0, "matchId": 1, "gameDate": 1}}
    ]

    results = list(matches_collection.aggregate(pipeline))

    seen_match_ids = set()
    unique_results = []
    for doc in results:
        match_id = doc.get("matchId")
        if match_id and match_id not in seen_match_ids:
            seen_match_ids.add(match_id)
            game_date = doc.get("gameDate")
            formatted_date = game_date.strftime("%B %d, %Y") if isinstance(game_date, datetime) else None
            unique_results.append({"matchId": match_id, "date": formatted_date})

    return jsonify(unique_results)


def _get_share_data(puuid: str, year_param: int):
    """Shared logic between /share and /get_card_preview."""
    matches_collection = get_matches_collection(year_param)

    user = player_collection.find_one({"puuid": puuid})
    if not user:
        return None

    champ_pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {"_id": "$stats.champion", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    champ = list(matches_collection.aggregate(champ_pipeline))

    playtime_pipeline = [
        {"$match": {"puuid": puuid}},
        {"$group": {"_id": None, "totalPlaytime": {"$sum": "$matchInfo.gameDuration"}}},
        {"$project": {"_id": 0, "totalPlaytime": 1}}
    ]
    playtime = list(matches_collection.aggregate(playtime_pipeline))

    username = player_collection.find_one({"puuid": puuid}, {"_id": 0, "displayName": 1, "tag": 1})

    if not champ or not playtime:
        return {"champ_name": None, "username": username, "hours_played": 0}

    return {
        "champ_name": champ[0]['_id'],
        "username": username,
        "hours_played": floor(playtime[0]["totalPlaytime"] / 3600),
    }


@app.route('/share/<puuid>')
def share_page(puuid):
    year_param = require_year_param()
    data = _get_share_data(puuid, year_param)
    if data is None:
        return {"msg": "User not found"}, 404

    return render_template(
        'share.html',
        puuid=puuid,
        champ_name=data["champ_name"],
        username=data["username"]["displayName"],
        hours_played=data["hours_played"],
        year=year_param,
    )


@app.route("/get_card_preview/<puuid>", methods=['GET'])
def get_card_preview(puuid):
    year_param = require_year_param()
    data = _get_share_data(puuid, year_param)
    if data is None:
        return {"msg": "User not found"}, 404

    return jsonify({
        "champName": data["champ_name"],
        "username": data["username"]["displayName"],
        "hoursPlayed": data["hours_played"],
    })