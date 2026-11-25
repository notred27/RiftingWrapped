# Rifting Wrapped API Endpoints

This document outlines the backend endpoints that were implemented to provide data to our front-end website.


Example .env file to provide secrets/tokens:

```.env
REACT_APP_API_ENDPOINT = "URL for hosted backend API"

// REACT_APP_API_KEY = "RIOT App API key for this project"

// MONGO_URI = "URI for backend database. Contains credentials"

// GITHUB_TOKEN = "TOKEN to allow Github Actions for this repository"

// Optional - share links and link previews (defaults shown)
// SITE_URL = "https://www.riftingwrapped.com"
// PUBLIC_API_URL = "https://riftingwrapped.onrender.com"
```

"Your Wrapped is ready" emails are sent by the match consumer (GitHub Actions),
not this API: set the `RESEND_API_KEY` secret and `NOTIFY_FROM` variable on the
repository's **Prod** environment. See `backend/actions/notify.py`.

# Endpoints
All endpoints extend the URL stored in `REACT_APP_API_ENDPOINT` unless noted otherwise.


## General

### <code>GET</code> <code style="color:orange"><b>[/health](/backend/api.md)</b></code>
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


### <code>POST</code> <code style="color:orange"><b>/users/{puuid}/notify?year={year}</b></code>
<details>
<summary>Email someone once when this player's Wrapped finishes processing</summary>

<br>

Body: `{"email": "me@example.com"}` (JSON or form). Rate limited to 5/hour and
20/day per IP, and at most 3 addresses per player. Addresses are stored in
`ready-notifications`, deleted once the email is sent (or after 14 days), and
never returned by any endpoint.

> | HTTP Code | Response |
> |---|---|
> | `200` | `{"subscribed": true}`, or `{"ready": true}` if the Wrapped is already done (nothing stored) |
> | `400` | Invalid email address |
> | `404` | Player not found |
> | `429` | Rate limited, or the player already has 3 sign-ups |

<hr>
</details>

### <code>GET</code> <code style="color:orange"><b>/share/{year}/{puuid}</b></code> (also <code>/share/{puuid}?year=</code>)
<details>
<summary>Share link landing page: link-preview tags, then a redirect to the Wrapped</summary>

<br>

Serves Open Graph / Twitter card tags (crawlers don't run JavaScript) and
redirects visitors to `/player/{puuid}?year={year}&from=share`. The site proxies
`www.riftingwrapped.com/s/{year}/{puuid}` here via an AWS Amplify rewrite.

<hr>
</details>

### <code>GET</code> <code style="color:orange"><b>/share/{puuid}/image.jpg?year={year}</b></code>
<details>
<summary>1200x630 link-preview image of the player's headline stats</summary>

<br>

Drawn with Pillow (`share_image.py`, fonts bundled in `fonts/`). Cached in
memory and by clients for an hour. 60 requests/minute per IP.

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

- [`/mapEvents/<puuid>`](): Where the player's kills and deaths happened on Summoner's Rift, as counts per cell of a 40x40 grid over the map (stored per player in `player-locations-YY`):

  ```json
  { "grid": 40, "kills": { "812": 3, "853": 1 }, "deaths": { "1204": 2 } }
  ```

  A cell key is `row * grid + col`, with `col = floor(x / 15000 * grid)` and `row = floor(y / 15000 * grid)` (row 0 is the bottom of the map). Cells with no events are left out; a player with no grid gets empty `kills` and `deaths`.




### Weekly

- [`/weekly/<puuid>?week={weeksAgo}&tz={offset}`](): One calendar week (Monday to Sunday) of a player's games, for the weekly recap page (`/player/<puuid>/week`). Unlike the other stats routes it takes no `year`: the week decides which `matches-YY` collections are read.

  | Param | Default | Description |
  |---|---|---|
  | `week` | `0` | Weeks back from the current one, `0`-`60` (`0` = this week so far) |
  | `tz` | `0` | Viewer's UTC offset in minutes, as JavaScript's `Date.getTimezoneOffset()` returns it (positive west of UTC). Weeks are cut at local midnight. |

  Returns `weekStart`/`weekEnd` (ISO), `thisWeek` (totals plus `topChamps`, `days` (games per day, Monday first), `bestGame`, `mostKillsGame`, `longestWinStreak`, `uniqueChamps`, `deathlessGames`), `lastWeek` (totals, for week-over-week changes), `yearToDate`, `weeklyStreak` (weeks in a row with a game, not broken until the current week ends), `activeWeeks`, `bestWeekGames` (busiest earlier week this year) and `paceHours` (projected year-end hours; current week only). `400` for an out-of-range `week`/`tz`, `404` for an unknown player.

### Leaderboards

- [`/leaderboards?period={week|year}&year={year}`](): Top 10 tracked players by `games`, `hours`, `kills`, `winRate` and `kda`, for the leaderboards page (`/leaderboards`). `year` is required only for `period=year`; `period=week` (the default is `year`) covers this week so far, Monday to Sunday in UTC, across whichever `matches-YY` collections the week touches. Win rate and KDA only rank players with at least `minGames` games (10 a week, 100 a year). Results are cached in memory for 10 minutes (`LEADERBOARD_CACHE_SECONDS`).

  Returns `period`, `start`/`end` (ISO), `minGames`, `updatedAt` and `boards`: `{games|hours|kills|winRate|kda: [{puuid, displayName, tag, region, icon, games, wins, hours, kills, winRate, kda}]}`. `400` for an unknown `period` or a missing `year`.
