import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from './images/penguin.webp';

function Home() {
    const [userSearchName, setUserSearchName] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState('');

    const navigate = useNavigate();

    const fetchPlayer = async (e) => {
        const apiUrl = process.env.REACT_APP_API_ENDPOINT;
        e.preventDefault();

        try {
            const names = userSearchName.split("#");
            const formData = new FormData();
            formData.append('displayName', names[0]);
            formData.append('tag', names[1]);

            const response = await fetch(`${apiUrl}/get_user`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API Error when fetching player data');

            const result = await response.json();
            const puuid = result[0]["puuid"];
            navigate(`/player/${puuid}`);
        } catch (error) {
            console.error(error);

            if (userSearchName.indexOf('#') === -1) {
                setSelectedPlayer("Invalid Search Name");
            } else {
                setSelectedPlayer("User not found");
            }
        }
    };

    return (
        <>
            <div className="centeredColumn" style={{ gap: "20px" }}>
                <div id='UserSelectRow' className='centeredRow'>
                    <img src={logo} id='logo-img' alt='tft_logo' />
                    <span>
                        <h1>Rifting Wrapped 2025</h1>
                        <form onSubmit={fetchPlayer}>
                            <input
                                type="text"
                                name="username"
                                value={userSearchName}
                                onChange={(e) => setUserSearchName(e.target.value)}
                                placeholder="GAME NAME#TAG"
                                autoComplete="on"
                                style={{ backgroundColor: "#375b74ff", color: "white", border: "none", padding: "10px", width: "25ch", fontSize: "larger" }}
                            />
                            <br />
                            <button
                                type='submit'
                                style={{ backgroundColor: "#0a85d6ff", color: "white", fontSize: "large", padding: "10px 20px", marginTop: "20px", border: "none", fontWeight: "bold" }}
                            >
                                Fetch My Stats!
                            </button>
                        </form>
                    </span>
                </div>


                <h1 id='PlayerNameHeader'>{selectedPlayer}</h1>
            </div>
            <h6 id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>
        </>
    );
}

export default Home;
