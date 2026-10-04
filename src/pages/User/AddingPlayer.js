import { Suspense, useEffect, useState } from "react";

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import UserIntro from '../../components/slides/UserIntro.js';
import UserIntroFallback from '../../components/slides/UserIntroFallback.js';

import { UserResourceProvider } from "../../resources/UserResourceContext.js";
import { trackEvent } from '../../resources/analytics.js';
import { isWrapReady } from '../../resources/playerStatus.js';
import './PlayerStats.css';

const DEFAULT_YEAR = "2026";
const POLL_INTERVAL_MS = 2000;
// Once a user has been queued, their wrap can take up to an hour. Hammering
// the API every 2s for that long isn't useful, so back off after a while.
const SLOW_POLL_INTERVAL_MS = 15000;
const SLOW_POLL_AFTER_MS = 2 * 60 * 1000;

function LoadingDots() {
    return (
        <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </span>
    );
}

export default function AddingPlayer() {
    const { puuid } = useParams();
    const [searchParams] = useSearchParams();
    const year = searchParams.get('year') || DEFAULT_YEAR;

    const nav = useNavigate();

    const [userData, setUserData] = useState({});
    const [copied, setCopied] = useState(false);

    const status = userData.status;
    const isFinished = isWrapReady(status) || status === "failed";

    useEffect(() => {
        if (isFinished) return;

        let timeoutId;
        let cancelled = false;
        const startedAt = Date.now();

        const fetchStatus = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_ENDPOINT;
                const response = await fetch(`${apiUrl}/users/${puuid}`);
                const data = await response.json();
                if (cancelled) return;

                if (isWrapReady(data.status)) {
                    trackEvent('wrap_ready', { from: 'adding_player' });
                    nav(`/player/${puuid}?year=${year}`, { replace: true });
                    return;
                }
                if (data.status === "failed") {
                    trackEvent('register_fail', { status: 'processing_failed' });
                }

                setUserData(data);
                if (data.status === "failed") return;
            } catch (err) {
                console.error("Error fetching user:", err);
            }

            if (cancelled) return;
            const elapsed = Date.now() - startedAt;
            timeoutId = setTimeout(fetchStatus, elapsed > SLOW_POLL_AFTER_MS ? SLOW_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
        };

        fetchStatus();

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [isFinished, puuid, year, nav]);

    const copyReturnLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            trackEvent('copy_return_link');
        } catch {
            setCopied(false);
        }
    };

    const hasProgress = status === "pending" && userData.processedMatches !== undefined && userData.totalMatches;

    return (<>
        <UserResourceProvider puuid={puuid} year={year}>
            <Suspense fallback={<UserIntroFallback year={year} />}>
                <div className="fade-in">
                    <UserIntro year={year} />
                </div>
            </Suspense>
        </UserResourceProvider>

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            paddingLeft: '5vw',
            paddingRight: '5vw',
        }}>
            {(!status || status === "starting") &&
                <p className="loading-text">Searching for user<LoadingDots /></p>
            }

            {status === "counting" &&
                <p className="loading-text">Gathering your match history<LoadingDots /></p>
            }

            {hasProgress &&
                <div>
                    <h2 className="loading-text">Processing your matches<LoadingDots /></h2>
                    <h3>{userData.processedMatches} / {userData.totalMatches} Matches Processed</h3>
                    <progress
                        value={userData.processedMatches}
                        max={userData.totalMatches}
                        style={{ width: "min(320px, 80vw)", accentColor: "var(--accent-color)" }}
                    />
                </div>
            }

            {status === "pending" && !hasProgress &&
                <p>
                    You're in queue! This can take up to an hour depending on how many other players are joining right now.
                </p>
            }

            {status === "failed" &&
                <div>
                    <h2>We couldn't finish building your Wrapped.</h2>
                    <p>Something went wrong while processing your matches. Please try searching for yourself again in a little while.</p>
                    <Link className="emphasize" to="/">Back to search</Link>
                </div>
            }

            {status && !isFinished &&
                <div style={{ marginTop: "16px" }}>
                    <p className="subtitle">
                        You don't need to keep this tab open. Save this link and come back once your matches are processed.
                    </p>
                    <button type="button" className="btn btn--secondary" onClick={copyReturnLink}>
                        {copied ? "Link copied!" : "Copy link to this page"}
                    </button>
                </div>
            }
        </div>

    </>)
}
