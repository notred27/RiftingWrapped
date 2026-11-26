import { Suspense, useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { PlayerListProvider } from '../../resources/PlayerListContext';
import { fetchCached } from '../../resources/fetchCached';
import { trackEvent } from '../../resources/analytics';
import { isWrapReady } from '../../resources/playerStatus';
import { rememberMyPlayer } from '../../resources/myPlayers.js';
import { findOrRegisterPlayer, parseRiotId } from '../../resources/findOrRegisterPlayer.js';

import UserSearchBar from '../../components/common/UserSearchBar';
import PlayerMarquee from '../../components/common/PlayerMarquee';
import GenericSearch from '../../components/common/GenericSearch';
import ErrorBoundary from '../../components/error/ErrorBoundary';
import WeeklyTopPlayers from './WeeklyTopPlayers.js';


import bg_image from '../../images/Jax_0.webp';
import './Home.css';


export default function Home() {
    const [numUsers, setNumUsers] = useState(290);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Which recap the search opens: the year's Wrapped or this week's recap.
    const [mode, setMode] = useState('year');
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

        try {
            const region = document.getElementById("regionSelect").value;
            const riotId = parseRiotId(document.getElementById("nameInput").value);

            if (!riotId) {
                setSelectedPlayer("Enter your Riot ID as Game Name#Tag (e.g. Faker#KR1).");
                setIsLoading(false);
                return;
            }

            const [displayName, tag] = riotId;
            setSelectedPlayer(displayName);
            trackEvent('search_submit', { region });

            const { puuid, status } = await findOrRegisterPlayer(displayName, tag, region,
                () => setSelectedPlayer(`Registering ${displayName}... this can take a minute.`));

            trackEvent('search_success', { region, ready: isWrapReady(status), mode });
            rememberMyPlayer(puuid);
            if (!isWrapReady(status)) navigate(`/addPlayer/${puuid}?year=${WRAP_YEAR}`);
            else navigate(mode === 'week' ? `/player/${puuid}/week` : `/player/${puuid}?year=${WRAP_YEAR}`);
        } catch (err) {
            console.error(err);
            setSelectedPlayer(err.message || "Unexpected error. Please try again later.");
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
                <div className="hero-main">
                <div className="heroText">
                    <div className="hero-copy">
                        <h1>Your Stats on the Rift, <span className="hero-title-accent">Unwrapped</span></h1>
                        <p style={{maxWidth:"760px", textWrap:"pretty"}}>
                            How many hours have you really spent on League? Enter your Riot ID to see your champs, best and worst games, and time on the Rift, for the whole year or just this week. Updates daily!
                        </p>
                    </div>


                    <div className="hero-form-wrap">

                        <form onSubmit={fetchPlayer} className="searchForm">
                            <div className="hero-mode" role="group" aria-label="Recap length">
                                <button type="button" aria-pressed={mode === 'year'} onClick={() => setMode('year')}>{WRAP_YEAR} Wrapped</button>
                                <button type="button" aria-pressed={mode === 'week'} onClick={() => setMode('week')}>This week</button>
                            </div>
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
                                    {/* Both labels are laid out so the button keeps the wider one's size; only the current one shows. */}
                                    <span className="submit-labels">
                                        <span className={mode === 'year' ? '' : 'is-hidden'}>Unwrap My Stats!</span>
                                        <span className={mode === 'week' ? '' : 'is-hidden'}>Unwrap My Week!</span>
                                    </span>
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

                <WeeklyTopPlayers />
                </div>

                <div className="marquee-section">
                    <div className="marquee-frame">
                        <h2 className="hero-join-line">
                            Join <span className="hero-join-count">{numUsers}+ players</span> already tracking their stats
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

