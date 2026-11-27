import './Leaderboards.css';

import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import GenericSearch from '../../components/common/GenericSearch.js';
import { trackEvent } from '../../resources/analytics.js';
import { findOrRegisterPlayer, parseRiotId } from '../../resources/findOrRegisterPlayer.js';
import { rememberBoard } from '../../resources/myBoards.js';
import { isMyPlayer, rememberMyPlayer } from '../../resources/myPlayers.js';
import { BoardGrid, PeriodToggle, periodQuery, usePeriod } from './Leaderboards.js';

const API = process.env.REACT_APP_API_ENDPOINT;

function useBoard(id, period, version) {
    const [state, setState] = useState({ key: null, board: null, status: null });
    const key = `${id}|${period}|${version}`;

    useEffect(() => {
        let cancelled = false;
        // Not cached: a join should show up on the next load.
        fetch(`${API}/boards/${encodeURIComponent(id)}?${periodQuery(period)}`)
            .then(async (res) => {
                const board = res.ok ? await res.json() : null;
                if (!cancelled) setState({ key, board, status: res.status });
            })
            .catch(() => { if (!cancelled) setState({ key, board: null, status: 0 }); });
        return () => { cancelled = true; };
    }, [key, id, period]);

    return state.key === key ? state : { board: null, status: null };
}

function InviteLink({ id }) {
    const url = `${window.location.origin}/b/${id}`;     // link-preview page, then redirects with ?ref=invite
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            trackEvent('board_invite_copy');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt('Copy this invite link:', url);      // clipboard blocked (e.g. insecure context)
        }
    }

    return (
        <div className="bd-invite">
            <span className="bd-invite__url">{url}</span>
            <button type="button" className="btn btn--secondary btn--pill" onClick={copy}>
                {copied ? 'Copied!' : 'Copy invite link'}
            </button>
        </div>
    );
}

function JoinForm({ id, fromInvite, onJoined }) {
    const [message, setMessage] = useState(null);
    const [busy, setBusy] = useState(false);

    async function join(e) {
        e.preventDefault();
        const region = document.getElementById('regionSelect').value;
        const riotId = parseRiotId(document.getElementById('nameInput').value);
        if (!riotId) {
            setMessage('Enter your Riot ID as Game Name#Tag (e.g. Faker#KR1).');
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const [displayName, tag] = riotId;
            const player = await findOrRegisterPlayer(displayName, tag, region,
                () => setMessage(`Registering ${displayName}... this can take a minute.`));
            const res = await fetch(`${API}/boards/${encodeURIComponent(id)}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puuid: player.puuid }),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.message || "Couldn't join this board. Please try again.");
            rememberMyPlayer(player.puuid);
            trackEvent('board_join', { from_invite: fromInvite });
            setMessage(null);
            onJoined();
        } catch (err) {
            setMessage(err.message || 'Unexpected error. Please try again later.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <form className="bd-join" onSubmit={join}>
            <h2>Join this board</h2>
            <div className="bd-join__row">
                <span className="bd-join__search"><GenericSearch /></span>
                <button type="submit" className="btn btn--primary btn--pill" disabled={busy}>
                    {busy ? 'Joining…' : 'Join'}
                </button>
            </div>
            {message && <p className="bd-join__message" role="status">{message}</p>}
        </form>
    );
}

export default function FriendBoard() {
    const { boardId } = useParams();
    const [period, setPeriod] = usePeriod();
    const [version, setVersion] = useState(0);
    const { board, status } = useBoard(boardId, period, version);
    // Read once: the period toggle rewrites the query string and drops ?ref.
    const [searchParams] = useSearchParams();
    const [fromInvite] = useState(() => searchParams.get('ref') === 'invite');

    const me = board?.members.find((m) => isMyPlayer(m.puuid));
    useEffect(() => {
        if (board && me) rememberBoard(board.id, board.members);
    }, [board, me]);

    // Non-member board_view vs board_join = how many visitors join. Once per
    // board: period toggles and joins reload it and would double count.
    const viewed = useRef(null);
    useEffect(() => {
        if (!board || viewed.current === board.id) return;
        viewed.current = board.id;
        trackEvent('board_view', { member: Boolean(me), from_invite: fromInvite });
    }, [board, me, fromInvite]);

    return (
        <>
            <Helmet defer={false}>
                <title>Friends Leaderboard | Rifting Wrapped</title>
                <meta name="description" content="See how you stack up against your friends in League of Legends this week and this year." />
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="lb-page">
                <header className="lb-header">
                    <h1>Friends board</h1>
                    <p>
                        {board ? `${board.members.length} of ${board.maxMembers} players` : ' '}
                        {' · '}<Link className="text-link" to="/leaderboards">All leaderboards</Link>
                    </p>
                </header>

                {status === 404 && <p className="lb-status">This board doesn't exist. Boards nobody opens for six months are deleted.</p>}
                {status !== null && status !== 404 && !board && <p className="lb-status">Couldn't load this board. Please try again in a moment.</p>}
                {status === null && <p className="lb-status">Loading board…</p>}

                {board && (
                    <>
                        <InviteLink id={board.id} />

                        {me
                            ? <p className="bd-you">You're on this board as <strong>{me.displayName}#{me.tag}</strong>.</p>
                            : board.members.length < board.maxMembers
                                ? <JoinForm id={board.id} fromInvite={fromInvite} onJoined={() => setVersion((v) => v + 1)} />
                                : <p className="bd-you">This board is full.</p>}

                        {board.members.length === 0
                            ? <p className="lb-status">No one has joined yet. Share the invite link with your friends.</p>
                            : (
                                <>
                                    <PeriodToggle period={period} onChange={setPeriod} />
                                    <BoardGrid data={board} period={period} />
                                    <p className="bd-note">New players' stats show up once their matches are loaded, usually within an hour.</p>
                                </>
                            )}
                    </>
                )}
            </div>
        </>
    );
}
