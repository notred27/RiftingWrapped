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
            <Helmet defer={false}>
                <link rel="canonical" href={`https://www.riftingwrapped.com/`} />
                <title>Rifting Wrapped 2026 | Your League of Legends Year in Review</title>
                <meta name="description" content={`Get a detailed year-end summary of your League of Legends gameplay! Discover your top champions, stats, and trends with a personalized LoL experience.`} />

                <meta property="og:title" content="Rifting Wrapped 2026 | Your League of Legends Year in Review" />
                <meta property="og:description" content="See your top champion, your best (and worst) games, and exactly how many hours you spent on the Rift this year." />
                <meta property="og:image" content="https://www.riftingwrapped.com/android-chrome-512x512.png" />
                <meta property="og:url" content="https://www.riftingwrapped.com/" />
                <meta name="twitter:card" content="summary_large_image" />

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
                <div className="heroText">
                    <div className="hero-copy">
                        <span className="hero-eyebrow">{WRAP_YEAR} SEASON RECAP</span>
                        <h1>Your Year on the Rift, <span style={{ fontWeight: "bolder", fontStyle: "italic" }}>Unwrapped.</span></h1>
                        <p style={{maxWidth:"760px", textWrap:"pretty"}}>
                            See your <strong>{WRAP_YEAR}</strong> <strong>League of Legends</strong> year for what it really was: your main, your best (and worst) games, and exactly how many hours you lost to the Rift.
                        </p>
                    </div>


                    <div className="hero-form-wrap">

                        <form onSubmit={fetchPlayer} className="searchForm">
                            <label className="hero-search-eyebrow" htmlFor="nameInput">Find Your Wrapped</label>

                            <div className="hero-search-row">
                                <span className="hero-search-box">
                                    {/* <span className="hero-search-corner hero-search-corner--tl" />
                                    <span className="hero-search-corner hero-search-corner--tr" />
                                    <span className="hero-search-corner hero-search-corner--bl" />
                                    <span className="hero-search-corner hero-search-corner--br" /> */}
                                    <PlayerListProvider>
                                        <ErrorBoundary fallback={(err) => <GenericSearch error={err} />}>
                                            <Suspense fallback={<GenericSearch />}>
                                                <UserSearchBar />
                                            </Suspense>
                                        </ErrorBoundary>
                                    </PlayerListProvider>
                                </span>

                                <button type="submit" id="submitBtn">
                                    Unwrap My Year!
                                </button>
                            </div>

                            {/* <p className="hero-search-note">No login required. We only use your public match history.</p> */}
                        </form>


                        {selectedPlayer && !isLoading && <p className="search-error">{selectedPlayer}</p>}
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

                <div className="marquee-section">
                    <span className="hero-eyebrow">Other Players' Wraps</span>
                    <div className="marquee-frame">
                        <span className="marquee-corner marquee-corner--tl" />
                        <span className="marquee-corner marquee-corner--tr" />
                        <span className="marquee-corner marquee-corner--bl" />
                        <span className="marquee-corner marquee-corner--br" />
                        <div className="marquee-clip">
                            <PlayerMarquee />
                        </div>
                    </div>
                </div>

                <h2 className="hero-join-line">
                    Don't see your name? Join <span style={{ fontWeight: "700", color: "var(--accent-color)" }}><i>{numUsers}+ players</i></span> who've already gotten their <strong>Wraps</strong>.
                </h2>
            </div>
        </>
    );
}

