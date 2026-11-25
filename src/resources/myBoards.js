// Friends boards this browser has joined or created, newest first, so the
// leaderboards page can list them. Per-browser only (there are no accounts):
// boards aren't looked up by player because a board's id is its invite link.
const KEY = 'rw-my-boards';
const MAX = 20;

export function myBoards() {
	try {
		const list = JSON.parse(localStorage.getItem(KEY) || '[]');
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

/** Save or refresh a board, with a few member names to label it by. */
export function rememberBoard(id, members) {
	if (!id) return;
	const entry = { id, names: members.slice(0, 3).map((m) => m.displayName), count: members.length };
	try {
		const list = [entry, ...myBoards().filter((b) => b.id !== id)].slice(0, MAX);
		localStorage.setItem(KEY, JSON.stringify(list));
	} catch {
		// storage unavailable - nothing to remember
	}
}
