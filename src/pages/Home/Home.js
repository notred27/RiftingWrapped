import { useState, useEffect, Suspense } from 'react';

import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { PlayerListProvider } from '../../resources/PlayerListContext';
import { fetchCached } from '../../resources/fetchCached';

import UserSearchBar from '../../components/common/UserSearchBar';

import bg_image from '../../images/Jax_0.webp'
import './Home.css';
import PlayerMarquee from '../../components/sections/PlayerMarquee';

import ErrorBoundary from '../../components/Error/ErrorBoundary';
import GenericSearch from '../../components/common/GenericSearch';

function Home() {
    const navigate = useNavigate();

    const [numUsers, setNumUsers] = useState(30);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/users/count`, `user-count`)
            .then((res) => setNumUsers(res.count))
    }, [])

    const fetchPlayer = async (e) => {
        const apiUrl = process.env.REACT_APP_API_ENDPOINT;
        e.preventDefault();
        setIsLoading(true);
        setSelectedPlayer("");

        try {
            const region = document.getElementById("regionSelect").value;
            const names = document.getElementById("nameInput").value.split("#");
            if (names.length !== 2) {
                setSelectedPlayer("Invalid Search Name");
                setIsLoading(false);
                return;
            }

            const displayName = names[0];
            const tag = names[1];
            setSelectedPlayer(displayName);

            let response = await fetch(`${apiUrl}/users/by-riot-id/${displayName}/${tag}/${region}`);

            if (response.status === 404) {
                console.log("User not found, trying to add...");

                const addResponse = await fetch(`${apiUrl}/users`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });

                if (!addResponse.ok) {
                    throw new Error("Failed to add new user");
                }

                // Fetch again to get puuid
                response = await fetch(`${apiUrl}/users/by-riot-id/${displayName}/${tag}`);
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
            setSelectedPlayer("Error fetching or adding user. Please check the entered information and try again.");
            setIsLoading(false);
        }
    };



    return (
        <>
            <Helmet>
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
                <title>Rifting Wrapped 2025 | Your League of Legends Year in Review</title>
                <meta name="description" content={`Get a detailed year-end summary of your League of Legends gameplay! Discover your top champions, stats, and trends with a personalized LoL experience.`} />

                <link
                    rel="preload"
                    as="image"
                    href={bg_image}
                    type="image/webp"
                    fetchpriority="high"
                />

            </Helmet>

            <div className="heroContainer" >
                <img className="heroOverlay" src={bg_image} alt="Hero Overlay" />
                <div className="heroText">
                    <h1>Your Year on the Rift, <span style={{ fontWeight: "bolder", fontStyle: "italic" }}>Unwrapped.</span></h1>
                    <p>
                        Discover your top champions, match stats, and trends for 2025 with a personalized recap of your League of Legends journey.
                    </p>


                    <form onSubmit={fetchPlayer} className="searchForm">
                        <span style={{ display: "flex", gap: "10px", alignItems: "center", width:"100%"}}>

                            <PlayerListProvider>
                                <ErrorBoundary fallback={(err) => <GenericSearch error={err} />}>
                                    <Suspense fallback={<GenericSearch />}>
                                        <UserSearchBar />
                                    </Suspense>
                                </ErrorBoundary>
                            </PlayerListProvider>

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

                <h2 style={{ marginTop: "40px", maxWidth: "800px", fontSize: "large" }}>Don't see your name? Enter your account and region to join over <span className='emphasize'>{numUsers}</span> other users in tracking your yearly LOL metrics!</h2>

                {/* <PlayerListProvider> */}
                <PlayerMarquee />

                {/* </PlayerListProvider> */}
            </div>
        </>
    );
}

export default Home;
