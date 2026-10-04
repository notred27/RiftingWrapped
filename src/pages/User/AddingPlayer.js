import { Suspense, useEffect, useState } from "react";

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import UserIntro from '../../components/slides/UserIntro.js';
import UserIntroFallback from '../../components/slides/UserIntroFallback.js';

import { UserResourceProvider } from "../../resources/UserResourceContext.js";
import { trackEvent } from '../../resources/analytics.js';
import { isWrapReady } from '../../resources/playerStatus.js';
import { clearCached } from '../../resources/fetchCached.js';
import './PlayerStats.css';

const DEFAULT_YEAR = "2026";
const POLL_INTERVAL_MS = 2000;
// Once a user has been queued, their wrap can take up to an hour. Hammering
// the API every 2s for that long isn't useful, so back off after a while.
const SLOW_POLL_INTERVAL_MS = 15000;
const SLOW_POLL_AFTER_MS = 2 * 60 * 1000;

/** "about 25 minutes", "about 1 hr 10 min", "less than a minute" */
function formatWait(minutes) {
    if (minutes == null) return null;
    if (minutes <= 1) return "less than a minute";
    if (minutes < 60) return `about ${minutes} minutes`;
    const h = Math.floor(minutes / 60), m = minutes % 60;
    return `about ${h} hr${m ? ` ${m} min` : ""}`;
}

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
    const [queue, setQueue] = useState(null);
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
                    // Stats seen before processing finished (e.g. an earlier visit to
                    // the player page) are stale now.
                    clearCached(puuid);
                    nav(`/player/${puuid}?year=${year}`, { replace: true });
                    return;
                }
                if (data.status === "failed") {
                    trackEvent('register_fail', { status: 'processing_failed' });
                }

                setUserData(data);
                if (data.status === "failed") return;

                // Place in line, once the player's matches are queued.
                if (data.status === "pending") {
                    const q = await fetch(`${apiUrl}/users/${puuid}/queue?year=${year}`).then(r => r.ok ? r.json() : null).catch(() => null);
                    if (!cancelled) setQueue(q);
                }
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
    const inLine = status === "pending" && queue?.inQueue && queue.playersAhead > 0;
    const wait = queue?.inQueue ? formatWait(queue.estimatedMinutes) : null;

    return (
        <div className="adding-player">
            <UserResourceProvider puuid={puuid} year={year}>
                <Suspense fallback={<UserIntroFallback year={year} />}>
                    <div className="fade-in">
                        <UserIntro year={year} waiting />
                    </div>
                </Suspense>
            </UserResourceProvider>

            <div className="adding-player__status">
                {(!status || status === "starting") &&
                    <p className="adding-player__title loading-text">Searching for user<LoadingDots /></p>
                }

                {status === "counting" &&
                    <p className="adding-player__title loading-text">Gathering your match history<LoadingDots /></p>
                }

                {inLine &&
                    <div className="queue-status">
                        <p className="queue-status__eyebrow">Your place in line</p>
                        <p className="queue-status__position">#{queue.position}</p>
                        <p className="queue-status__detail">
                            {queue.playersAhead === 1 ? "1 player is" : `${queue.playersAhead.toLocaleString()} players are`} ahead of you
                            ({queue.matchesAhead.toLocaleString()} matches to go before yours)
                            {wait && <> · <strong>{wait}</strong> until your Wrapped is ready</>}
                        </p>
                    </div>
                }

                {hasProgress && !inLine && <>
                    <p className="adding-player__title loading-text">Processing your matches<LoadingDots /></p>
                    <p className="adding-player__count">
                        {userData.processedMatches.toLocaleString()} / {userData.totalMatches.toLocaleString()} matches processed
                    </p>
                    <progress
                        className="adding-player__progress"
                        value={userData.processedMatches}
                        max={userData.totalMatches}
                    />
                    {wait && <p className="adding-player__note">{wait} left</p>}
                </>}

                {status === "pending" && !hasProgress && !inLine &&
                    <p className="adding-player__note">
                        You're in queue! This can take up to an hour depending on how many other players are joining right now.
                    </p>
                }

                {status === "failed" && <>
                    <p className="adding-player__title">We couldn't finish building your Wrapped.</p>
                    <p className="adding-player__note">Something went wrong while processing your matches. Please try searching for yourself again in a little while.</p>
                    <Link className="btn btn--secondary" to="/">Back to search</Link>
                </>}
            </div>

            {status && !isFinished &&
                <div className="adding-player__return">
                    <p className="adding-player__note">
                        You don't need to keep this tab open. Save this link and come back once your matches are processed.
                    </p>
                    <button type="button" className="btn btn--secondary" onClick={copyReturnLink}>
                        {copied ? "Link copied!" : "Copy link to this page"}
                    </button>
                </div>
            }
        </div>
    );
}
