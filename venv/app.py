from flask import Flask, request
from flask import jsonify
from flask_cors import CORS, cross_origin   # Import CORS module
import requests
import dotenv

# Commands for starting flask server on Windows:
# Set-ExecutionPolicy Unrestricted -Scope Process
# .\venv\Scripts\Activate   
# flask run --debug


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
@app.route("/user", methods=['POST','OPTIONS'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])  # Account for CORS
def get_user_info():
    # Ensure that the appropriate data is in the payload
    if 'name' not in request.form or 'id' not in request.form:
         return {"puuid":"Missing name or id"}

    key = dotenv.dotenv_values(".env")["REACT_APP_API_KEY"]
    r = requests.get(f'https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{request.form["name"]}/{request.form["id"]}?api_key={key}')

    # If the responce is ok, return the user's puuid 
    if (r.status_code == 200):
        return r.json()
    
    return {"puuid":"Error: User not found"}
