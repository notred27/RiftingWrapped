import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { trackEvent } from '../../resources/analytics.js';
import { fetchCached } from '../../resources/fetchCached.js';

const SHOWN = 5;

// Home's "Most games this week" panel. Same request and cache key as the
// leaderboards page's week view, so opening one warms the other.
export default function WeeklyTopPlayers() {
    const [players, setPlayers] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchCached(
            `${process.env.REACT_APP_API_ENDPOINT}/leaderboards?period=week`,
            'leaderboards-week-2026',
            10 * 60 * 1000
        ).then(
            (data) => { if (!cancelled) setPlayers((data.boards?.games ?? []).slice(0, SHOWN)); },
            () => { if (!cancelled) setFailed(true); }
        );
        return () => { cancelled = true; };
    }, []);

    if (failed) return null;    // the search is the page's job; don't show a broken panel next to it

    return (
        <aside className="hero-lb" aria-labelledby="hero-lb-title">
            <div className="hero-lb__head">
                <h2 id="hero-lb-title">Most games this week</h2>
            </div>

            {players === null && <p className="hero-lb__status">Loading…</p>}
            {players?.length === 0 && <p className="hero-lb__status">No games yet this week.</p>}
            {players?.length > 0 && (
                <ol className="hero-lb__list">
                    {players.map((p, i) => (
                        <li key={p.puuid}>
                            <Link className="hero-lb__row" to={`/player/${p.puuid}/week`} onClick={() => trackEvent('top_player_click', { rank: i + 1 })}>
                                <span className="hero-lb__rank">{i + 1}</span>
                                {p.icon
                                    ? <img className="hero-lb__icon" src={p.icon} alt="" loading="lazy" />
                                    : <span className="hero-lb__icon" aria-hidden="true" />}
                                <span className="hero-lb__name">{p.displayName}<span className="hero-lb__tag">#{p.tag}</span></span>
                                <span className="hero-lb__value">{p.games}</span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}

            <Link className="btn btn--secondary btn--pill hero-lb__all" to="/leaderboards?period=week" onClick={() => trackEvent('top_players_see_all')}>
                See all leaderboards
            </Link>
        </aside>
    );
}
