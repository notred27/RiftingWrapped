import './Leaderboards.css';

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { fetchCached } from '../../resources/fetchCached.js';
import { myBoards } from '../../resources/myBoards.js';
import { isMyPlayer, lastMyPlayer } from '../../resources/myPlayers.js';

export const WRAP_YEAR = 2026;
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

/** The week/year choice, kept in the URL (?period=week) so links keep it. */
export function usePeriod() {
    const [params, setParams] = useSearchParams();
    const period = params.get('period') === 'week' ? 'week' : 'year';
    const setPeriod = (p) => setParams(p === 'year' ? {} : { period: p }, { replace: true });
    return [period, setPeriod];
}

/** Query string for an API call for `period`. */
export function periodQuery(period) {
    return period === 'year' ? `period=year&year=${WRAP_YEAR}` : 'period=week';
}

function useLeaderboards(period) {
    const [state, setState] = useState({ period: null, data: null, error: null });

    useEffect(() => {
        let cancelled = false;
        fetchCached(
            `${process.env.REACT_APP_API_ENDPOINT}/leaderboards?${periodQuery(period)}`,
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

export function PeriodToggle({ period, onChange }) {
    return (
        <div className="lb-toggle" role="group" aria-label="Time period">
            {PERIODS.map((p) => (
                <button key={p.id} type="button" aria-pressed={period === p.id} onClick={() => onChange(p.id)}>
                    {p.label}
                </button>
            ))}
        </div>
    );
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
                                className={`lb-row${isMyPlayer(p.puuid) ? ' lb-row--me' : ''}`}
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

export function BoardGrid({ data, period }) {
    return (
        <div className="lb-grid">
            {BOARDS.map((b) => (
                <Board key={b.id} board={b} players={data.boards[b.id] ?? []} period={period} minGames={data.minGames} />
            ))}
        </div>
    );
}

function FriendsBoards() {
    const navigate = useNavigate();
    const [boards] = useState(myBoards);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    async function createBoard() {
        setCreating(true);
        setError(null);
        try {
            // The player this browser last looked up starts as the first member.
            const puuid = lastMyPlayer();
            const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/boards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(puuid ? { puuid } : {}),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Couldn't create a board. Please try again.");
            navigate(`/leaderboards/${body.id}`);
        } catch (err) {
            setError(err.message);
            setCreating(false);
        }
    }

    return (
        <section className="lb-friends">
            <div className="lb-friends__head">
                <div>
                    <h2>Friends boards</h2>
                    <p>Rank yourself against your friends. Share the invite link and anyone can join.</p>
                </div>
                <button type="button" className="btn btn--primary btn--pill" onClick={createBoard} disabled={creating}>
                    {creating ? 'Creating…' : 'Create a board'}
                </button>
            </div>
            {error && <p className="lb-friends__error" role="alert">{error}</p>}
            {boards.length > 0 && (
                <ul className="lb-friends__list">
                    {boards.map((b) => (
                        <li key={b.id}>
                            <Link className="lb-friends__board" to={`/leaderboards/${b.id}`}>
                                <span className="lb-name">{b.names.length ? b.names.join(', ') : 'No members yet'}</span>
                                <span className="lb-friends__count">{b.count} {b.count === 1 ? 'player' : 'players'}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function Leaderboards() {
    const [period, setPeriod] = usePeriod();
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

                <FriendsBoards />

                <PeriodToggle period={period} onChange={setPeriod} />

                {error && <p className="lb-status">Couldn't load the leaderboards. Please try again in a moment.</p>}
                {!data && !error && <p className="lb-status">Loading leaderboards…</p>}
                {data && <BoardGrid data={data} period={period} />}
            </div>
        </>
    );
}
