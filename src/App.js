import { useEffect, useState } from 'react';
import playerData from './player_data/MrWarwickWide_match_data.json';

import logo from './images/penguin.png';

import Hist from './Hist.js'



import top from './images/top.svg'
import mid from './images/mid.svg'
import bot from './images/bot.svg'
import sup from './images/sup.svg'
import jg from './images/jg.svg'
import KDA_section from './KDA_section.js';

import ChampSection from './ChampSection.js';
import DamageSection from './DamageSection.js';
import FFSection from './FFSection.js';


function App() {
  const [puuid, setPuuid] = useState("")


  const [highestCS, setHighestCS] = useState([]);

  const [ChampSec, setChampSec] = useState([]);
  const [DmgSec, setDmgSec] = useState([]);
  const [FFSec, setFFSec] = useState([]);


  const [KDA_Section, setKDA_Section] = useState([]);


  const [matchData, setMatchData] = useState([]);


  // Number of games to fetch
  const count = 20


  // Get matches when a valid user is entered
  useEffect(() => {
    if (puuid !== "") {
      // Fetch from the flask server
    //   fetch(`http://localhost:5000/user/${puuid}/${count}`) // Get user's x most recent draft games
    //     .then(res => res.json())  // Wait for the promise to resolve

    //     .then(data => {           // Process the data with from the JSON object

    //       const matchList = []  // Temp list of matches for batched request
    //       if (data.length !== 0) {

    //         const fetchPromises = data.map(matchId =>
    //           fetch(`http://localhost:5000/match/${matchId}`)
    //             .then(res => res.json())  // Wait for the promise to resolve
    //             .then(matches => {
    //               matchList.push(matches);  // Add the fetched data to matchList
    //             })
    //         );

    //         // Wait till all promises are resolved, then update useState with this data
    //         Promise.all(fetchPromises)
    //           .then(() => { setMatchData(matchList); }) // Update the match list
    //           .catch(error => { console.error('Error with fetch:', error); });

    //       }

    //     })

    //     .catch((error) => console.error(error))

      setMatchData(playerData)
    }


  }, [puuid])

  // useEffect(() => {
  // }, [matchData])



  // Highest CS
  useEffect(() => {
    const m = matchData.sort((a, b) => {
      const ta = a.info.participants[a.metadata.participants.indexOf(puuid)]
      const tb = b.info.participants[b.metadata.participants.indexOf(puuid)]

      // match.info.totalMinionsKilled	+ match.info.totalAllyJungleMinionsKilled	+ match.info.totalEnemyJungleMinionsKilled
      return (tb.totalMinionsKilled + tb.totalAllyJungleMinionsKilled + tb.totalEnemyJungleMinionsKilled) - (ta.totalMinionsKilled + ta.totalAllyJungleMinionsKilled + ta.totalEnemyJungleMinionsKilled)
    })

    const cs = []
    for (let i = 0; i < m.length; i++) {
      cs.push(process_cs_match(m[i]))
    }


    setChampSec(<ChampSection puuid={puuid} matchData={matchData}></ChampSection>)
    setDmgSec(<DamageSection puuid={puuid} matchData={matchData}></DamageSection>)
    setFFSec(<FFSection puuid={puuid} matchData={matchData}></FFSection>)
    setKDA_Section(<KDA_section puuid={puuid} matchData={matchData}></KDA_section>)

    setHighestCS(cs)
  }, [matchData])


  function process_cs_match(match) {
    const targetPlayer = match.metadata.participants.indexOf(puuid)
    const stats = match.info.participants[targetPlayer]

    // console.log(match)
    let img
    switch (stats.individualPosition) {
      case "TOP":
        img = <img src={top} alt='top_icon' />
        break;

      case "BOTTOM":
        img = <img src={bot} alt='bot_icon' />
        break;

      case "MIDDLE":
        img = <img src={mid} alt='mid_icon' />
        break;

      case "UTILITY":
        img = <img src={sup} alt='sup_icon' />
        break;

      case "JUNGLE":
        img = <img src={jg} alt='jg_icon' />
        break;

      default:
        img = <p>{stats.teamPosition}</p>
    }

    return (
      <div className='tableEntry' style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", width: "45vw" }}>

        {/* <p>{match.info.gameMode}</p> */}

        <p>{new Date(match.info.gameCreation).toLocaleString().split(',')[0]}</p>

        <span>{img}</span>
        {/* Maybe change this to .individualPosition? */}

        <p>{stats.championName}</p>

        <p>{stats.kills + "/" + stats.deaths + "/" + stats.assists}</p>


        {stats.win ? <p style={{ color: "#44FF44" }}>Win</p> : <p style={{ color: "#ff4444" }}>Loss</p>}

        <p>{Math.floor(match.info.gameDuration / 60) + "m" + match.info.gameDuration % 60 + "s"}</p>

        <p>{stats.totalMinionsKilled + stats.totalAllyJungleMinionsKilled + stats.totalEnemyJungleMinionsKilled}</p>


        <p>{Math.round((stats.totalMinionsKilled + stats.totalAllyJungleMinionsKilled + stats.totalEnemyJungleMinionsKilled) / (match.info.gameDuration / 60) * 100) / 100}</p>


      </div>);
  }



  // .totalMinionsKilled gives CS
  // .totalTimeSpentDead

  function get_puuid() {
    // Get user data from the input
    const name = document.getElementById("name_entry").value;

    // Only send request if both the username and tag are included
    if (name.indexOf("#") === -1) {
      setPuuid("Error: Please include your tagline (username#xxxx)")

    } else {
      let n = name.split("#")

      // Set up the payload for the request
      const formData = new FormData();
      formData.append('name', n[0]);
      formData.append('id', n[1]);

      // Fetch from the flask server
      fetch("http://localhost:5000/puuid", { method: 'POST', body: formData })
        .then(res => {
          if (res["status"] === 200) { // Only continue if the status is ok
            return res.json();
          }

        })  // Wait for the promise to resolve
        .then(data => {           // Process the data with from the JSON object
          setPuuid(data.puuid)


        })
        .catch((error) => console.log(error))
    }
  }





  return (
    <div className="App" style={{ display: "flex", flexDirection: "column", verticalAlign: "center", alignItems: "center", gap:"20px" }}>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", width: "80vw", padding: "20px 0px 20px 0px" }}>
        <img src={logo} style={{ width: "30%" }} alt='tft_logo' />

        <span>
          <h3>Enter Your Account ID To Start!</h3>
          <input type="text" id="name_entry"></input>
          <button onClick={get_puuid}>Go!</button>
          <h4>(Using data from past {count} matches)</h4>
        </span>

      </div>


      <h1>Rifting Wrapped</h1>


      {matchData.length > 0 && ChampSec}

      <br/>

      {matchData.length > 0 && DmgSec}

      <br/>

      {matchData.length > 0 && FFSec}
      <br/>


      {/* Team baron kills */}
      {/* Team dragon kills */}
      {/* Team elder drag kills */}

      {/* Ping pie chart */}

      <h2>Lets take a look at some of your highlights:</h2>

      <br/>

      
      {/* Show KDA Tables and Histograms */}
      {matchData.length > 0 && KDA_Section}


      

      <h2>Some fact about their KDA like spotify wrapped (This player has an average kda of ...)</h2>
      <h2>Tends to die more at start, less at late game (compared to their teammates)</h2>

      <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
        <div>
          <h3>Best CS</h3>
          {highestCS.slice(0, 5)}
        </div>


        <div>
          <h3>Worst CS</h3>
          {highestCS.slice(-5).reverse()}

        </div>
      </div>


      <h2>On average, this player tends to miss x cannons</h2>
      <h2>On average, this player has a x clear time</h2>


      <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
        <div>
          <h3>Longest Game</h3>

        </div>


        <div>
          <h3>Shortest Game</h3>


        </div>
      </div>


      <h2>On average, this player has a better chance of winning matches that last x</h2>


      <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
        <div>
          <h3>Longest Time Till 1st Death</h3>

        </div>


        <div>
          <h3>Shortest Time Till 1st Death</h3>


        </div>
      </div>


      <h3>Horizontal bar representing number of dragons killed, where it is separated by ddragon type killed from left to right
        ex: ccrbrrccbr: 1o dragons killed,  where each letter is a diff color corr to a dragon type
      </h3>




      <h3>Item Times</h3>

      <h3>histogram of what weekday person plays the most, what time person plays the most</h3>


      <h3>Stacked bar chart breakdown of time spent dead, winning, losing, cc'd, and other categories</h3>

    </div>
  );
}

export default App;