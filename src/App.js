import { useEffect, useState } from 'react';


// Use lazy or await for better performance
import Michael from './player_data/MrWarwickWide_match_data.json';
import John from './player_data/jar_match_data.json';
import Sam from './player_data/SemThigh_match_data.json'
import Erik from './player_data/bigleagueplayer_match_data.json'
import Ian from './player_data/ThiccShinobi2_match_data.json'
import Josh from './player_data/Starmany_match_data.json'



import logo from './images/penguin.png';




import KDAsection from './KDAsection.js';
import ChampSection from './ChampSection.js';
import DamageSection from './DamageSection.js';
import FFSection from './FFSection.js';
import LaneSection from './LaneSection.js';
import TotalTimeBreakdown from './TotalTimeBreakdown.js';
import DateSection from './DateSection.js';

function App() {
  const [puuid, setPuuid] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [matchData, setMatchData] = useState([]);


  const [DateSec, setDateSec] = useState([]);
  const [ChampSec, setChampSec] = useState([]);
  const [DmgSec, setDmgSec] = useState([]);
  const [FFSec, setFFSec] = useState([]);
  const [KDASection, setKDASection] = useState([]);
  const [LaneSec, setLaneSec] = useState([]);
  const [TimeBreakdown, setTimeBreakdown] = useState([]);



  // Number of games to fetch
  // const count = 20


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


      switch (puuid) {
        case "DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw":
          setMatchData(John);
          setSelectedPlayer("Jar");
          break;

        case "diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A":
          setMatchData(Michael);
          setSelectedPlayer("MrWarwickWide");
          break;

        case "i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw":
          setMatchData(Sam);
          setSelectedPlayer("SemThigh");
          break;

        case "TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA":
          setMatchData(Erik);
          setSelectedPlayer("BigLeaguePlayer");
          break;

        case "XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw":
          setMatchData(Ian);
          setSelectedPlayer("ThiccShinobi2");
          break;

        case "Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ":
          setMatchData(Josh);
          setSelectedPlayer("Starmany");
          break;

        default:
          break;
      }
    }
  }, [puuid])



  // Update sections with appropriate data
  useEffect(() => {

    setDateSec(<DateSection puuid={puuid} matchData={matchData}></DateSection>)
    setChampSec(<ChampSection puuid={puuid} matchData={matchData}></ChampSection>)
    setDmgSec(<DamageSection puuid={puuid} matchData={matchData}></DamageSection>)
    setFFSec(<FFSection puuid={puuid} matchData={matchData}></FFSection>)
    setKDASection(<KDAsection puuid={puuid} matchData={matchData}></KDAsection>)
    setLaneSec(<LaneSection puuid={puuid} matchData={matchData}></LaneSection>)
    setTimeBreakdown(<TotalTimeBreakdown puuid={puuid} matchData={matchData}></TotalTimeBreakdown>)

  }, [matchData])




// Fetch puuid through flask server and Riot API
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


  // Set precalculated puuid
  function get_puuid_static(id) {
    setPuuid(id)
  }


  // Show/hide dropdown menu options
  function toggleDropdown() {
    document.getElementById("dropdown_menu1").classList.toggle("show");
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches('.dropdown_main')) {
      var dropdowns = document.getElementsByClassName("dropdown_menu");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }



  return (
    <div className="App" style={{ display: "flex", flexDirection: "column", verticalAlign: "center", alignItems: "center", gap: "20px" }}>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", width: "80vw", padding: "20px 0px 20px 0px" }}>
        <img src={logo} style={{ width: "30%" }} alt='tft_logo' />

        <span>
          {/* <h3>Enter Your Account ID To Start!</h3>
          <input type="text" id="name_entry"></input>
          <button onClick={get_puuid}>Go!</button>
          <h4>(Using data from past {count} matches)</h4> */}
          <h1>Rift-Recap 2024</h1>

          <h1 style={{ marginBottom: "10px", fontWeight: "900" }}>{selectedPlayer}</h1>


          <div id='playerSelect' className='dropdown_main' onClick={toggleDropdown}>Select A Player To Start</div>
          <div id='dropdown_menu1' className='dropdown_menu'>
            <button onClick={() => { get_puuid_static("TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA") }}>Bigleagueplayer</button><br />
            <button onClick={() => { get_puuid_static("DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw") }}>Jar</button><br />
            <button onClick={() => { get_puuid_static("diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A") }}>MrWarwickWide</button><br />
            <button onClick={() => { get_puuid_static("i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw") }}>SemThigh</button><br />
            <button onClick={() => { get_puuid_static("Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ") }}>Starmany</button><br />
            <button onClick={() => { get_puuid_static("XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw") }}>ThiccShinobi2</button><br />
          </div>
        </span>

      </div>


      {matchData.length > 0 && DateSec}


      {matchData.length > 0 && ChampSec}


      {matchData.length > 0 && DmgSec}


      {matchData.length > 0 && FFSec}




      Ping pie chart




      {/* Show KDA Tables and Histograms */}
      {matchData.length > 0 && KDASection}


      {matchData.length > 0 && LaneSec}


      {/* <h2>Some fact about their KDA like spotify wrapped (This player has an average kda of ...)</h2> */}
      {/* <h2>Tends to die more at start, less at late game (compared to their teammates)</h2> */}




      {/* <h2>Most bought items (rank 1st through 5th with small squares and podiums)</h2> */}

      {/* <h2>On average, this player tends to miss x cannons</h2> */}
      {/* <h2>On average, this player has a x clear time</h2> */}


      {/* <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
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
      </div> */}


      {/* <h3>Horizontal bar representing number of dragons killed, where it is separated by ddragon type killed from left to right
        ex: ccrbrrccbr: 1o dragons killed,  where each letter is a diff color corr to a dragon type
      </h3> */}




      {/* <h3>Item Times</h3> */}

      {/* <h3>histogram of what weekday person plays the most, what time person plays the most</h3> */}


      {/* <h3>Stacked bar chart breakdown of time spent dead, winning, losing, cc'd, and other categories</h3> */}

      {matchData.length > 0 && TimeBreakdown}


      <h6 style={{ width: "60vw", textAlign: "center" }}>All data used in Rift-Recap comes from the user's draft pick games played in 2024. Rift-Recap isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>
    </div>
  );
}

export default App;