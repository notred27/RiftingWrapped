from flask import Flask, request
from flask import jsonify
from flask_cors import CORS, cross_origin   # Import CORS module
import requests
import dotenv
# from flask_api import status
# Commands for starting flask server on Windows:
# Set-ExecutionPolicy Unrestricted -Scope Process
# .\venv\Scripts\Activate   
# flask run --debug

# REACT_APP_API_KEY

app = Flask(__name__)
# Set up CORS control (tmp for localhost)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Target to allow trafic from
app.config['CORS_HEADERS'] = 'Content-Type'


# Initial endpoint, just returns 200 to check connection
@app.route('/')
def hello_world(): 
    return jsonify({
        "status": "200",
        "message": "Lets find some tft stats!",
        "key": dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]
    }) 


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
    # Ensure that the appropriate data is in the payload
    if 'name' not in request.form or 'id' not in request.form:
         return {"puuid":"Missing name or id"}, 400

    key = dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]
    r = requests.get(f'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{request.form["name"]}/{request.form["id"]}?api_key={key}')

    # If the responce is ok, return the user's puuid 
    if (r.status_code == 200):
        return r.json(), 200
    
    return {"puuid":"Error: User not found"}, 400




@app.route("/user/<puuid>/<count>", methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def get_last_games(puuid, count):

    r = requests.get(f'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?queue=400&start=0&count={count}&api_key={dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]}')

    # If the responce is ok, return the match ids of the user's last 20 games 
    if (r.status_code == 200):
        return r.json(), 200
    
    return {"msg":"Match history not found"}, 400


@app.route("/match/<matchId>", methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def get_match(matchId):

    r = requests.get(f'https://americas.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]}')

    # If the responce is ok, return the match ids of the user's last 20 games 
    if (r.status_code == 200):
        return r.json(), 200
    
    return {"msg":"Match history not found"}, 400



