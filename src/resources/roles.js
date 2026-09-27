/**
 * Single source of truth for lane/role presentation.
 *
 * These used to be copy-pasted into RoleSlide, CsSlide and RoleGraph. Three
 * copies of the same colour map can silently drift apart, so anything that
 * renders a role should import from here.
 */

// Validated as a set (colour-blind separation + contrast on the dark
// background) for the donut's fixed lane order below, including the
// Support -> Top wrap-around. Change them together, not one at a time.
export const ROLE_COLORS = {
	Top: '#c98500',
	Jungle: '#3987e5',
	Mid: '#d95926',
	ADC: '#199e70',
	Support: '#9085e9',
};

/** Fixed order for anything that draws roles next to each other (the donut). */
export const ROLE_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

/** Colour used for a role the player never queued for. */
export const ROLE_COLOR_UNPLAYED = '#4a515c';

const ROLE_LABELS = ['Top', 'Mid', 'Jungle', 'ADC', 'Support'];

/**
 * Turn the API's per-role rows into a fixed set of five roles, ordered by games
 * played. Roles the player never touched come back with games: 0 rather than
 * being missing, so callers can render them as an explicit "0 games" row.
 */
export function filterByRole(arr = []) {
	// Filter games by role, should move to backend
	const roleDicts = {
		"TOP": { wins: 0, games: 0 },
		"MIDDLE": { wins: 0, games: 0 },
		"JUNGLE": { wins: 0, games: 0 },
		"BOTTOM": { wins: 0, games: 0 },
		"UTILITY": { wins: 0, games: 0 },
	};

	// Filter out empty _id
	const filtered = arr.filter(item => item._id !== "");

	filtered.forEach(role => {
		const key = role._id;
		if (roleDicts[key]) {
			roleDicts[key].games = role.count;
			roleDicts[key].wins = role.winsInRole;
		}
	});

	return Object.keys(roleDicts).map((key, idx) => {
		const winRate = roleDicts[key].games > 0
			? Math.round(roleDicts[key].wins / roleDicts[key].games * 100)
			: 0;

		return {
			label: ROLE_LABELS[idx],
			...roleDicts[key],
			winRate
		};
	}).sort((a, b) => b.games - a.games);
}
