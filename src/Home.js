import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from './images/penguin.webp';
import { Helmet } from 'react-helmet-async';

import './styles/Home.css'

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
            <Helmet>
                <link rel="canonical" href={`https://master.d1t2tctgq2njxi.amplifyapp.com`} />
            </Helmet>

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
                                id="nameInput"
                            />
                            <br />
                            <button
                                type='submit'
                                id='submitBtn'
                            >
                                Fetch My Stats!
                            </button>
                        </form>
                    </span>
                </div>


                <h1 id='PlayerNameHeader'>{selectedPlayer}</h1>
            </div>
            <p id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
        </>
    );
}

export default Home;
