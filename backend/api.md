# Rifting Wrapped API Endpoints

This document outlines the backend endpoints that were implemented to provide data to our front-end website.


Example .env file to provide secrets/tokens:
```json
REACT_APP_API_ENDPOINT = "URL for hosted backend API"

// REACT_APP_API_KEY = "RIOT App API key for this project"

// MONGO_URI = "URI for backend database. Contains credentials"

// GITHUB_TOKEN = "TOKEN to allow Github Actions for this repository"
```
# Endpoints
All endpoints extend the URL stored in `REACT_APP_API_ENDPOINT` unless noted otherwise.


## GET


### General 

- [`/matchesByDate/<puuid>`](): Statistics relating to number of matches played.

- [`/forfeit/<puuid>`](): Statistics relating to number of surrendered games.

- [`/damage/<puuid>`](): Statistics relating to damage dealt and taken.

- [`/champs/<puuid>`](): Statistics relating to number of champions played.



- [`/health`](): Check if the server is up.

### Combat

- [`/highestDeathGames/<puuid>`](): Return games where player had the most deaths.

- [`/highestKillGames/<puuid>`](): Return games where player had the most kills.

- [`/matchTotals/<puuid>`](): Statistics relating to combat stats.

- [`/killFrequency/<puuid>`](): Statistics relating to number of kills, grouped by frequency.

- [`/deathFrequency/<puuid>`](): Statistics relating to number of deaths, grouped by frequency.

- [`/kda/<puuid>`](): Statistics relating to player's kda (kills/deaths/assists).


### Laning 

- [`/role/<puuid>`](): Statistics relating to roles played.

- [`/cs/<puuid>`](): Games with the player's highest/lowest cs.

- [`/objectives/<puuid>`](): Statistics relating to taken objectives.

- [`/pings/<puuid>`](): Statistics relating to number of pings used.


### Breakdown

- [`/totalStats/<puuid>`](): Statistics relating to time spent playing the game.

- [`/get_card_preview/<puuid>`](): Data used to generate a preview card for a player.



## POST


- [`/get_user`]() : Return identifying information for a specific user.

- [`/add_user`](): Creates a user object if no such user exists. Must be a valid RIOT account.


## DELETE

- [`/delete_by_puuid`](): Delete a stored account. 