// Players this browser searched for itself, so a Wrapped page can tell its
// owner (who gets the share options) from a friend who followed a shared link
// (who gets a "make your own" prompt). Per-browser only; storage can be
// unavailable (private mode), in which case everyone counts as a visitor.
const KEY = 'rw-my-players';
const MAX = 20;

function read() {
	try {
		const list = JSON.parse(localStorage.getItem(KEY) || '[]');
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

export function rememberMyPlayer(puuid) {
	if (!puuid) return;
	try {
		const list = [puuid, ...read().filter((p) => p !== puuid)].slice(0, MAX);
		localStorage.setItem(KEY, JSON.stringify(list));
	} catch {
		// storage unavailable - nothing to remember
	}
}

export function isMyPlayer(puuid) {
	return read().includes(puuid);
}
