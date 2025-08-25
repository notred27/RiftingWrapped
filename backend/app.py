from flask import Flask, request, render_template
from flask import jsonify
from flask_cors import CORS, cross_origin
import requests
import dotenv
from pymongo import MongoClient
import os
from datetime import datetime
from math import floor

app = Flask(__name__)
# Set up CORS control (tmp for localhost)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# DB connection & collection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['rifting-wrapped-2024']
matches_collection = db['player-matches']

player_collection = db['tracked-players']

# Test endpoint for GET requests
@app.route('/ping', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def ping():
    return {"message": "pong"}


# Test endpoint for POST requests, returns whatever is sent to the endpoint (payload: {"message": message to return})
@app.route('/echo', methods=['POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def echo():
    if 'message' not in request.form:
        return {"message" : "No message provided"}
    
    return {"message": request.form["message"]}


# Endpoint for finding a user's puuid based on their gamename and tagline
# Payload: {"name": gamename, "id": tagline}
@app.route("/puuid", methods=['POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def get_user_info():
    if 'name' not in request.form or 'id' not in request.form:
         return {"puuid":"Missing name or id"}, 400

    key = dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]
    r = requests.get(f'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{request.form["name"]}/{request.form["id"]}?api_key={key}')

    if (r.status_code == 200):
        return r.json(), 200
    
    return {"puuid":"Error: User not found"}, 400








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

@app.route('/highestKillGames/<puuid>', methods=['GET'])
def get_highestKillGames(puuid):
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

    pipeline.extend([
        { "$sort": { "stats.kills": -1 } },
        { "$limit": 5 }
    ])

    results = list(matches_collection.aggregate(pipeline))

    for doc in results:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])

    return jsonify(results)

@app.route('/highestDeathGames/<puuid>', methods=['GET'])
def get_highestDeathGames(puuid):
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

    pipeline.extend([
        { "$sort": { "stats.deaths": -1 } },
        { "$limit": 5 }
    ])

    results = list(matches_collection.aggregate(pipeline))

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

# @app.route('/assistFrequency/<puuid>', methods=['GET'])
# def get_assitst_frequency(puuid):
#     year_param = request.args.get('year', type=int)

#     pipeline = [
#         { "$match": { "puuid": puuid } },
#         {
#             "$addFields": {
#                 "gameDate": { "$toDate": "$matchInfo.gameCreated" }
#             }
#         }
#     ]

#     if year_param:
#         pipeline.append({
#             "$match": {
#                 "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
#             }
#         })

#     # Group by kill count and count how many times each occurred
#     pipeline.extend([
#         {
#             "$group": {
#                 "_id": "$stats.assists",
#                 "count": { "$sum": 1 }
#             }
#         }
#     ])

#     results = list(matches_collection.aggregate(pipeline))

#     # Build a full frequency array
#     max_assists = max(doc['_id'] for doc in results) if results else 0
#     freq_array = [0] * (max_assists + 1)

#     for doc in results:
#         freq_array[doc['_id']] = doc['count']

#     return jsonify(freq_array)


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
        { "$sort": { "stats.kda": -1 } },
        { "$limit": 1 }
    ]

    worst_kda_pipeline = pipeline + [
        { "$sort": { "stats.kda": 1 } },
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

@app.route('/all/<puuid>', methods=['GET'])
def get_all(puuid):
    year_param = request.args.get('year', type=int)

    pipeline = [
        { "$match": { "puuid": puuid } },
        { "$addFields": {
            "gameDate": { "$toDate": "$matchInfo.gameCreated" },
            "kdaScore": { "$add": ["$stats.kills", "$stats.assists"] },
            "isWin": "$stats.win",
            "isPositive": {
                "$gte": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"]
            },
            "isNegative": {
                "$lt": [{ "$add": ["$stats.kills", "$stats.assists"] }, "$stats.deaths"]
            },
            "totalCs": { "$add": ["$stats.cs", "$stats.jungleCs"] }
        }
        },
    ]
    if year_param:
        pipeline.append({
            "$match": {
                "$expr": { "$eq": [ { "$year": "$gameDate" }, year_param ] }
            }
        })

    # Now run all stats in one facet
    pipeline.append({
        "$facet": {
            "champCounts": [ 
                { "$group": { "_id": "$stats.champion", "count": { "$sum": 1 } } },
                { "$sort": { "count": -1 } }
            ],
            "matchesByMonth": [
                { "$addFields": {
                    "dateString": { "$dateToString": { "format": "%Y-%m-%d", "date": "$gameDate" } }
                }},
                { "$group": {
                    "_id": { "year": { "$year": "$gameDate" }, "month": { "$month": "$gameDate" }, "date": "$dateString" },
                    "dailyMatchCount": { "$sum": 1 }
                }},
                { "$group": {
                    "_id": { "year": "$_id.year", "month": "$_id.month" },
                    "totalMatches": { "$sum": "$dailyMatchCount" },
                    "uniqueDays": { "$sum": 1 }
                }},
                { "$sort": { "_id.year": 1, "_id.month": 1 } }
            ],
            "damageStats": [
                { "$group": {
                    "_id": None,
                    "magicDamageTaken": { "$sum": "$stats.magicDamageTaken" },
                    "physicalDamageTaken": { "$sum": "$stats.physicalDamageTaken" },
                    "trueDamageTaken": { "$sum": "$stats.trueDamageTaken" },
                    "magicDamageDealt": { "$sum": "$stats.magicDamageDealt" },
                    "physicalDamageDealt": { "$sum": "$stats.physicalDamageDealt" },
                    "trueDamageDealt": { "$sum": "$stats.trueDamageDealt" },
                    "avgTaken": { "$avg": { "$add": ["$stats.magicDamageTaken", "$stats.physicalDamageTaken", "$stats.trueDamageTaken"] } },
                    "avgDealt": { "$avg": { "$add": ["$stats.magicDamageDealt", "$stats.physicalDamageDealt", "$stats.trueDamageDealt"] } },
                    "timeCC": { "$sum": "$stats.timeCCingOthers" }
                }},
                {"$project": {"_id": 0}},
                
            ],
            "forfeitStats":[
                {"$group": {
                    "_id": puuid,
                    "numGames": {"$sum":1},
                    "numSurrenders": {"$sum": {"$cond":["$stats.gameEndedInSurrender",1,0]}},
                    "numSurrendersWon": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", "$stats.win"]},1,0]}},
                    "gamesEndingBefore16": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", { "$lt": ["$matchInfo.gameDuration", 960] }]},1,0]}},
                    "totalSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender","$matchInfo.gameDuration",0]}},
                    "totalNonSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender",0, "$matchInfo.gameDuration"]}},
                }},
                {"$project": {"_id": 0}},
            ],
            "objectivesTaken":[
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
                {"$project": {"_id": 0}},
            ],
            "timeBreakdown":[
                {"$group": {
                    "_id": puuid,
                    "numGames": {"$sum":1},
                    "numSurrenders": {"$sum": {"$cond":["$stats.gameEndedInSurrender",1,0]}},
                    "numSurrendersWon": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", "$stats.win"]},1,0]}},
                    "gamesEndingBefore16": {"$sum": {"$cond":[{"$and":["$stats.gameEndedInSurrender", { "$lt": ["$matchInfo.gameDuration", 960] }]},1,0]}},
                    "totalSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender","$matchInfo.gameDuration",0]}},
                    "totalNonSurrenderTime": {"$sum": {"$cond":["$stats.gameEndedInSurrender",0, "$matchInfo.gameDuration"]}},
                }},
                {"$project": {"_id": 0}},

            ],
            "positionCounts":[
                {"$group": {
                    "_id": "$stats.position",
                    "count": {"$sum": 1},
                    "winsInRole": {"$sum": {"$cond":["$stats.win",1,0]}},
                }},

            ],
            "winRates":[
                {"$group": {
                    "_id": puuid,
                    "numGames": { "$sum": 1 },
                    "totalKills": { "$sum": "$stats.kills" },
                    "totalDeaths": { "$sum": "$stats.deaths" },
                    "totalTimeDead": { "$sum": "$stats.timeSpentDead" },
                    "totalKillingSprees": { "$sum": "$stats.killingSprees" },
                    "totalTowerTakedowns": { "$sum": "$stats.towerTakedowns" },
                    "positiveWR": {
                        "$sum": {
                            "$cond": [
                                { "$and": ["$isPositive", "$isWin"] },
                                1,
                                0
                            ]
                        }
                    },
                    "negativeWR": {
                        "$sum": {
                            "$cond": [
                                { "$and": ["$isNegative", "$isWin"] },
                                1,
                                0
                            ]
                        }
                    },
                    "totalPositiveGames": {
                        "$sum": { "$cond": ["$isPositive", 1, 0] }
                    },
                    "totalNegativeGames": {
                        "$sum": { "$cond": ["$isNegative", 1, 0] }
                    }
                }
            },
                {"$project": {"_id": 0}},

            ],
            "highestKillGames": [
                { "$sort": { "stats.kills": -1 } },
                { "$limit": 5 },
                {"$project": {"_id": 0}},
            ],
            "highestDeathGames": [
                { "$sort": { "stats.deaths": -1 } },
                { "$limit": 5 },
                {"$project": {"_id": 0}},
            ],
            "bestKDA":[
                { "$sort": { "stats.kda": -1 } },
                { "$limit": 1 },
                {"$project": {"_id": 0}},
            ],
            "worstKDA":[
                { "$sort": { "stats.kda": 1 } },
                { "$limit": 1 },
                {"$project": {"_id": 0}},
            ],
            "bestCS": [
                {"$match": {
                    "queueId": { "$in": [400, 420, 430, 440, 480] }
                    }
                },
                { "$sort": { "totalCs": -1 } },
                { "$limit": 3 },
                {"$project": {"_id": 0}},
            ],
            "worstCS": [
                {"$match": {
                    "queueId": { "$in": [400, 420, 430, 440, 480] }
                    }
                },
                { "$sort": { "totalCs": 1 } },
                { "$limit": 3 },
                {"$project": {"_id": 0}},
            ],
            "csStats":[
                {"$match": {
                    "$expr": {
                        "$and": [
                            { "$gt": ["$matchInfo.gameDuration", 900] },
                            { "$in": ["$queueId", [400, 420, 430, 440, 480]] }
                            ]
                        }
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "numGames": {"$sum": 1},
                        "totalMinions": {"$sum": "$stats.cs"},
                        "totalJungleMinions": {"$sum": "$stats.jungleCs"},
                        "lowCsGames": {
                            "$sum": {
                                "$cond": [
                                    { "$lt": ["$totalCS", 100] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {"$project": {"_id": 0}},

            ]

        }
    })

    results = list(matches_collection.aggregate(pipeline))[0]


    return jsonify(results)



@app.route('/delete_by_puuid', methods=['DELETE'])
def delete_by_puuid():
    puuid = request.args.get('puuid')
    if not puuid:
        return jsonify({"error": "Missing 'puuid' parameter"}), 400

    result = matches_collection.delete_many({"puuid": puuid})
    return jsonify({
        "puuid": puuid,
        "deletedCount": result.deleted_count,
        "status": "success" if result.deleted_count > 0 else "no matches found"
    }), 200





@app.route('/add_user', methods=['POST'])
def add_by_display_name():

    if 'displayName' not in request.form or 'tag' not in request.form:
        return {"msg":"Payload is missing displayName or tag"}, 400
    
    displayName = request.form.get('displayName')
    tag = request.form.get('tag')
    ## region = request.form.get('region')

    if displayName is None or tag is None:
            return {"msg":"Payload is missing displayName or tag"}, 400

    key = dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]
    r = requests.get(f'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{displayName}/{tag}?api_key={key}')

    if (r.status_code == 200):
        data = r.json()
        result = player_collection.update_one(
            {"displayName": displayName},
            {"$set": {"displayName": displayName, "tag":tag, "puuid": data["puuid"]}},
            upsert=True
        )

        return {"matched_count": result.matched_count, "modified_count": result.modified_count, "msg":"User added successfully."}, 200

    if (r.status_code == 404):
        return {"msg":"User not found"}, 404

    return {"msg":"Error fetching data from riot API"}, 400



@app.route('/get_user', methods=['POST'])
def get_player_info():
    if 'displayName' not in request.form or 'tag' not in request.form:
        return {"msg":"Payload is missing displayName or tag"}, 400
    
    displayName = request.form.get('displayName')
    tag = request.form.get('tag')
    ## region = request.form.get('region')

    if displayName is None or tag is None:
            return {"msg":"Payload is missing displayName or tag"}, 400
    
    pipeline = [
    {
        "$match": {
            "displayName": { "$regex": f"^{displayName}$", "$options": "i" },
            "tag": { "$regex": f"^{tag}$", "$options": "i" }
        }
    },
    {
        "$project": { "_id": 0 }
    }
]

    results = list(player_collection.aggregate(pipeline))

    if(len(results) < 1):
        return jsonify({"msg":"User not found"}), 404


    return jsonify(results), 200



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


@app.route("/get_user/<puuid>", methods=['GET'])
def get_user(puuid):

    user_info = player_collection.find_one(
        { "puuid": puuid },
        { "_id": 0, "displayName": 1, "tag": 1 , "level":1 , "icon":1}
    )

    return user_info


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
