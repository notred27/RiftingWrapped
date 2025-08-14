import { useState } from 'react';

import '@fortawesome/fontawesome-free/css/all.min.css';

import logo from './images/penguin.webp';

import DamageSection from './Sections/DamageSection.js';
import FFSection from './Sections/FFSection.js';
import KDAsection from './Sections/KDAsection.js';
import LaneSection from './Sections/LaneSection.js';
import TotalTimeBreakdown from './Sections/TotalTimeBreakdown.js';
import ChampSection from './Sections/ChampSection.js';
import DateSection from './Sections/DateSection.js';


function App() {

  const year = "2025"
  const [puuid, setPuuid] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");


  // Select user
  function userSelect(playerName, puuid) {
    return (<button onClick={() => setUserInfo(playerName, puuid)}>{playerName}</button>);
  }

  function setUserInfo(displayName, puuid) {
    setPuuid(puuid);
    setSelectedPlayer(displayName);
  }

  const userDict = [
    {
      "name": "Artma1",
      "puuid": "BBPD4EiT1_2PSAvgQDct-_pYMqKrAuWa0cTTP5d8xOqbEuWWkqJ6fg9bfm98NKY4YxnrInvZrUhPOA"
    },
    {
      "name": "bigleagueplayer",
      "puuid": "TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA"
    },
    {
      "name": "jar",
      "puuid": "DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw"
    },

    {
      "name": "LostPanda",
      "puuid": "KT-IOAcBE30hmg2NjLILeuaqZR-KKtewV5eOPeXpioqot_yx4Qwlh8BKq4KkwQhxLJu45uiX3PkvRg"
    },

    {
      "name": "MrWarwickWide",
      "puuid": "diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"
    },

    {
      "name": "SemThigh",
      "puuid": "i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw"
    },

    {
      "name": "Starmany",
      "puuid": "Wo7YQhhVUI-sHRN03UKEKFV3N5J7TpF3W1l_xos-gf45P8qKCKOaAgjzRL36Qb_XXq-3-d68Yz72mQ"
    },

    {
      "name": "ThiccShinobi2",
      "puuid": "XPCafNC_zNQCoppRjcKZWzk8JQ3zGjt6lDWqX3gQgDVoWhvjkbbT9DOrh9ZibvjJ_VVy0EzawQLTVw"
    },
  ]

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

    <div style={{ position: "relative", minHeight: "90vh", paddingTop: "10vh", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>

      <div className="App centeredColumn" style={{ gap: "20px" }}>

        <div className='centeredRow' style={{ width: "80vw", padding: "20px 0px 20px 0px" }}>
          <img src={logo} style={{ width: "30%" }} alt='tft_logo' />

          <span>

            <h1>Rifting Wrapped {year}</h1>

            <h1 style={{ marginBottom: "10px", fontWeight: "900" }}>{selectedPlayer}</h1>

            <div id='playerSelect' className='dropdown_main' onClick={toggleDropdown}>Select A Player To Start</div>

            <div id='dropdown_menu1' className='dropdown_menu'>

              {userDict.map(item => {
                return userSelect(item["name"], item["puuid"])
              })}
            </div>
          </span>

        </div>

        <DateSection puuid={puuid} year={year} />

        <FFSection puuid={puuid} year={year} />

        <ChampSection puuid={puuid} year={year} />

        <DamageSection puuid={puuid} year={year} />

        <KDAsection puuid={puuid} year={year} />

        <LaneSection puuid={puuid} year={year} />

        <TotalTimeBreakdown puuid={puuid} year={year} />

      </div>

      <h6 id='FooterNote' >All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>

    </div>

  );
}

export default App;