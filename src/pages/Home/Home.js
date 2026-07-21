import { Suspense, useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { PlayerListProvider } from '../../resources/PlayerListContext';
import { fetchCached } from '../../resources/fetchCached';

import UserSearchBar from '../../components/common/UserSearchBar';
import PlayerMarquee from '../../components/common/PlayerMarquee';
import GenericSearch from '../../components/common/GenericSearch';
import ErrorBoundary from '../../components/error/ErrorBoundary';


import bg_image from '../../images/Jax_0.webp';
import './Home.css';


export default function Home() {
    const [numUsers, setNumUsers] = useState(290);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const WRAP_YEAR = 2026;


    useEffect(() => {
        fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/users/count`, `user-count`)
            .then((res) => setNumUsers(res.count))
            .catch((err) => console.warn('Failed to fetch user count:', err));
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
                setSelectedPlayer(`Registering ${displayName}... this can take a minute.`);

                const addResponse = await fetch(`${apiUrl}/users`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });

                const addBody = await addResponse.json().catch(() => null);

                if (!addResponse.ok && addResponse.status !== 409) {
                    setSelectedPlayer(
                        addBody?.message ||
                        "Failed to find user. Please check that your name and region are correct."
                    );
                    setIsLoading(false);
                    return;
                }

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

            if (!puuid) {
                setSelectedPlayer(
                    "Registration didn't complete successfully. Please try again."
                );
                setIsLoading(false);
                return;
            }

            navigate(
                status === "done"
                    ? `/player/${puuid}?year=${WRAP_YEAR}`
                    : `/addPlayer/${puuid}?year=${WRAP_YEAR}`
            );
        } catch (err) {
            console.error(err);
            setSelectedPlayer("Unexpected error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            <Helmet>
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
                <title>Rifting Wrapped 2026 | Your League of Legends Year in Review</title>
                <meta name="description" content={`Get a detailed year-end summary of your League of Legends gameplay! Discover your top champions, stats, and trends with a personalized LoL experience.`} />

                <link
                    rel="preload"
                    as="image"
                    href={bg_image}
                    type="image/webp"
                    fetchpriority="high"
                />
            </Helmet>

            <div className="heroContainer">
                <img className="heroOverlay" src={bg_image} alt="Hero Overlay" />
                <div className="heroText" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0px 30px", flexWrap: "wrap" }}>
                    <div style={{ width: "600px" }}>

                        <h1>Your Year on the Rift, <span style={{ fontWeight: "bolder", fontStyle: "italic" }}>Unwrapped.</span></h1>
                        <p>
                            Discover your top champions, stats, and trends of <strong>2026</strong> with a personalized recap of your <strong>League of Legends</strong> journey.
                        </p>
                    </div>


                    <div>

                        <form onSubmit={fetchPlayer} className="searchForm">
                            <span style={{
                                display: "flex",
                                gap: "0px",
                                alignItems: "center",
                                width: "100%",
                                backgroundColor: "var(--second-bg-color)",
                                padding: "4px",
                                borderBottom: "4px solid var(--accent-color)",
                                borderRadius: "4px"
                            }}>
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


                        {selectedPlayer && !isLoading && <p className="search-error" style={{ maxWidth: "400px", fontSize: "var(--fs-xs)" }}>{selectedPlayer}</p>}
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

                <h2 style={{
                    margin: "20px 0 30px",
                    maxWidth: "500px",
                    fontSize: "var(--fs-sm)",
                    fontWeight: "normal",
                    color: "var(--text-muted-color)",
                    lineHeight: "1.6",
                    zIndex: "1"
                }}>
                    Don't see your username? Join over <span style={{ fontWeight: "700", color: "var(--accent-color)" }}><i>{numUsers} players</i></span> in tracking your yearly <strong>LOL</strong> metrics!
                </h2>
            </div>
        </>
    );
}

