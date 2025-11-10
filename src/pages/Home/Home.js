import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

import './Home.css';

import SharePreviewCard from '../../components/common/SharePreviewCard';

import AutoScroller from '../../components/common/AutoScroller';

function Home() {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const regionRef = useRef("NA1");
    const usernameRef = useRef("");

    const navigate = useNavigate();

    const fetchPlayer = async (e) => {
        const apiUrl = process.env.REACT_APP_API_ENDPOINT;
        e.preventDefault();
        setIsLoading(true);
        setSelectedPlayer("");

        const region = regionRef.current.value;


        try {
            const names = usernameRef.current.value.split("#");
            if (names.length !== 2) {
                setSelectedPlayer("Invalid Search Name");
                setIsLoading(false);
                return;
            }

            const displayName = names[0];
            const tag = names[1];
            setSelectedPlayer(displayName);

            let response = await fetch(`${apiUrl}/getUser?displayName=${displayName}&tag=${tag}`);
            console.log("Initial fetch response:", response);

            if (response.status === 404) {
                console.log("User not found, trying to add...");

                const addResponse = await fetch(`${apiUrl}/add_user`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });

                if (!addResponse.ok) {
                    throw new Error("Failed to add new user");
                }


                response = await fetch(`${apiUrl}/getUser`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });
            }

            if (!response.ok) {
                throw new Error("API Error when fetching player data");
            }

            const result = await response.json();
 
            const puuid = result["puuid"];
            const status = result["status"];

            if (status === "done") {
                navigate(`/player/${puuid}`);
            } else {
                navigate(`/addPlayer/${puuid}`);
            }

            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setSelectedPlayer("Error fetching or adding user");
            setIsLoading(false);
        }
    };


    const demoCards = [
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
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
            </Helmet>

            <div className="heroContainer">

                <img class="heroOverlay" src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jax_0.jpg" alt="Hero Overlay" fetchPriority='high' />
                <div className="heroText">
                    <h1>Your Year on the Rift, <span style={{ fontWeight: "bolder", fontStyle: "italic" }}>Unwrapped.</span></h1>
                    <p>
                        Discover your top champions, match stats, and trends for 2025 with a personalized recap of your League of Legends journey.
                    </p>

                    <form onSubmit={fetchPlayer} className="searchForm">

                        <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <select defaultValue="NA1" aria-label="region select" id="regionSelect" ref={regionRef}>
                                <option value="BR1">BR1</option>
                                <option value="EUN1">EUN1</option>
                                <option value="EUW1">EUW1</option>
                                <option value="JP1">JP1</option>
                                <option value="KR">KR</option>
                                <option value="LA1">LA1</option>
                                <option value="LA2">LA2</option>
                                <option value="ME1">ME1</option>
                                <option value="NA1">NA1</option>
                                <option value="OC1">OC1</option>
                                <option value="RU">RU</option>
                                <option value="SG2">SG2</option>
                                <option value="TR1">TR1</option>
                                <option value="TW2">TW2</option>
                                <option value="VN2">VN2</option>
                            </select>
                            <input
                                type="text"
                                name="username"
                                ref={usernameRef}
                                placeholder="GAME NAME#TAG"
                                autoComplete="on"
                                id="nameInput"
                            />
                        </span>

                        <button type="submit" id="submitBtn">
                            Fetch My Stats!
                        </button>
                    </form>

                    {selectedPlayer && !isLoading && <p className="search-error">{selectedPlayer}</p>}
                    {isLoading &&

                        <h2 className="loading-text">
                            Loading {selectedPlayer}'s stats<span className="dots">
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </span>
                        </h2>

                    }

                </div>

                <h2 style={{ marginTop: "80px" }}>Join over <span className='emphasize'>20</span> other users in tracking your yearly LOL metrics!</h2>
                <AutoScroller>
                    {demoCards.map(card => (
                        <SharePreviewCard key={card.username} {...card} />
                    ))}
                </AutoScroller>

            </div>
        </>
    );
}

export default Home;
