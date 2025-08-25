import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

import './styles/Home.css';

import SharePreviewCard from './SharePreviewCard';

import Scroller from './Scroller';

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


    const cards = [
        {
            username: "MrWarwickWide",
            hoursPlayed: "110",
            champName: "Warwick",
            shareUrl: "/player/diCdQ445kzKsYeE19oqdFWmYfuDrnGU3oKeTkAyWzweVEIPUZlPo9adlsdFYU6Sr8NzQJjiJXnPb6A"
        },
        
        {
            username: "bigleagueplayer",
            hoursPlayed: "463",
            champName: "Gragas",
            shareUrl: "/player/TDQjFdHq3qPgUtc1VNmpCOBwQpwAPEeRDuqws_7oYv3SVQqzAgNfXPtzjpSpmdptJMTyx6nwLzYutA"
        },
        {
            username: "jar",
            hoursPlayed: "190",
            champName: "Nunu",
            shareUrl: "/player/DtXnq3chwI7rBuqeyQJcCwmIyw12dVJwf-FqbaZiuU5X0JGjdjT1Y1Zt5sX3TgwPxJtCwBq__NeHLw"
        },
        {
            username: "nexensis12",
            hoursPlayed: "20",
            champName: "Velkoz",
            shareUrl: "/player/r1xGUZF0L4HCQee47pytClt3OsPHqyhXgZfFkq-WRU15oQx88iHeh392Re6uTE9GBEaEJGh3vqf7zQ"
        },
        {
            username: "SemThigh",
            hoursPlayed: "470",
            champName: "Jhin",
            shareUrl: "/player/i4E4IYdhi9-JXuF6hchhPdPC6clE8jOPwBrYBLG7xEKDRk3Y-Fqtw-tcSX0FGn_wo4RY3PZG3MUdlw"
        },
    ]

    return (
        <>
            <Helmet>
                <link rel="canonical" href={`https://master.d1t2tctgq2njxi.amplifyapp.com`} />
            </Helmet>

            <header className="siteHeader">
                <div className="logo">
                    Rifting Wrapped 2025
                </div>
                <nav className="navMenu">
                    <Link to="/">Home</Link>
                    <Link to="/faq">FAQ</Link>

                </nav>
            </header>


            <div className="heroContainer">
                <div className="heroOverlay" />
                    <div className="heroText">
                        <h1>Your Year on the Rift, <span style={{fontWeight:"bolder", fontStyle:"italic"}}>Unwrapped.</span></h1>
                        <p>
                            Discover your top champions, match stats, and trends for 2025 with a personalized, shareable recap of your League of Legends journey.
                        </p>

                        <form onSubmit={fetchPlayer} className="searchForm">
                            <input
                                type="text"
                                name="username"
                                value={userSearchName}
                                onChange={(e) => setUserSearchName(e.target.value)}
                                placeholder="GAME NAME#TAG"
                                autoComplete="on"
                                id="nameInput"
                            />
                            <button type="submit" id="submitBtn">
                                Fetch My Stats!
                            </button>
                        </form>

                        {selectedPlayer && <p className="search-error">{selectedPlayer}</p>}
                    </div>

    
 

                <h2 style={{marginTop:"80px"}}>Join over <span className='emphasize'>20</span> other users in tracking your yearly LOL metrics!</h2>
                <Scroller>
                    {cards.map(card => (
                            <SharePreviewCard key={card.id} {...card} />
                        ))}
                </Scroller>

            </div>


            
            <p id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
        </>
    );
}

export default Home;
