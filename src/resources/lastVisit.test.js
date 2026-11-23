import { changesSince, readLastVisit, recordVisit } from './lastVisit.js';
import { weeklyAwards } from '../pages/Weekly/weeklyAwards.js';

const totals = { games: 100, wins: 55, seconds: 180000 };

beforeEach(() => localStorage.clear());

test('records a visit and keeps it through refreshes in the same session', () => {
	recordVisit('p1', 2026, totals);
	const first = readLastVisit('p1');
	recordVisit('p1', 2026, { ...totals, games: 105 });
	expect(readLastVisit('p1')).toEqual(first);
});

test('replaces a visit once the session gap has passed', () => {
	localStorage.setItem('rw-last-visit-p1', JSON.stringify({ at: Date.now() - 13 * 3600e3, year: 2026, ...totals }));
	recordVisit('p1', 2026, { ...totals, games: 105 });
	expect(readLastVisit('p1').games).toBe(105);
});

test('changesSince reports new games and ignores empty or cross-year changes', () => {
	const prev = { at: 1, year: 2026, ...totals };
	expect(changesSince(prev, 2026, { ...totals, games: 112, wins: 61 })).toMatchObject({ games: 12, wins: 6 });
	expect(changesSince(prev, 2026, totals)).toBeNull();
	expect(changesSince(prev, 2027, { ...totals, games: 3 })).toBeNull();
	expect(changesSince(null, 2026, totals)).toBeNull();
});

test('weeklyAwards picks out standout weeks', () => {
	const recap = {
		bestWeekGames: 10,
		thisWeek: {
			games: 12, wins: 9, longestWinStreak: 4, uniqueChamps: 2, longestGameSeconds: 1800,
			topChamps: [{ champion: 'Ahri', games: 10, wins: 8 }],
			bestGame: { champion: 'Ahri', kills: 20, deaths: 1, assists: 6 },   // not deathless, but another game was
			deathlessGames: 1,
			mostKillsGame: { kills: 8 },
		},
	};
	const ids = weeklyAwards(recap).map((a) => a.id);
	expect(ids).toEqual(['pb-week', 'win-streak', 'deathless', 'one-trick', 'winning']);
	expect(weeklyAwards({ thisWeek: { games: 0 } })).toEqual([]);
});
