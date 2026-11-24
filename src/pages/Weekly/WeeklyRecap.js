import './WeeklyRecap.css';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import ErrorBoundary from '../../components/error/ErrorBoundary.js';
import UserError from '../../components/error/UserError.js';
import { trackEvent } from '../../resources/analytics.js';
import { fetchCached } from '../../resources/fetchCached.js';
import { changesSince, readLastVisit, recordVisit } from '../../resources/lastVisit.js';
import { isMyPlayer } from '../../resources/myPlayers.js';
import { plural } from '../../resources/theme.js';
import { UserResourceProvider, useStatsResources } from '../../resources/UserResourceContext.js';
import { weeklyAwards } from './weeklyAwards.js';

const WRAP_YEAR = 2026;
const MAX_WEEKS_AGO = 60;             // keep in step with WEEKLY_MAX_WEEKS_AGO in backend/flask/app.py
const RECAP_CACHE_MS = 10 * 60 * 1000;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function clampWeek(raw) {
	const n = parseInt(raw ?? '0', 10);
	return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_WEEKS_AGO) : 0;
}

function hours(seconds) {
	const h = seconds / 3600;
	if (h > 0 && h < 10) return `${h.toFixed(1)} hrs`;
	return Math.round(h) === 1 ? '1 hr' : `${Math.round(h).toLocaleString()} hrs`;
}

function winRate(t) {
	return t.games ? Math.round((t.wins / t.games) * 100) : 0;
}

/** "Nov 16 – 22" or "Nov 30 – Dec 6", in the viewer's time zone. */
function weekLabel(startIso, endIso) {
	const start = new Date(startIso);
	const last = new Date(new Date(endIso).getTime() - 1);
	const month = (d) => d.toLocaleDateString(undefined, { month: 'short' });
	return start.getMonth() === last.getMonth()
		? `${month(start)} ${start.getDate()} – ${last.getDate()}`
		: `${month(start)} ${start.getDate()} – ${month(last)} ${last.getDate()}`;
}

function timeAgo(ms) {
	const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	const minutes = Math.round((Date.now() - ms) / 60000);
	if (minutes < 60) return rtf.format(-minutes, 'minute');
	if (minutes < 60 * 24) return rtf.format(-Math.round(minutes / 60), 'hour');
	return rtf.format(-Math.round(minutes / (60 * 24)), 'day');
}

function useWeeklyRecap(puuid, weeksAgo) {
	const tz = new Date().getTimezoneOffset();
	const key = `${puuid}|${weeksAgo}|${tz}`;
	const [state, setState] = useState({ key: null, recap: null, error: null });

	useEffect(() => {
		let cancelled = false;
		fetchCached(
			`${process.env.REACT_APP_API_ENDPOINT}/weekly/${encodeURIComponent(puuid)}?week=${weeksAgo}&tz=${tz}`,
			`weekly-${puuid}-${weeksAgo}-${tz}`,
			RECAP_CACHE_MS
		).then(
			(recap) => { if (!cancelled) setState({ key, recap, error: null }); },
			(error) => { if (!cancelled) setState({ key, recap: null, error }); }
		);
		return () => { cancelled = true; };
	}, [key, puuid, weeksAgo, tz]);

	return state.key === key ? state : { recap: null, error: null };
}

// "Since your last visit" is worked out once per page load, then the visit is
// recorded - so moving between weeks (or a StrictMode double effect) doesn't
// compare the player against the snapshot this same visit just wrote.
const sinceThisLoad = new Map();
function sinceLastVisit(puuid, recap) {
	if (!sinceThisLoad.has(puuid)) {
		sinceThisLoad.set(puuid, changesSince(readLastVisit(puuid), recap.year, recap.yearToDate));
		recordVisit(puuid, recap.year, recap.yearToDate);
	}
	return sinceThisLoad.get(puuid);
}

export default function WeeklyRecap() {
	const { puuid } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const weeksAgo = clampWeek(searchParams.get('week'));
	const isOwner = useMemo(() => isMyPlayer(puuid), [puuid]);

	const setWeek = (n) => setSearchParams(n ? { week: String(n) } : {}, { replace: true });

	return (
		<UserResourceProvider puuid={puuid} year={WRAP_YEAR}>
			<Helmet defer={false}>
				<title>Your Week on the Rift | Rifting Wrapped</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<div className="wk-page">
				<ErrorBoundary fallback={(err) => <UserError error={err} />}>
					<Suspense fallback={<div className="wk-loading">Loading your week…</div>}>
						<WeeklyContent puuid={puuid} weeksAgo={weeksAgo} setWeek={setWeek} isOwner={isOwner} />
					</Suspense>
				</ErrorBoundary>
			</div>
		</UserResourceProvider>
	);
}

function WeeklyContent({ puuid, weeksAgo, setWeek, isOwner }) {
	const { user, lolVersion } = useStatsResources();
	const userInfo = user.read();
	const version = lolVersion.read()?.[0];
	const { recap, error } = useWeeklyRecap(puuid, weeksAgo);
	const [since, setSince] = useState(null);

	useEffect(() => {
		if (!recap) return;
		trackEvent('weekly_view', { week: weeksAgo, owner: isOwner });
		if (recap.isCurrentWeek) setSince(sinceLastVisit(puuid, recap));
	}, [recap, puuid, weeksAgo, isOwner]);

	return (
		<>
			<header className="wk-header">
				<img className="wk-avatar" src={userInfo.icon} alt="" />
				<div className="wk-header__text">
					<p className="wk-eyebrow">Your week on the Rift</p>
					<h1 className="wk-name">{userInfo.displayName}<span className="wk-tag">#{userInfo.tag}</span></h1>
				</div>
			</header>

			<nav className="wk-nav" aria-label="Choose a week">
				<button className="btn btn--secondary btn--icon" onClick={() => setWeek(weeksAgo + 1)} disabled={weeksAgo >= MAX_WEEKS_AGO} aria-label="Previous week">‹</button>
				<div className="wk-nav__label">
					<span className="wk-nav__range">{recap ? weekLabel(recap.weekStart, recap.weekEnd) : '…'}</span>
					<span className="wk-nav__sub">{weeksAgo === 0 ? 'This week so far' : weeksAgo === 1 ? 'Last week' : `${weeksAgo} weeks ago`}</span>
				</div>
				<button className="btn btn--secondary btn--icon" onClick={() => setWeek(weeksAgo - 1)} disabled={weeksAgo === 0} aria-label="Next week">›</button>
			</nav>

			{error && <p className="wk-error">Couldn't load this week. Please try again in a moment.</p>}
			{!recap && !error && <div className="wk-loading">Loading your week…</div>}
			{recap && <WeekBody recap={recap} since={since} version={version} puuid={puuid} isOwner={isOwner} />}
		</>
	);
}

function WeekBody({ recap, since, version, puuid, isOwner }) {
	const w = recap.thisWeek;
	const last = recap.lastWeek;
	const awards = weeklyAwards(recap);

	return (
		<>
			{since && recap.isCurrentWeek && (
				<section className="wk-since" aria-label="Added since your last visit">
					{/* "Added", not "played": a backfill or late processing can add older games. */}
					<span className="wk-since__label">Added since you last checked {timeAgo(since.at)}</span>
					<span className="wk-since__stats">
						+{plural(since.games, 'game')} · +{hours(since.seconds)} · +{plural(since.wins, 'win')}
					</span>
				</section>
			)}

			{w.games === 0
				? <EmptyWeek recap={recap} />
				: <>
					<section className="wk-hero">
						<h2 className="wk-hero__title">{plural(w.games, 'game')}</h2>
						<p className="wk-hero__sub">
							{w.wins}W – {w.games - w.wins}L · {winRate(w)}% win rate · {hours(w.seconds)}
						</p>
					</section>

					<section className="wk-tiles">
						<Tile label="Games" value={w.games} delta={w.games - last.games} />
						<Tile label="Win rate" value={`${winRate(w)}%`} delta={last.games ? winRate(w) - winRate(last) : null} unit="pts" />
						<Tile label="Hours" value={hours(w.seconds)} delta={last.games ? Math.round((w.seconds - last.seconds) / 360) / 10 : null} unit="h" />
						<Tile label="KDA" value={w.kda.toFixed(2)} delta={last.games ? Math.round((w.kda - last.kda) * 100) / 100 : null} />
					</section>

					<DayStrip days={w.days} isCurrentWeek={recap.isCurrentWeek} />

					<div className="wk-grid">
						<TopChamps champs={w.topChamps} games={w.games} version={version} />
						{w.bestGame && <GameOfTheWeek game={w.bestGame} version={version} />}
					</div>

					{awards.length > 0 && (
						<section className="wk-card">
							<h3 className="wk-card__title">This week's awards</h3>
							<ul className="wk-awards">
								{awards.map((a) => (
									<li key={a.id} className="wk-award">
										<span className="wk-award__title">{a.title}</span>
										<span className="wk-award__detail">{a.detail}</span>
									</li>
								))}
							</ul>
						</section>
					)}
				</>}

			<YearProgress recap={recap} />

			<div className="btn-row wk-cta">
				<Link className="btn btn--primary" to={`/player/${puuid}?year=${recap.year}`}>See your full {recap.year} Wrapped</Link>
				{!isOwner && <Link className="btn btn--secondary" to="/" onClick={() => trackEvent('viral_cta_click', { from: 'weekly' })}>Make your own</Link>}
			</div>
			{recap.isCurrentWeek && <p className="wk-footnote">Updates hourly. Come back next week to see how you stack up against this one.</p>}
		</>
	);
}

function Tile({ label, value, delta, unit = '' }) {
	let chip = null;
	if (delta !== null && delta !== undefined) {
		const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
		const text = delta === 0 ? 'same as last week' : `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta).toLocaleString()}${unit === 'h' ? 'h' : unit ? ` ${unit}` : ''}`;
		chip = <span className={`wk-delta wk-delta--${dir}`}>{text}</span>;
	}
	return (
		<div className="wk-tile">
			<span className="wk-tile__label">{label}</span>
			<span className="wk-tile__value">{value}</span>
			{chip ?? <span className="wk-delta wk-delta--flat">no games last week</span>}
		</div>
	);
}

function DayStrip({ days, isCurrentWeek }) {
	const max = Math.max(1, ...days);
	const today = (new Date().getDay() + 6) % 7;   // Monday = 0
	return (
		<section className="wk-card">
			<h3 className="wk-card__title">Games by day</h3>
			<div className="wk-days">
				{days.map((n, i) => (
					<div key={DAY_LABELS[i]} className={`wk-day${isCurrentWeek && i > today ? ' wk-day--future' : ''}`}>
						<span className="wk-day__count">{n || ''}</span>
						<span className="wk-day__bar" style={{ height: `${(n / max) * 100}%` }} data-max={n === max && n > 0 ? '' : undefined} />
						<span className={`wk-day__label${isCurrentWeek && i === today ? ' wk-day__label--today' : ''}`}>{DAY_LABELS[i]}</span>
					</div>
				))}
			</div>
		</section>
	);
}

function champIcon(version, champion) {
	return version ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png` : '';
}

function TopChamps({ champs, games, version }) {
	const [top, ...rest] = champs;
	if (!top) return null;
	return (
		<section className="wk-card wk-champ">
			<img className="wk-champ__splash" src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${top.champion}_0.jpg`} alt="" />
			<div className="wk-champ__body">
				<h3 className="wk-card__title">Champion of the week</h3>
				<p className="wk-champ__name">{top.champion}</p>
				<p className="wk-champ__meta">{plural(top.games, 'game')} · {top.wins}W – {top.games - top.wins}L · {Math.round((top.games / games) * 100)}% of your week</p>
				{rest.length > 0 && (
					<ul className="wk-champ__rest">
						{rest.map((c) => (
							<li key={c.champion}>
								<img src={champIcon(version, c.champion)} alt="" />
								<span>{c.champion}</span>
								<span className="wk-muted">{c.wins}W – {c.games - c.wins}L</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}

function GameOfTheWeek({ game, version }) {
	const day = new Date(game.date).toLocaleDateString(undefined, { weekday: 'long' });
	return (
		<section className="wk-card wk-game">
			<h3 className="wk-card__title">Game of the week</h3>
			<div className="wk-game__row">
				<img className="wk-game__icon" src={champIcon(version, game.champion)} alt="" />
				<div>
					<p className="wk-game__kda">{game.kills} / {game.deaths} / {game.assists}</p>
					<p className="wk-muted">{game.champion} · {day} · {Math.floor(game.duration / 60)} min</p>
				</div>
				<span className={`wk-result wk-result--${game.win ? 'win' : 'loss'}`}>{game.win ? 'Win' : 'Loss'}</span>
			</div>
			<p className="wk-game__ratio">{game.kda.toFixed(2)} KDA</p>
		</section>
	);
}

function EmptyWeek({ recap }) {
	const keepStreak = recap.isCurrentWeek && recap.weeklyStreak > 0;
	return (
		<section className="wk-hero wk-hero--empty">
			<h2 className="wk-hero__title">{recap.isCurrentWeek ? 'No games yet this week' : 'No games this week'}</h2>
			<p className="wk-hero__sub">
				{keepStreak
					? `Play one game by Sunday to keep your ${recap.weeklyStreak}-week streak going.`
					: recap.isCurrentWeek ? 'Your week fills in here as you play. New games show up within the hour.' : 'Taking a break from the Rift.'}
			</p>
		</section>
	);
}

function YearProgress({ recap }) {
	const ytd = recap.yearToDate;
	if (!ytd.games) return null;
	return (
		<section className="wk-card">
			<h3 className="wk-card__title">{recap.year} so far</h3>
			<div className="wk-year">
				<div><span className="wk-year__value">{ytd.games.toLocaleString()}</span><span className="wk-muted">games</span></div>
				<div><span className="wk-year__value">{hours(ytd.seconds)}</span><span className="wk-muted">on the Rift</span></div>
				<div><span className="wk-year__value">{recap.weeklyStreak}</span><span className="wk-muted">{recap.weeklyStreak === 1 ? 'week' : 'weeks'} in a row</span></div>
				<div><span className="wk-year__value">{recap.activeWeeks}</span><span className="wk-muted">active weeks</span></div>
			</div>
			{recap.paceHours !== null && recap.paceHours !== undefined && (
				<p className="wk-pace">On pace for about <strong>{recap.paceHours.toLocaleString()} hrs</strong> by the end of {recap.year}.</p>
			)}
		</section>
	);
}
