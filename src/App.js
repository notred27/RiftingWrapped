import { useEffect, useState } from 'react';
import logo from './images/penguin.png';

import Hist from './Hist.js'

import top from './images/top.svg'
import mid from './images/mid.svg'
import bot from './images/bot.svg'
import sup from './images/sup.svg'
import jg from './images/jg.svg'


function App() {
  const [puuid, setPuuid] = useState("")
  const [matches, setMatches] = useState([]);
  const [highestDeath, setHighestDeath] = useState([]);

  const [highestCS, setHighestCS] = useState([]);


  const [matchData, setMatchData] = useState([]);

  const [kdaHist, setKdaHist] = useState([]);


  const count = 20


  // Get matches when a valid user is entered
  useEffect(() => {
    if(puuid !== "") {
      // Fetch from the flask server
      fetch(`http://localhost:5000/user/${puuid}/${count}`) // Get user's x most recent draft games
      .then(res => res.json())  // Wait for the promise to resolve

      .then(data => {           // Process the data with from the JSON object

          const matchList = []  // Temp list of matches for batched request
          if(data.length !== 0) {      

            const fetchPromises = data.map(matchId => 
              fetch(`http://localhost:5000/match/${matchId}`)
                  .then(res => res.json())  // Wait for the promise to resolve
                  .then(matches => {
                      matchList.push(matches);  // Add the fetched data to matchList
                  })
            );

            // Wait till all promises are resolved, then update useState with this data
            Promise.all(fetchPromises)
            .then(() => { setMatchData(matchList);}) // Update the match list
            .catch(error => { console.error('Error with fetch:', error); });
            
          }

      })
      
      .catch((error) => console.error(error))
    }


  }, [puuid])

  
// Get highest Kills
  useEffect(() => {
    const m = matchData.sort((a,b) => {
      const ta = a.metadata.participants.indexOf(puuid)
      const tb = b.metadata.participants.indexOf(puuid)

      return b.info.participants[tb].kills - a.info.participants[ta].kills
    })

    const kills = []
    for(let i = 0; i < Math.min(5, m.length); i++) {
      kills.push(process_match(m[i]))
    }
    setMatches(kills)


  }, [matchData])


// Highest Deaths
  useEffect(() => {
    const m = matchData.sort((a,b) => {
      const ta = a.metadata.participants.indexOf(puuid)
      const tb = b.metadata.participants.indexOf(puuid)

      return b.info.participants[tb].deaths - a.info.participants[ta].deaths
    })
 
    const deaths = []
    for(let i = 0; i < Math.min(5, m.length); i++) {
      deaths.push(process_match(m[i]))
    }

    setHighestDeath(deaths)
  }, [matchData])



// K/D Histograms
useEffect(() => {

  const kills = []
  const deaths = []
  for(let i = 0; i < matchData.length; i++) {
    const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
    kills.push(matchData[i].info.participants[targetPlayer].kills)
    deaths.push(matchData[i].info.participants[targetPlayer].deaths)

  }
 
  if(kills.length !== 0) {
    setKdaHist([<Hist data = {kills} numBins={8}></Hist>, <Hist data = {deaths} numBins={8}></Hist>,<h4>Kills</h4>,<h4>Deaths</h4>]);
  }
}, [matchData])


// Highest CS
useEffect(() => {
  const m = matchData.sort((a,b) => {
    const ta = a.info.participants[a.metadata.participants.indexOf(puuid)]
    const tb = b.info.participants[b.metadata.participants.indexOf(puuid)]

    // match.info.totalMinionsKilled	+ match.info.totalAllyJungleMinionsKilled	+ match.info.totalEnemyJungleMinionsKilled
    return (tb.totalMinionsKilled	+ tb.totalAllyJungleMinionsKilled	+ tb.totalEnemyJungleMinionsKilled) - (ta.totalMinionsKilled	+ ta.totalAllyJungleMinionsKilled	+ ta.totalEnemyJungleMinionsKilled)
  })

  const cs = []
  for(let i = 0; i < m.length; i++) {
    cs.push(process_cs_match(m[i]))
  }

  setHighestCS(cs)
}, [matchData])


function process_cs_match(match) {
  const targetPlayer = match.metadata.participants.indexOf(puuid)
  const stats = match.info.participants[targetPlayer]

  // console.log(match)
  let img
  switch(stats.individualPosition) {
    case "TOP":
      img = <img src = {top}></img>
      break;

    case "BOTTOM":
      img = <img src = {bot}></img>
      break;

    case "MIDDLE":
      img = <img src = {mid}></img>
      break;

    case "UTILITY":
      img = <img src = {sup}></img>
      break;

    case "JUNGLE":
      img = <img src = {jg}></img>
      break;

    default:
      img = <p>{stats.teamPosition}</p>
  }

return (
  <div className='tableEntry' style={{display:"grid", gridTemplateColumns:"repeat(8, 1fr)", width:"45vw"}}>

    {/* <p>{match.info.gameMode}</p> */}

    <p>{new Date(match.info.gameCreation).toLocaleString().split(',')[0]}</p>

    <span>{img}</span> 
    {/* Maybe change this to .individualPosition? */}

    <p>{stats.championName}</p>

    <p>{stats.kills + "/" + stats.deaths + "/" + stats.assists}</p>


    {stats.win ? <p style={{color:"#44FF44"}}>Win</p>:<p style={{color:"#ff4444"}}>Lose</p>}

    <p>{Math.floor(match.info.gameDuration / 60) + "m" + match.info.gameDuration % 60 + "s"}</p>

    <p>{stats.totalMinionsKilled	+ stats.totalAllyJungleMinionsKilled	+ stats.totalEnemyJungleMinionsKilled}</p>


    <p>{Math.round((stats.totalMinionsKilled	+ stats.totalAllyJungleMinionsKilled	+ stats.totalEnemyJungleMinionsKilled) / (match.info.gameDuration / 60) * 100)/100}</p>


  </div>);}


  function process_match(match) {
    const targetPlayer = match.metadata.participants.indexOf(puuid)
    const stats = match.info.participants[targetPlayer]

    // console.log(match)
    let img
    switch(stats.individualPosition) {
      case "TOP":
        img = <img src = {top}></img>
        break;

      case "BOTTOM":
        img = <img src = {bot}></img>
        break;

      case "MIDDLE":
        img = <img src = {mid}></img>
        break;

      case "UTILITY":
        img = <img src = {sup}></img>
        break;

      case "JUNGLE":
        img = <img src = {jg}></img>
        break;

      default:
        img = <p>{stats.teamPosition}</p>
    }



    return (
      <div className='tableEntry' style={{display:"grid", gridTemplateColumns:"repeat(8, 1fr)", width:"45vw"}}>

        {/* <p>{match.info.gameMode}</p> */}

        <p>{new Date(match.info.gameCreation).toLocaleString().split(',')[0]}</p>

        <span>{img}</span> 
        {/* Maybe change this to .individualPosition? */}

        <p>{stats.championName}</p>

        <p>{stats.kills + "/" + stats.deaths + "/" + stats.assists}</p>


        {stats.win ? <p style={{color:"#44FF44"}}>Win</p>:<p style={{color:"#ff4444"}}>Lose</p>}

        <p>{Math.floor(match.info.gameDuration / 60) + "m" + match.info.gameDuration % 60 + "s"}</p>
      </div>);
  }

// .totalMinionsKilled gives CS
// .totalTimeSpentDead

  function get_puuid(){
    // Get user data from the input
    const name = document.getElementById("name_entry").value;
  
    // Only send request if both the username and tag are included
    if(name.indexOf("#") === -1) {
      setPuuid("Error: Please include your tagline (username#xxxx)")

    } else {
      let n = name.split("#")

      // Set up the payload for the request
      const formData = new FormData();
      formData.append('name', n[0]);
      formData.append('id', n[1]);

      // Fetch from the flask server
      fetch("http://localhost:5000/puuid", {method:'POST', body:formData})
      .then(res => {
        if(res["status"] === 200){ // Only continue if the status is ok
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
    <div className="App" style ={{display:"flex", flexDirection:"column", verticalAlign:"center", alignItems:"center"}}>

      <div style={{display:"flex", flexDirection:"row", justifyContent:"center", alignItems:"center", width:"80vw", padding:"20px 0px 20px 0px"}}>
        <img src={logo} style={{width:"30%"}}></img>

        <span>
          <h3>Enter Account ID To Start!</h3>
          <input type = "text" id = "name_entry"></input>
          <button onClick={get_puuid}>Go!</button>
          <h4>Using data from past {count} matches</h4>

        </span>
      
      </div>
      
      {/* <h3>{puuid}</h3> */}

      


<div style={{display:"flex", justifyContent:"space-evenly", width:"100vw"}}>
  <div>
    <h3>Most Kills</h3>
    {matches}
  </div>


  <div>
    <h3>Most Deaths</h3>
    {highestDeath}
  </div>
</div>

{kdaHist.length !== 0 &&
  
  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", justifyItems:"center", columnGap:"100px"}}>
    {kdaHist}

  </div>
}
      
<h2>Some fact about their KDA like spotify wrapped (This player has an average kda of ...)</h2>
<h2>Tends to die more at start, less at late game (compared to their teammates)</h2>

<div style={{display:"flex", justifyContent:"space-evenly", width:"100vw"}}>
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


<div style={{display:"flex", justifyContent:"space-evenly", width:"100vw"}}>
  <div>
  <h3>Longest Game</h3>

  </div>


  <div>
  <h3>Shortest Game</h3>

 
  </div>
</div>
      

<h2>On average, this player has a better chance of winning matches that last x</h2>


<div style={{display:"flex", justifyContent:"space-evenly", width:"100vw"}}>
  <div>
  <h3>Longest Time Till 1st Death</h3>

  </div>


  <div>
  <h3>Shortest Time Till 1st Death</h3>

 
  </div>
</div>  

      

      


      <h3>Item Times</h3>

      <h3>histogram of what weekday person plays the most, what time person plays the most</h3>




    </div>
  );
}

export default App;