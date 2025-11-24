
<div align="center">


<h1><img src = "public/favicon-32x32.png" /> Rifting Wrapped 2025</h1>


**Relive your best League of Legends matches and stats this past year with Rifting Wrapped!**



</div>


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


#### Tech stack:
> `Hosting`: AWS Amplify, Render <br/>
> `Front End`: React, HTML, JS, CSS <br/>
> `Back End`: MongoDB, Flask (Python), Github Actions 


To power this app, a custom API was created to interface between our front end and database. Details about this API can be found [here](/backend/flask/api.md).


## Disclaimer

All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. 

Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.