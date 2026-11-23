// "Since your last visit" snapshots: a player's year-to-date totals as they
// were the last time this browser looked at their weekly recap, so a return
// visit can open with what changed ("+12 games, +9 hrs").
//
// Visits closer together than SESSION_GAP count as one visit - otherwise a
// refresh would replace the snapshot and the "since last time" numbers would
// drop to zero. Per-browser only, like myPlayers.js; if storage is unavailable
// there's simply no banner.
const KEY_PREFIX = 'rw-last-visit-';
const SESSION_GAP_MS = 12 * 60 * 60 * 1000;

function key(puuid) {
	return `${KEY_PREFIX}${puuid}`;
}

/** { at, year, games, wins, seconds } from the previous visit, or null. */
export function readLastVisit(puuid) {
	try {
		const snap = JSON.parse(localStorage.getItem(key(puuid)) || 'null');
		return snap && typeof snap.at === 'number' ? snap : null;
	} catch {
		return null;
	}
}

/** Remember this visit's totals, unless the stored visit is still the current one. */
export function recordVisit(puuid, year, totals) {
	const prev = readLastVisit(puuid);
	if (prev && prev.year === year && Date.now() - prev.at < SESSION_GAP_MS) return;
	try {
		localStorage.setItem(key(puuid), JSON.stringify({ at: Date.now(), year, ...totals }));
	} catch {
		// storage unavailable - nothing to remember
	}
}

/**
 * What changed between a snapshot and the current totals, or null when there
 * is nothing worth showing (no snapshot, a new year, or no new games).
 */
export function changesSince(prev, year, totals) {
	if (!prev || prev.year !== year) return null;
	const diff = {
		games: totals.games - (prev.games ?? 0),
		wins: totals.wins - (prev.wins ?? 0),
		seconds: totals.seconds - (prev.seconds ?? 0),
		at: prev.at,
	};
	return diff.games > 0 ? diff : null;
}
