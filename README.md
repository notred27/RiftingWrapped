
<div align="center">


<h1><img src = "public/favicon-32x32.png" /> Rifting Wrapped 2025</h1>

**Relive your best League of Legends matches and stats this past year with Rifting Wrapped!**

  <img src="https://img.shields.io/badge/React-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Flask-ffff00?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/AWS%20Amplify-FF2088?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Render-000000?style=for-the-badge"/>
  

</div>

## Overview


**Rifting Wrapped** is a full-stack analytics website that provides yearly highlights about a player's League of Legends gameplay.  
From champion distributions and kill heatmaps to position and performance breakdowns, this app lets players rediscover their highlights with interactive visualizations.




## Features



<!-- ### See your stats! -->

- Track the number of games played, broken down by gamemode and month

- View your distribution of champions and positions played throughout the year

- View games that highlight your achievements, and your cumulative combat stats

- See a heatmap of your kills and deaths on Summoner's Rift

- View a distribution of how you spent your time playing league this year



## How It Works

This end-to-end app is powered by React, Flask, Render, and MongoDB to create a responsive and real-time experience that stays up to date on all of your latest matches. It utilizes [RIOT's public API](https://developer.riotgames.com/apis) to gather data for each user.


1) When a user initially registers (i.e., searches for an account name), we scrape their entire public match history from the past year to index it in our database.

2) The stats and match histories of these accounts are then kept up-to-date by using cron jobs on Github Actions, where recent matches are automatically added hourly to keep data fresh.

3) Finally, using a Flask API to handle database requests, our front end displays all of this data in responsive charts.


## Tech stack:

**Frontend:** React, HTML, JavaScript, CSS  
**Backend:** Flask (Python), MongoDB  
**Deployment:** AWS Amplify (frontend), Render (backend)  
**Automation:** GitHub Actions (cron-based match updaters)

> A full specification of the internal API is available at: [`backend/flask/api.md`](/backend/flask/api.md)

## Disclaimer

Rifting Wrapped uses only publicly available match data.

Rifting Wrapped is not endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
