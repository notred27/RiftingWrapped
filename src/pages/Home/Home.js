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

    const [numUsers, setNumUsers] = useState(140);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/users/count`, `user-count`)
            .then((res) => setNumUsers(res.count))
    }, [])



    const fetchPlayer = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSelectedPlayer("");

        const apiUrl = process.env.REACT_APP_API_ENDPOINT;

        try {
            const region = document.getElementById("regionSelect").value;
            const names = document.getElementById("nameInput").value.split("#");

            if (names.length !== 2) {
                setSelectedPlayer("Invalid Search Name");
                setIsLoading(false);
                return;
            }

            const [displayName, tag] = names;
            setSelectedPlayer(displayName);

            let response = await fetch(
                `${apiUrl}/users/by-riot-id/${displayName}/${tag}/${region}`
            );

            if (response.status === 404) {
                const addResponse = await fetch(`${apiUrl}/users`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });

                if (!addResponse.ok) {
                    setSelectedPlayer("Failed to find user. Please check that your name and region are correct.");
                    setIsLoading(false);
                    return;
                }

                // try to find user after init
                response = await fetch(
                    `${apiUrl}/users/by-riot-id/${displayName}/${tag}/${region}`
                );
            }


            if (!response.ok) {
                setSelectedPlayer("User could not be fetched after creation.");
                setIsLoading(false);
                return;
            }

            const result = await response.json();
            const { puuid, status } = result;

            navigate(
                status === "done"
                    ? `/player/${puuid}`
                    : `/addPlayer/${puuid}`
            );
        } catch (err) {
            console.error(err);
            setSelectedPlayer(
                "Unexpected error. Please try again later."
            );
        } finally {
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
                <div className="heroText" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0px 30px", flexWrap: "wrap" }}>
                    <div style={{ width: "600px", textAlign: "left" }}>

                        <h1>Your Year on the Rift, <span style={{ fontWeight: "bolder", fontStyle: "italic" }}>Unwrapped.</span></h1>
                        <p>
                            Discover your top champions, stats, and trends of <strong>2025</strong> with a personalized recap of your <strong>League of Legends</strong> journey.
                        </p>
                    </div>


                    <div>

                        <form onSubmit={fetchPlayer} className="searchForm">
                            <span style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%", backgroundColor:"#1c2a38", padding:"4px", borderBottom:"4px solid #0070bb"}}>

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


                        {selectedPlayer && !isLoading && <p className="search-error" style={{maxWidth:"400px", fontSize:"small"}}>{selectedPlayer}</p>}
                        {isLoading &&

                            <p className="loading-text">
                                Loading {selectedPlayer}'s stats<span className="dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            </p>

                        }
                    </div>

                </div>

                <PlayerMarquee />



                <h3 style={{ margin: "0px", maxWidth: "1000px", fontSize: "16px", fontWeight: "initial" }}>
                    Don't see your username? Join over <span className='emphasize' style={{ fontWeight: "bold", textDecoration: "underline" }}><i>{numUsers} players</i></span> in tracking your yearly <strong>LOL</strong> metrics!
                </h3>

                {/* <PlayerListProvider> */}

                {/* </PlayerListProvider> */}
            </div>
        </>
    );
}

export default Home;
