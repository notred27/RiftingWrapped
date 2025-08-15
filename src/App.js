import { useState } from 'react';

import '@fortawesome/fontawesome-free/css/all.min.css';

import logo from './images/penguin.webp';

import ChampSection from './Sections/ChampSection.js';
import DamageSection from './Sections/DamageSection.js';
import DateSection from './Sections/DateSection.js';
import FFSection from './Sections/FFSection.js';
import KDAsection from './Sections/KDAsection.js';
import LaneSection from './Sections/LaneSection.js';
import TotalTimeBreakdown from './Sections/TotalTimeBreakdown.js';


function App() {
    const [puuid, setPuuid] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [userSearchName, setUserSearchName] = useState("");
    const year = "2025"


    const fetchPlayer = async (e) => {

        const apiUrl = process.env.REACT_APP_API_ENDPOINT;
        e.preventDefault();

        try {
            const names = userSearchName.split("#")
            const formData = new FormData();
            formData.append('displayName', names[0]);
            formData.append('tag', names[1]);

            const response = await fetch(`${apiUrl}/get_user`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API Error when fetching player data');

            const result = await response.json();
            setPuuid(result[0]["puuid"]);
            setSelectedPlayer(result[0]["displayName"]);
        } catch (error) {

            console.error(error);
            setSelectedPlayer("User not found");
            setPuuid("");
        }
    };


    return (
    <>
        <div className="centeredColumn" style={{ gap: "20px" }}>

            <div id='UserSelectRow' className='centeredRow' >
                <img src={logo} id='logo-img' alt='tft_logo' />

                <span>

                    <h1>Rifting Wrapped {year}</h1>

                    <h1 id='PlayerNameHeader'>{selectedPlayer}</h1>

                    <form onSubmit={fetchPlayer}>
                        <select id="itemSelect" >
                            <option value="EUW">EUW</option>
                            <option value="NA" selected="selected">NA</option>
                        </select>

                        <input
                            type="text"
                            value={userSearchName}
                            onChange={(e) => setUserSearchName(e.target.value)}
                            placeholder="GAME NAME#TAG"
                            autocomplete="on"
                        />

                        <br />

                        <button type='submit'>Fetch My Stats!</button>
                    </form>

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

        <h6 id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>
    </>);
}

export default App;