import './Leaderboards.css';

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchCached } from '../../resources/fetchCached.js';

const WRAP_YEAR = 2026;
const CACHE_MS = 10 * 60 * 1000;      // the API rebuilds boards every 10 minutes

const PERIODS = [
    { id: 'week', label: 'This week' },
    { id: 'year', label: `${WRAP_YEAR}` },
];

const BOARDS = [
    { id: 'games', title: 'Most games', value: (p) => p.games.toLocaleString() },
    { id: 'hours', title: 'Most hours played', value: (p) => `${p.hours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hrs` },
    { id: 'kills', title: 'Most kills', value: (p) => p.kills.toLocaleString() },
    { id: 'winRate', title: 'Best win rate', value: (p) => `${p.winRate}%`, rate: true },
    { id: 'kda', title: 'Best KDA', value: (p) => p.kda.toFixed(2), rate: true },
];

function useLeaderboards(period) {
    const [state, setState] = useState({ period: null, data: null, error: null });

    useEffect(() => {
        let cancelled = false;
        const query = period === 'year' ? `period=year&year=${WRAP_YEAR}` : 'period=week';
        fetchCached(
            `${process.env.REACT_APP_API_ENDPOINT}/leaderboards?${query}`,
            `leaderboards-${period}-${WRAP_YEAR}`,
            CACHE_MS
        ).then(
            (data) => { if (!cancelled) setState({ period, data, error: null }); },
            (error) => { if (!cancelled) setState({ period, data: null, error }); }
        );
        return () => { cancelled = true; };
    }, [period]);

    return state.period === period ? state : { data: null, error: null };
}

function Board({ board, players, period, minGames }) {
    return (
        <section className="lb-board">
            <h2>{board.title}</h2>
            {board.rate && <p className="lb-board__note">At least {minGames} games</p>}
            {players.length === 0 ? (
                <p className="lb-board__empty">No one qualifies yet.</p>
            ) : (
                <ol className="lb-list">
                    {players.map((p, i) => (
                        <li key={p.puuid}>
                            <Link
                                className="lb-row"
                                to={period === 'week' ? `/player/${p.puuid}/week` : `/player/${p.puuid}?year=${WRAP_YEAR}`}
                            >
                                <span className="lb-rank">{i + 1}</span>
                                {p.icon
                                    ? <img className="lb-icon" src={p.icon} alt="" loading="lazy" />
                                    : <span className="lb-icon" aria-hidden="true" />}
                                <span className="lb-name">
                                    {p.displayName}<span className="lb-tag">#{p.tag}</span>
                                </span>
                                <span className="lb-value">{board.value(p)}</span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

export default function Leaderboards() {
    const [params, setParams] = useSearchParams();
    const period = params.get('period') === 'week' ? 'week' : 'year';
    const { data, error } = useLeaderboards(period);

    return (
        <>
            <Helmet defer={false}>
                <title>League of Legends Leaderboards | Rifting Wrapped</title>
                <meta name="description" content="The most active Rifting Wrapped players this week and this year: most games, hours played and kills, plus the best win rates and KDAs." />
                <link rel="canonical" href="https://www.riftingwrapped.com/leaderboards" />
            </Helmet>

            <div className="lb-page">
                <header className="lb-header">
                    <h1>Leaderboards</h1>
                    <p>The top Rifting Wrapped players, updated every 10 minutes.</p>
                </header>

                <div className="lb-toggle" role="group" aria-label="Time period">
                    {PERIODS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            aria-pressed={period === p.id}
                            onClick={() => setParams(p.id === 'year' ? {} : { period: p.id }, { replace: true })}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {error && <p className="lb-status">Couldn't load the leaderboards. Please try again in a moment.</p>}
                {!data && !error && <p className="lb-status">Loading leaderboards…</p>}

                {data && (
                    <div className="lb-grid">
                        {BOARDS.map((b) => (
                            <Board key={b.id} board={b} players={data.boards[b.id] ?? []} period={period} minGames={data.minGames} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
