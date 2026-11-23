// Small badges for the week, worked out from the /weekly payload. Each is
// { id, title, detail }. Kept separate from the page so they're easy to add to
// and to test.

const MIN_GAMES_FOR_SHARE = 5;

export function weeklyAwards(recap) {
	const w = recap?.thisWeek;
	if (!w || !w.games) return [];
	const awards = [];

	if (recap.bestWeekGames > 0 && w.games > recap.bestWeekGames) {
		awards.push({ id: 'pb-week', title: 'Busiest week of the year', detail: `${w.games} games beats your previous best of ${recap.bestWeekGames}` });
	}
	if (w.longestWinStreak >= 3) {
		awards.push({ id: 'win-streak', title: 'On a heater', detail: `${w.longestWinStreak} wins in a row` });
	}
	if (w.deathlessGames > 0) {
		awards.push({ id: 'deathless', title: 'Untouchable', detail: w.deathlessGames === 1 ? 'a game with zero deaths' : `${w.deathlessGames} games with zero deaths` });
	}
	if (w.mostKillsGame && w.mostKillsGame.kills >= 15) {
		awards.push({ id: 'kills', title: 'Bloodthirsty', detail: `${w.mostKillsGame.kills} kills in one game` });
	}
	const top = w.topChamps?.[0];
	if (top && w.games >= MIN_GAMES_FOR_SHARE && top.games / w.games >= 0.7) {
		awards.push({ id: 'one-trick', title: 'One-trick week', detail: `${top.games} of ${w.games} games on ${top.champion}` });
	}
	if (w.uniqueChamps >= 6) {
		awards.push({ id: 'explorer', title: 'Champion explorer', detail: `${w.uniqueChamps} different champions` });
	}
	if (w.longestGameSeconds >= 45 * 60) {
		awards.push({ id: 'marathon', title: 'Marathon', detail: `a ${Math.floor(w.longestGameSeconds / 60)}-minute game` });
	}
	if (w.games >= MIN_GAMES_FOR_SHARE && w.wins / w.games >= 0.65) {
		awards.push({ id: 'winning', title: 'Climbing', detail: `${Math.round((w.wins / w.games) * 100)}% win rate` });
	}
	return awards;
}
