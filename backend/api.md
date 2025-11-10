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

## Account


<!-- - [`/get_user`]() : Return identifying information for a specific user. -->

<details>
<summary><code>GET</code> <code style="color:orange"><b>/getUser</b></code>: Return identifying information for a specific user.</summary>

<br>

> Can identify a user by using either `puuid` or `displayName` and `tag`.

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | displayName      |  required | String   | user's RIOT display name  |
> | tag      |  required | String   | user's RIOT tagline (e.g., `NA1`, `2327`)  |


##### Example Request

```shell
curl "<API_DOMAIN>/getUser?displayName=mrwarwickwide&tag=2725"
```


##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | puuid      |  required | String   | user's RIOT puuid  |

##### Example Request

```shell
curl "<API_DOMAIN>/getUser?puuid=diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"
```


##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json`   | User Object |
> | `400` | `application/json`   | `{"code":"400","message":"Must provide either puuid or displayName AND tag"}` |
> | `404` | `application/json`   | `{"code":"404","message":"No user found with puuid '[puuid]'"}` |

<hr>
</details>

<br>

<!-- - [`/add_user`](): Creates a user object if no such user exists. Must be a valid RIOT account. -->

<details>
<summary><code>POST</code> <code style="color:orange"><b>/add_user</b></code>: Creates a user object if no such user exists. Must be a valid RIOT account. </summary>

!Add more verbose error codes

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | displayName      |  required | String   | user's RIOT display name  |
> | tag      |  required | String   | user's RIOT tagline (e.g., `NA1`, `2327`)  |
> | region      |  required | String   | user's RIOT server region (e.g., `NA1`, `EUW1`)  |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json`   |  |
> | `400` | `application/json`   | `{"code":"400","message":"Bad Request"}` |
> | `404` | `application/json`   | `{"code":"404","message":"User not found."}` |

<hr>
</details>



<br>


- [`/delete_by_puuid`](): Delete a stored account. 


## GET


### General 

<!-- - [`/matchesByDate/<puuid>`](): Statistics relating to number of matches played. -->


<details>
<summary><code>GET</code> <code style="color:orange"><b>/matchesByDate/{puuid}</b></code>: Statistics relating to number of matches played. </summary>


##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | puuid      |  required | String   | user's RIOT puuid  |
> | year       |  optional | int      | year for target stats |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json`   |  |
> | `400` | `application/json`   | `{"code":"400","message":"Bad Request"}` |


<hr>
</details>

<br>


- [`/get_user/<puuid>`](): Get basic display stats for user. Change this to combine w/ POST or change name

- [`/forfeit/<puuid>`](): Statistics relating to number of surrendered games.

- [`/damage/<puuid>`](): Statistics relating to damage dealt and taken.

- [`/champs/<puuid>`](): Statistics relating to number of champions played.



- [`/health`](): Check if the server is up.

### Combat




<details>
<summary><code>POST</code> <code style="color:orange"><b>/highestStatGames</b></code>: Return games where player had highest total. </summary>


##### Arguments

> | Name | Data Type | Default | Description |
> |---|---|---|---|
> | year      |  int | None   | Filter by year |
> | stat      |  String | `kills`   | Stat to filter by (Options: `kills`, `deaths`, `assists`)  |
> | limit     |  int | 5   | Number of returned matches (1-10) |




##### Example Request

```shell
curl "<API_DOMAIN>/highestStatGames/<PUUID>?stats=deaths&year=2025"
```


##### Responses

> | HTTP Code | Content-Type | Response |
> |---|---|---|
> | `200` | `application/json`   |  List of JSON objects containing match data. |
> | `400` | `application/json`   | `{"code":"400","message":"Invalid stat. Allowed: kills, deaths, assists"}` |
> | `404` | `application/json`   | `{"code":"404","message":"No user found with puuid '[puuid]'"}` |
> | `422` | `application/json`   | `{"code":"422","message":"No data available for this stat"}` |
<!-- > | `400` | `application/json`   | `{"code":"400","message":"Bad Request"}` | -->



<hr>
</details>




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

- [`/mapEvents/<puuid>](): Positions of player's kills and deaths on Summoner's Rift


