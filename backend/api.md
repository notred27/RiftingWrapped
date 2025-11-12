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


## General


### <code>GET</code> <code style="color:orange"><b>/health</b></code>
<details>
  <summary>Check if the server is up.</summary>

  ##### Parameters

  > None

  ##### Example Request

  ```shell
  curl "<API_DOMAIN>/health"
  ```


  ##### Responses

  > | HTTP Code | Content-Type | Response |
  > |---|---|---|
  > | `200` | `application/json`   | `{"code":"200","message":"Server is up."}` |
  > | `Failed to fetch` | -   | - |

</details>

  <hr>



<br>
<br>


## User Management


### <code>GET</code> <code style="color:orange"><b>/users/{puuid}</b></code>
<details>
  <summary>Return identifying information about a specific user.</summary>

  ##### Parameters

  > | Name | Type | Data Type | Description |
  > |---|---|---|---|
  > | puuid      |  required | String   | user's RIOT puuid  |

  ##### Example Request

  ```shell
  curl "<API_DOMAIN>/users/diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"
  ```


  ##### Responses

  > | HTTP Code | Content-Type | Response |
  > |---|---|---|
  > | `200` | `application/json`   | User Object |
  > | `404` | `application/json`   | `{"code":"404","message":"No user found with puuid '[puuid]'"}` |

</details>

  <hr>


### <code>GET</code> <code style="color:orange"><b>/users/by-riot-id/{displayName}/{tag}</b></code>
<details>
  <summary>Return identifying information about a specific user.</summary>

  ##### Parameters

  > | Name | Type | Data Type | Description |
  > |---|---|---|---|
  > | displayName      |  required | String   | user's RIOT display name  |
  > | tag      |  required | String   | user's RIOT tagline (e.g., `NA1`, `2327`)  |


  ##### Example Request

  ```shell
  curl "<API_DOMAIN>/users/by-riot-id/mrwarwickwide/2725"
  ```


  ##### Responses

  > | HTTP Code | Content-Type | Response |
  > |---|---|---|
  > | `200` | `application/json`   | User Object |
  > | `404` | `application/json`   | `{"code":"404","message":"No user found with puuid '[puuid]'"}` |

</details>

<hr>




### <code>POST</code> <code style="color:orange"><b>/users</b></code>
<details>
  <summary>Creates a user object if no such user exists. Must be a valid RIOT account.</summary>

  ##### Payload Parameters

  > | Name | Type | Data Type | Description |
  > |---|---|---|---|
  > | displayName      |  required | String   | user's RIOT display name  |
  > | tag      |  required | String   | user's RIOT tagline (e.g., `NA1`, `2327`)  |
  > | region      |  required | String   | user's RIOT server region (e.g., `NA1`, `EUW1`) |

  ##### Example Request

  ```powershell
  curl `
    -X POST `
    -H "Content-Type: application/x-www-form-urlencoded" `
    -d "displayName=<DISPLAY_NAME>" `
    -d "tag=<TAGLINE>" `
    -d "region=<REGION_CODE>" `
    "<API_DOMAIN>/users" 
  ```

  ##### Responses

  > | HTTP Code | Content-Type | Response |
  > |---|---|---|
  > | `201` | `application/json`   | `{"code":"201","message":"User created successfully"}` |
  > | `400` | `application/json`   | `{"code":"400","message":"Must provide a valid RIOT account displayName AND tag"}` |
  > | `400` | `application/json`   | `{"code":"400","message":"displayName or tag too long"}` |
  > | `404` | `application/json`   | `{"code":"404","message":"User not found on Riot's servers"}` |
  > | `409` | `application/json`   | `{"code":"409","message":"User exists"}` |
  > | `500` | `application/json`   | `{"code":"500","Riot API key missing"}` |
  > | `502` | `application/json`   | `{"code":"502","Riot API encountered an error"}` |
  <!-- > | `200` | `application/json`   | `{"code":"200","message":"User updated successfully"}` | -->

</details>

<hr>

### <code>DELETE</code> <code style="color:orange"><b>/users/{puuid}</b></code>
<details>
<summary>Delete a user's account and stored information related to the account</summary>

<br>

> `NOTE:` Requires a valid Rifting Wrapped API key

##### Parameters

> | Name | Type | Data Type | Description |
> |---|---|---|---|
> | puuid      |  required | String   | user's RIOT puuid  |
> | confirm      |  optional | boolean   | Confirmation to delete the records. Nothing will be deleted if this parameter is not set to `true`  |



##### Example Request

Returns 200 if successful, but no records are deleted as confirm is not set.

```powershell
curl -X DELETE -H "X-API-Key: <ADMIN_API_KEY>" "<API_DOMAIN>/users/<PUUID>"
```

Returns 204 and deletes relevant records

```powershell
curl -X DELETE -H "X-API-Key: <ADMIN_API_KEY>" "<API_DOMAIN>/users/<PUUID>&confirm=true"
```

##### Responses

> | HTTP Code | Content-Type | Response |
> |---|---|---|
> | `200` | `application/json`   | Player object and number of match records for that player. |
> | `204` | `application/json`   | `{"code":"204","message":"No content"}` |
> | `400` | `application/json`   | `{"code":"404","message":"Missing puuid"}` |
> | `401` | `application/json`   | `{"code":"404","message":"Unauthorized"}` |
> | `404` | `application/json`   | `{"code":"404","message":"No user or matches found"}` |




<hr>
</details>


<br>

<br>

## GET


### General 

<!-- - [`/matchesByDate/<puuid>`](): Statistics relating to number of matches played. -->

### <code>GET</code> <code style="color:orange"><b>/users/{puuid}/playtime</b></code>

-> combine forfeit, matchesByData, champs

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


<!-- - [`/get_user/<puuid>`](): Get basic display stats for user. Change this to combine w/ POST or change name -->

- [`/forfeit/<puuid>`](): Statistics relating to number of surrendered games.

- [`/damage/<puuid>`](): Statistics relating to damage dealt and taken.

- [`/champs/<puuid>`](): Statistics relating to number of champions played.




### Combat




<details>
<summary><code>GET</code> <code style="color:orange"><b>/highestStatGames</b></code>: Return games where player had highest total. </summary>


##### Arguments

> | Name | Data Type | Default | Description |
> |---|---|---|---|
> | year      |  int | None   | Filter by year |
> | stat      |  String | `kills`   | Stat to filter by (Options: `kills`, `deaths`, `assists`)  |
> | limit     |  int | 5   | Number of returned matches (1-10) |




##### Example Request

```powershell
curl "<API_DOMAIN>/highestStatGames/<PUUID>?stat=deaths&year=2025"
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


