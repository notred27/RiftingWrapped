import { Suspense, useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { PlayerListProvider } from '../../resources/PlayerListContext';
import { fetchCached } from '../../resources/fetchCached';
import { trackEvent } from '../../resources/analytics';
import { isWrapReady } from '../../resources/playerStatus';
import { lastMyPlayer, rememberMyPlayer } from '../../resources/myPlayers.js';

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
    // Someone who has looked themselves up before gets a shortcut to their week.
    const [returningPuuid] = useState(lastMyPlayer);

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
            const names = document.getElementById("nameInput").value.split("#").map((n) => n.trim());

            if (names.length !== 2 || !names[0] || !names[1]) {
                setSelectedPlayer("Enter your Riot ID as Game Name#Tag (e.g. Faker#KR1).");
                setIsLoading(false);
                return;
            }

            const [displayName, tag] = names;
            setSelectedPlayer(displayName);
            trackEvent('search_submit', { region });

            const lookupUrl = `${apiUrl}/users/by-riot-id/${encodeURIComponent(displayName)}/${encodeURIComponent(tag)}/${region}`;
            let response = await fetch(lookupUrl);
            const found = response.ok ? await response.clone().json() : null;

            // A failed player registers again; the API restarts their processing.
            if (response.status === 404 || found?.status === 'failed') {
                trackEvent('register_start', { region });
                setSelectedPlayer(`Registering ${displayName}... this can take a minute.`);

                const addResponse = await fetch(`${apiUrl}/users`, {
                    method: "POST",
                    body: new URLSearchParams({ displayName, tag, region }),
                });

                const addBody = await addResponse.json().catch(() => null);

                if (!addResponse.ok && addResponse.status !== 409) {
                    trackEvent('register_fail', { region, status: addResponse.status });
                    setSelectedPlayer(
                        addBody?.message ||
                        "Failed to find user. Please check that your name and region are correct."
                    );
                    setIsLoading(false);
                    return;
                }

                response = await fetch(lookupUrl);
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

            trackEvent('search_success', { region, ready: isWrapReady(status) });
            rememberMyPlayer(puuid);
            navigate(
                isWrapReady(status)
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
                <title>{`Rifting Wrapped ${WRAP_YEAR} | League of Legends Wrapped & LoL Stats`}</title>
                <meta name="description" content={`Your League of Legends Wrapped for ${WRAP_YEAR}: top champions, best and worst games, hours played and a shareable year in review. Free LoL stats, updated daily.`} />

                <meta property="og:title" content={`Rifting Wrapped ${WRAP_YEAR} | League of Legends Wrapped & LoL Stats`} />
                <meta property="og:description" content={`Your LoL year in review: top champions, best (and worst) games, and exactly how many hours you've spent on the Rift in ${WRAP_YEAR}.`} />
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
                <img className="heroOverlay" src={bg_image} alt="" aria-hidden="true" />
                <div className="heroText">
                    <div className="hero-copy">
                        <h1>Your Stats on the Rift, <span className="hero-title-accent">Unwrapped.</span></h1>
                        <p style={{maxWidth:"760px", textWrap:"pretty"}}>
                            How many hours have you really spent on League? Enter your Riot ID to see your champs, best and worst games, and time you spent on the Rift. Updates daily!
                        </p>
                    </div>


                    <div className="hero-form-wrap">

                        <form onSubmit={fetchPlayer} className="searchForm">
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

                                <button type="submit" id="submitBtn" className="btn btn--primary btn--pill">
                                    Unwrap My Stats!
                                </button>
                            </div>

                            {/* <p className="hero-search-note">No login required. We only use your public match history.</p> */}
                        </form>


                        {returningPuuid && !isLoading &&
                            <Link
                                className="hero-returning-link"
                                to={`/player/${returningPuuid}/week`}
                                onClick={() => trackEvent('weekly_cta_click', { from: 'home' })}
                            >
                                Welcome back! See your week on the Rift ›
                            </Link>
                        }

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
                    <div className="marquee-frame">
                        <h2 className="hero-join-line">
                    Don't see your name? Join <span style={{ fontWeight: "700", color: "var(--accent-text)" }}><i>{numUsers}+ players</i></span> who are already tracking their <strong>stats</strong>.
                </h2>
                        <div className="marquee-clip">
                            <PlayerMarquee />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

