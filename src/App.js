import { useEffect, useState } from 'react';


import logo from './images/penguin.png';


import KDAsection from './KDAsection.js';
import ChampSection from './ChampSection.js';
import DamageSection from './DamageSection.js';
import FFSection from './FFSection.js';
import LaneSection from './LaneSection.js';
import TotalTimeBreakdown from './TotalTimeBreakdown.js';
import DateSection from './DateSection.js';


import PlayerDataStorage from './PlayerDataStorage.js';
// import PlayerLookup from './PlayerLookup.js';




function App() {
  const [puuid, setPuuid] = useState("");
  const [matchData, setMatchData] = useState([]);


  // TODO: Combine these all into one component, add <Suspense> to it?
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [DateSec, setDateSec] = useState([]);
  const [ChampSec, setChampSec] = useState([]);
  const [DmgSec, setDmgSec] = useState([]);
  const [FFSec, setFFSec] = useState([]);
  const [KDASection, setKDASection] = useState([]);
  const [LaneSec, setLaneSec] = useState([]);
  const [TimeBreakdown, setTimeBreakdown] = useState([]);


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




  // Set precalculated puuid
  function get_puuid_static(id, json) {
    setPuuid(id)


    switch (id) {
      case "DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw":
        setSelectedPlayer("Jar");
        break;

      case "diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A":
        setSelectedPlayer("MrWarwickWide");
        break;

      case "i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw":
        setSelectedPlayer("SemThigh");
        break;

      case "TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA":
        setSelectedPlayer("BigLeaguePlayer");
        break;

      case "XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw":
        setSelectedPlayer("ThiccShinobi2");
        break;

      case "Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ":
        setSelectedPlayer("Starmany");
        break;

      case "KT-IOAcBE30hmg2NjLILeuaqZR-KKtewV5eOPeXpioqot_yx4Qwlh8BKq4KkwQhxLJu45uiX3PkvRg":
        setSelectedPlayer("LostPanda");
        break;

      default:
        break;
    }

    setMatchData(json);
  }


  //===== UI Logic ======//

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
    <div style={{ position: "relative", minHeight: "90vh", paddingTop: "10vh" }}>

      <div className="App centeredColumn" style={{ gap: "20px" }}>

        <div className='centeredRow' style={{ width: "80vw", padding: "20px 0px 20px 0px" }}>
          <img src={logo} style={{ width: "30%" }} alt='tft_logo' />

          <span>


            <h1>Rifting Wrapped 2024</h1>

            {/* Compare to last 20 games */}
            {/* <PlayerLookup setData={setMatchData} setId={setPuuid}></PlayerLookup> */}

            <h1 style={{ marginBottom: "10px", fontWeight: "900" }}>{selectedPlayer}</h1>


            <div id='playerSelect' className='dropdown_main' onClick={toggleDropdown}>Select A Player To Start</div>

            <div id='dropdown_menu1' className='dropdown_menu'>

              <PlayerDataStorage setData={get_puuid_static} playerName={"bigleagueplayer"} puuid={"TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"jar"} puuid={"DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"LostPanda"} puuid={"KT-IOAcBE30hmg2NjLILeuaqZR-KKtewV5eOPeXpioqot_yx4Qwlh8BKq4KkwQhxLJu45uiX3PkvRg"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"MrWarwickWide"} puuid={"diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"SemThigh"} puuid={"i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"Starmany"} puuid={"Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ"}></PlayerDataStorage>
              <PlayerDataStorage setData={get_puuid_static} playerName={"ThiccShinobi2"} puuid={"XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw"}></PlayerDataStorage>

            </div>
          </span>

        </div>



        {matchData.length > 0 &&
          [DateSec, ChampSec, DmgSec, FFSec, KDASection, LaneSec, TimeBreakdown]}







        {/* <h2>Some fact about their KDA like spotify wrapped (This player has an average kda of ...)</h2> */}
        {/* <h2>Tends to die more at start, less at late game (compared to their teammates)</h2> */}




        {/* <h2>Most bought items (rank 1st through 5th with small squares and podiums)</h2> */}

        {/* <h2>On average, this player tends to miss x cannons</h2> */}
        {/* <h2>On average, this player has a x clear time</h2> */}





        {/* <h3>Horizontal bar representing number of dragons killed, where it is separated by ddragon type killed from left to right
        ex: ccrbrrccbr: 1o dragons killed,  where each letter is a diff color corr to a dragon type
      </h3> */}


        {/* <h3>Item Times</h3> */}

        {/* <h3>histogram of what weekday person plays the most, what time person plays the most</h3> */}


        {/* <h3>Stacked bar chart breakdown of time spent dead, winning, losing, cc'd, and other categories</h3> */}



      </div>

      <h6 id='FooterNote' >All data used in Rift-Recap comes from the user's draft pick games played in 2024. Rift-Recap isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>

    </div>

  );
}

export default App;