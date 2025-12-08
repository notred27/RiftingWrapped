from flask import Flask, request, render_template, abort
from flask import jsonify
from flask_cors import CORS
import requests
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import os
from datetime import datetime
from math import floor


app = Flask(__name__, template_folder='./templates')
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# DB connection & collection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['rifting-wrapped-2024']

matches_collection = db['player-matches']
player_collection = db['tracked-players']



LOL_VERSION = requests.get("https://ddragon.leagueoflegends.com/api/versions.json").json()[0]
print(f"Using LoL version: {LOL_VERSION}")

# Helper translation for regions
def get_routing_region(region: str) -> str:
    region = region.upper()

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
    try:
        count = player_collection.count_documents({})

        return jsonify({"count": count}), 200

    except PyMongoError as e:
        abort(500, description=f"Database error occurred: {str(e)}")


@app.route('/users/all', methods=['GET'])
def get_all_users():
    try:
        users = list(player_collection.find(
            {}, 
            {"_id": 0, "displayName": 1, "tag": 1, "region": 1, "icon":1}
        ))

        return jsonify(users), 200

    except PyMongoError as e:
        abort(500, description=f"Database error occurred: {str(e)}")


@app.route('/users/<puuid>', methods=['GET'])
def get_user_info(puuid):
    try:
        result = player_collection.find_one({"puuid":puuid}, {"_id": 0})

        if not result:
            abort(404, description=f"No user found with puuid `{puuid}`")

        return jsonify(result), 200

    except PyMongoError as e:
        return abort(500, description=f"Database error occurred: {str(e)}")


@app.route('/users/by-riot-id/<displayName>/<tag>', methods=['GET'])
def get_user_info_by_name(displayName, tag):
    query = {}
    query["displayName"] = {"$regex": f"^{displayName}$", "$options": "i"}
    query["tag"] = {"$regex": f"^{tag}$", "$options": "i"}

    try:
        result = player_collection.find_one(query, {"_id": 0})

        if not result:
            abort(404, description=f"No user found with displayName `{displayName}` and tag `{tag}`")

        return jsonify(result), 200

    except PyMongoError as e:
        return abort(500, description=f"Database error occurred: {str(e)}")

MAX_DISPLAYNAME_LEN = 20
MAX_TAG_LEN = 6
RIOT_TIMEOUT = 5  # seconds

@app.route('/users', methods=['POST'])
def add_by_display_name():

    if 'displayName' not in request.form or 'tag' not in request.form:
        return {"msg":"Payload is missing displayName or tag"}, 400
    
    displayName = request.form.get('displayName')
    tag = request.form.get('tag')
    region = request.form.get('region')


    if not (displayName and tag):
        return jsonify({"error": "Bad Request", "message": "Must provide a valid RIOT account displayName AND tag"}), 400

    if len(displayName) > MAX_DISPLAYNAME_LEN or len(tag) > MAX_TAG_LEN:
            return jsonify({"error": "Bad Request", "message": "displayName or tag too long"}), 400

    displayName = displayName.strip()
    tag = tag.strip()

    riot_key = os.getenv("REACT_APP_API_KEY")
    if not riot_key:
        print("Missing Riot API key in environment (add logger)")
        return jsonify({"error": "Server Misconfiguration", "message": "Riot API key missing"}), 500


    riot_url = f'https://{get_routing_region(region)}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{displayName}/{tag}?api_key={riot_key}'
   
    try:
        r = requests.get(riot_url, timeout=RIOT_TIMEOUT)
    except requests.RequestException as e:
        print("Riot API request failed")
        return jsonify({"error": "Bad Gateway", "message": "Failed to contact Riot API"}), 502


    if (r.status_code == 404):
        return jsonify({"error": "Not Found", "message": "User not found on Riot's servers"}), 404


    if (r.status_code != 200):
        return jsonify({"error": "Bad Gateway", "message": "Riot API encountered an error"}), 502


    try:
        riot_data = r.json()

        existing = player_collection.find_one({"puuid": riot_data["puuid"]}, {"_id":0})
        if existing:
            return jsonify({"error":"Conflict","message":"User exists","user": existing}), 409


        user_doc = {
            "$set": {
                "displayName": displayName,
                "tag": tag,
                "puuid": riot_data["puuid"],
                "region": region.upper(),
                "status": "starting",
            },
        }

        result = player_collection.update_one({"puuid": riot_data["puuid"]}, user_doc, upsert=True)

    except (ValueError, KeyError) as e:
        # logger.exception("Error parsing Riot response")
        return jsonify({"error": "Bad Gateway", "message": f"Invalid Riot response format {str(e)}"}), 502
    except PyMongoError:
        # logger.exception("Database error while upserting user")
        return jsonify({"error": "Internal Server Error", "message": "Database error"}), 500
    



    try:
        GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
        url = f"https://api.github.com/repos/notred27/RiftingWrapped/actions/workflows/player_init.yaml/dispatches"
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {GITHUB_TOKEN}"
        }
        payload = {
            "ref": "master",
            "inputs": {
                "displayName": displayName,
                "tag": tag,
                "region": region
            }
        }
        r = requests.post(url, headers=headers, json=payload)
        if r.status_code == 204:
            print(f"GitHub Action triggered for {displayName}#{tag} in {region}")
        else:
            print(f"Failed to trigger workflow: {r.status_code} {r.text}")


        return {"matched_count": result.matched_count, "modified_count": result.modified_count, "msg":"User added successfully."}, 200

    except Exception as e:
        pass

    if result.upserted_id:
        status_code = 201
        message = "User created successfully"
    else:
        status_code = 200
        message = "User updated successfully"

    return jsonify({
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

    try:
        require_admin_key()
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401


    try:
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
                "message": "Re-run with ?confirm=true to perform deletion"
            }), 200

        result = matches_collection.delete_many({"puuid": puuid})
        user = player_collection.delete_one({"puuid": puuid})

        return jsonify({
            "puuid": puuid,
            "numUserDeleted": user.deleted_count,
            "numMatchesDeleted": result.deleted_count,
            "status": "success" if result.deleted_count > 0 else "no matches found"
        }), 204

    except PyMongoError as e:
        return jsonify({"error": "Internal Server Error", "message": "Database error"}), 500




### ======================= GET ======================= ###


@app.route('/champs/<puuid>', methods=['GET'])
def get_champ_counts(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": "$stats.champion",
            "count": {"$sum": 1},
        }},
        {"$sort": {
            "count": -1
        }}
    ]

    results = list(matches_collection.aggregate(pipeline))

    for doc in results:
        doc['champion'] = doc.pop('_id')

    return jsonify(results)

@app.route('/matchesByDate/<puuid>', methods=['GET'])
def get_game_dates(puuid):
    year_param = request.args.get('year', type=int)  # e.g. ?year=2025

    pipeline = [
        {"$match": {"puuid": puuid}},

        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        },
    ]

    
    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {
            "$addFields": {
                "dateString": {
                    "$dateToString": { "format": "%Y-%m-%d", "date": "$gameDate" }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "year": { "$year": "$gameDate" },
                    "month": { "$month": "$gameDate" },
                    "date": "$dateString"
                },
                "dailyMatchCount": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": {
                    "year": "$_id.year",
                    "month": "$_id.month"
                },
                "totalMatches": { "$sum": "$dailyMatchCount" },
                "uniqueDays": { "$sum": 1 }
            }
        },
        {
            "$sort": {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]

    results = list(matches_collection.aggregate(pipeline))
    return jsonify(results)

@app.route('/damage/<puuid>', methods=['GET'])
def get_damage(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": puuid,
            "magicDamageTaken": {"$sum": "$stats.magicDamageTaken"},
            "physicalDamageTaken": {"$sum": "$stats.physicalDamageTaken"},
            "trueDamageTaken": {"$sum": "$stats.trueDamageTaken"},

            "magicDamageDealt": {"$sum": "$stats.magicDamageDealt"},
            "physicalDamageDealt": {"$sum": "$stats.physicalDamageDealt"},
            "trueDamageDealt": {"$sum": "$stats.trueDamageDealt"},

            "avgTaken": {"$avg": {"$add": ["$stats.magicDamageTaken", "$stats.physicalDamageTaken", "$stats.trueDamageTaken"]} },
            "avgDealt": {"$avg": {"$add": ["$stats.magicDamageDealt", "$stats.physicalDamageDealt", "$stats.trueDamageDealt"]} },
            "timeCC": {"$sum": "$stats.timeCCingOthers"},
        }},
        
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/forfeit/<puuid>', methods=['GET'])
def get_forfeit(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum":1},
            "numSurrenders": {"$sum": {"$cond":["$stats.gameEndedInSurrender",1,0]}},
            "numSurrendersWon": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", "$stats.win"]},1,0]}},
            "gamesEndingBefore16": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", { "$lt": ["$matchInfo.gameDuration", 960] }]},1,0]}},
            "totalSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender","$matchInfo.gameDuration",0]}},
            "totalNonSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender",0, "$matchInfo.gameDuration"]}},
        }},
        
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/objectives/<puuid>', methods=['GET'])
def get_objectives(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum":1},
            "barons": { "$sum": "$stats.epicMonsters.barons"},
            "dragons": { "$sum": "$stats.epicMonsters.dragons"},
            "riftHeralds": { "$sum": "$stats.epicMonsters.riftHeralds"},
            "voidGrubs": { "$sum": "$stats.epicMonsters.voidGrubs"},
            "atakhans": { "$sum": "$stats.epicMonsters.atakhan"},
            "towers" : {"$sum":"$stats.turretKills"},
            "inhibitors" : {"$sum":"$stats.inhibitors"}
        }},
        
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/timeBreakdown/<puuid>', methods=['GET'])
def get_breakdown(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": puuid,
            "numGames": {"$sum":1},
            "numSurrenders": {"$sum": {"$cond":["$stats.gameEndedInSurrender",1,0]}},
            "numSurrendersWon": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", "$stats.win"]},1,0]}},
            "gamesEndingBefore16": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", { "$lt": ["$matchInfo.gameDuration", 960] }]},1,0]}},
            "totalSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender","$matchInfo.gameDuration",0]}},
            "totalNonSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender",0, "$matchInfo.gameDuration"]}},
        }},
        
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/role/<puuid>', methods=['GET'])
def get_role(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": "$stats.position",
            "count": {"$sum": 1},
            "winsInRole": {"$sum": {"$cond":["$stats.win",1,0]}},
        }},
        
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/matchTotals/<puuid>', methods=['GET'])
def get_matchTotals(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
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
                            {
                                "$and": [
                                    { "$gte": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"] },
                                    { "$eq": ["$stats.win", True] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "negativeWR": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    { "$lt": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"] },
                                    { "$eq": ["$stats.win", True] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "totalPositiveGames": {
                    "$sum": {
                        "$cond": [
                            { "$gte": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"] },
                            1,
                            0
                        ]
                    }
                },
                "totalNegativeGames": {
                    "$sum": {
                        "$cond": [
                            { "$lt": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"] },
                            1,
                            0
                        ]
                    }
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
    stat = request.args.get('stat', default='kills', type=str).lower()
    year_param = request.args.get('year', type=int)
    limit = request.args.get('limit', default=5, type=int)

    # validate params
    if stat not in ALLOWED_GAME_STATS:
        return abort(400, description=f"Invalid stat. Allowed: {', '.join(ALLOWED_GAME_STATS.keys())}")

    if limit < 1:
        limit = 1
    if limit > MAX_GAMES_LIMIT:
        limit = MAX_GAMES_LIMIT

    sort_field = ALLOWED_GAME_STATS[stat]

    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    # Year
    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Sort and limit (duration for ties)
    pipeline.extend([
        { "$sort": { sort_field: -1, "matchInfo.gameDuration": -1 } },
        { "$limit": limit }
    ])

    results = list(matches_collection.aggregate(pipeline))


    if not results:
        # Check for user
        exists = matches_collection.find_one({ "puuid": puuid })
        if not exists:
            abort(404, description=f"No user found with puuid `{puuid}`")

        abort(422, description="No data available for this stat")

    # Stringify ObjectId
    for doc in results:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])

    return jsonify(results)




@app.route('/killFrequency/<puuid>', methods=['GET'])
def get_kill_frequency(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Group by kill count and count how many times each occurred
    pipeline.extend([
        {
            "$group": {
                "_id": "$stats.kills",
                "count": { "$sum": 1 }
            }
        }
    ])

    results = list(matches_collection.aggregate(pipeline))

    # Build a full frequency array
    max_kills = max(doc['_id'] for doc in results) if results else 0
    freq_array = [0] * (max_kills + 1)

    for doc in results:
        freq_array[doc['_id']] = doc['count']

    return jsonify(freq_array)

@app.route('/deathFrequency/<puuid>', methods=['GET'])
def get_death_frequency(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Group by kill count and count how many times each occurred
    pipeline.extend([
        {
            "$group": {
                "_id": "$stats.deaths",
                "count": { "$sum": 1 }
            }
        }
    ])

    results = list(matches_collection.aggregate(pipeline))

    # Build a full frequency array
    max_deaths = max(doc['_id'] for doc in results) if results else 0
    freq_array = [0] * (max_deaths + 1)

    for doc in results:
        freq_array[doc['_id']] = doc['count']

    return jsonify(freq_array)


@app.route('/kda/<puuid>', methods=['GET'])
def get_kda_extremes(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Pipelines for best and worst KDA
    best_kda_pipeline = pipeline + [
        { "$sort": { "stats.kda": -1, "matchInfo.gameDuration": -1} },
        { "$limit": 1 }
    ]

    worst_kda_pipeline = pipeline + [
        { "$sort": { "stats.kda": 1, "matchInfo.gameDuration": -1 } },
        { "$limit": 1 }
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
    year_param = request.args.get('year', type=int)

    pipeline = [
        {
            "$match": {
                "puuid": puuid,
                "queueId": { "$in": [400, 420, 430, 440, 480] }
            }
        },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline.append({
        "$project": {
            "_id": 0,
            "locations.kills": 1,
            "locations.deaths": 1
        }
    })

    result = list(matches_collection.aggregate(pipeline))

    kills = []
    deaths = []

    for match in result:
        for k in match.get("locations", {}).get("kills", []):
            kills.append(k)
        for d in match.get("locations", {}).get("deaths", []):
            deaths.append(d)

    return jsonify({
        "kills": kills,
        "deaths": deaths
    })

@app.route('/cs/<puuid>', methods=['GET'])
def get_cs_extremes(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" },
                "totalCs": { "$add": ["$stats.cs", "$stats.jungleCs"] }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Pipelines for best and worst KDA
    best_cs_pipeline = pipeline + [
        {
            "$match": {
                "queueId": { "$in": [400, 420, 430, 440, 480] }
            }
        },
        { "$sort": { "totalCs": -1 } },
        { "$limit": 3 }
    ]

    worst_cs_pipeline = pipeline + [
        {
            "$match": {
            "queueId": { "$in": [400, 420, 430, 440, 480] },
            "matchInfo.gameDuration": { "$gte": 900 } 
        }
        },
        { "$sort": { "totalCs": 1 } },
        { "$limit": 3 }
    ]

    cs_stats = pipeline + [
        {
            "$group": {
                "_id": None,
                "numGames": {"$sum": 1},
                "totalMinions": {"$sum": "$stats.cs"},
                "totalJungleMinions": {"$sum": "$stats.jungleCs"},
                "lowCsGames": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    { "$lt": [ { "$add": ["$stats.cs", "$stats.jungleCs"] }, 100 ] },
                                    { "$gt": ["$matchInfo.gameDuration", 900] },
                                    { "$in": ["$queueId", [400, 420, 430, 440, 480]] }
                                ]
                            },
                            1,
                            0
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
    other_stats = convert_id(list(matches_collection.aggregate(cs_stats)))
 


    return jsonify({
        "bestCs": best_cs,
        "worstCs": worst_cs,
        "stats": other_stats
    })

@app.route('/pings/<puuid>', methods=['GET'])
def get_ping_sums(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
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
        {
        "$project": {
            "_id": 0  
        }
        }
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/totalStats/<puuid>', methods=['GET'])
def get_total_stats(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        {"$match": {"puuid": puuid}},
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    pipeline += [
        {"$group": {
            "_id": puuid,
            
            "totalPlaytime": {"$sum":"$matchInfo.gameDuration"},
            "totalRankedTime": {
                "$sum": {
                    "$cond": [
                        { "$in": ["$queueId", [420, 440]] },
                        "$matchInfo.gameDuration",
                        0
                    ]
                }
            },
            "totalSummonersRift": {
                "$sum": {
                    "$cond": [
                        { "$in": ["$queueId", [400, 430,480, 490]] },
                        "$matchInfo.gameDuration",
                        0
                    ]
                }
            },
            "totalRoamTime": {"$sum":
                              {"$cond": [
                                  {"$gt": ["$matchInfo.gameDuration", 900] },
                                  { "$subtract": ["$matchInfo.gameDuration", 900] },
                                  0,
                              ]}
                              },

            "totalTimeDead": {"$sum": "$stats.timeSpentDead"},
            "timeCCingOthers": {"$sum": "$stats.timeCCingOthers"},
            "barons": { "$sum": "$stats.epicMonsters.barons"},
            "dragons": { "$sum": "$stats.epicMonsters.dragons"},
        }
        },
        {"$project": {"_id": 0}}
    ]

    results = list(matches_collection.aggregate(pipeline))

    return jsonify(results)

@app.route('/allMatchIds/<puuid>', methods=['GET'])
def get_unique_match_ids(puuid):
    year_param = request.args.get('year', type=int)

    # Aggregation pipeline
    pipeline = [
        { "$match": { "puuid": puuid } },
        {
            "$addFields": {
                "gameDate": { "$toDate": "$matchInfo.gameCreated" }
            }
        }
    ]

    # Filter by year if specified
    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Sort by date (ascending)
    pipeline.append({ "$sort": { "gameDate": 1 } })

    # Only return matchId and gameDate
    pipeline.append({
        "$project": {
            "_id": 0,
            "matchId": 1,
            "gameDate": 1
        }
    })

    # Run aggregation
    results = list(matches_collection.aggregate(pipeline))

    # Deduplicate by matchId and format the date
    seen_match_ids = set()
    unique_results = []
    for doc in results:
        match_id = doc.get("matchId")
        if match_id and match_id not in seen_match_ids:
            seen_match_ids.add(match_id)
            game_date = doc.get("gameDate")
            if isinstance(game_date, datetime):
                formatted_date = game_date.strftime("%B %d, %Y")
            else:
                formatted_date = None
            unique_results.append({
                "matchId": match_id,
                "date": formatted_date
            })

    return jsonify(unique_results)








@app.route('/share/<puuid>')
def share_page(puuid):
    year_param = 2025

    user = player_collection.find_one({"puuid": puuid})
    if not user:
        return {"msg": "User not found"}, 404

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$addFields": {"gameDate": {"$toDate": "$matchInfo.gameCreated"}}}
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": {"$eq": [{"$year": "$gameDate"}, year_param]}
            }
        })

    pipeline += [
        {"$group": {
            "_id": "$stats.champion",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]

    champ = list(matches_collection.aggregate(pipeline))

    pipeline = [
        { "$match": { "puuid": puuid } },
        { "$addFields": { "gameDate": { "$toDate": "$matchInfo.gameCreated" } } }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [{ "$year": "$gameDate" }, year_param] }
            }
        })

    pipeline += [
        {
            "$group": {
                "_id": None,
                "totalPlaytime": { "$sum": "$matchInfo.gameDuration" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "totalPlaytime": 1
            }
        }
    ]

    playtime = list(matches_collection.aggregate(pipeline))

    totalPlaytime = floor(playtime[0]["totalPlaytime"] / 3600)

    username = player_collection.find_one(
        { "puuid": puuid },
        { "_id": 0, "displayName": 1, "tag": 1 }
    )

    return render_template('share.html',
                           puuid=puuid,
                           champ_name=champ[0]['_id'],
                           username=username['displayName'],
                           hours_played=totalPlaytime,
                           year=year_param or "this year")



@app.route("/get_card_preview/<puuid>", methods=['GET'])
def get_card_preview(puuid):
    year_param = request.args.get('year', type=int)

    user = player_collection.find_one({"puuid": puuid})
    if not user:
        return {"msg": "User not found"}, 404

    pipeline = [
        {"$match": {"puuid": puuid}},
        {"$addFields": {"gameDate": {"$toDate": "$matchInfo.gameCreated"}}}
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": {"$eq": [{"$year": "$gameDate"}, year_param]}
            }
        })

    pipeline += [
        {"$group": {
            "_id": "$stats.champion",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]

    champ = list(matches_collection.aggregate(pipeline))

    pipeline = [
        { "$match": { "puuid": puuid } },
        { "$addFields": { "gameDate": { "$toDate": "$matchInfo.gameCreated" } } }
    ]

    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [{ "$year": "$gameDate" }, year_param] }
            }
        })

    pipeline += [
        {
            "$group": {
                "_id": None,
                "totalPlaytime": { "$sum": "$matchInfo.gameDuration" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "totalPlaytime": 1
            }
        }
    ]

    playtime = list(matches_collection.aggregate(pipeline))

    totalPlaytime = floor(playtime[0]["totalPlaytime"] / 3600)

    username = player_collection.find_one(
        { "puuid": puuid },
        { "_id": 0, "displayName": 1, "tag": 1 }
    )


    return jsonify({"champName":champ[0]['_id'],
                    "username":username['displayName'],
                    "hoursPlayed":totalPlaytime})
