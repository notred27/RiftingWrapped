import { createContext, useContext, useMemo } from "react";

import { fetchCached } from "./fetchCached.js";
import wrapPromise from './wrapPromise.js';

const StatsResourceContext = createContext(null);

function createResource(endpoint, puuid, year, extraQuery = '', cacheKeySuffix = '') {
	const promise = fetchCached(
		`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}${extraQuery}`,
		`${endpoint}-${puuid}-${year}${cacheKeySuffix}`
	);
	return wrapPromise(promise);
}

function createUserResource(puuid, year, {
	intervalMs = 1500,
	maxAttempts = 15,
	timeoutMs = 70000
} = {}) {
	const controller = new AbortController();

	const promise = new Promise(async (resolve, reject) => {
		const start = Date.now();
		let attempts = 0;

		async function fetchUser() {
			const url = `${process.env.REACT_APP_API_ENDPOINT}/users/${encodeURIComponent(puuid)}?year=${year}&_=${Date.now()}`;
			const resp = await fetch(url, { signal: controller.signal });
			if (!resp.ok) {
				const text = await resp.text().catch(() => "");
				const err = new Error(`HTTP ${resp.status}: ${text}`);
				err.status = resp.status;
				throw err;
			}
			return resp.json();
		}

		try {
			while (true) {
				attempts += 1;

				if (Date.now() - start > timeoutMs || attempts > maxAttempts) {
					return reject(new Error("Timeout waiting for user info to be populated."));
				}

				let user;
				try {
					user = await fetchUser();
				} catch (err) {
					if (err.status === 404) {
						return reject(err);
					}
					await new Promise(res => setTimeout(res, intervalMs));
					continue;
				}

				if (user && user.icon) {
					return resolve(user);
				}

				await new Promise(res => setTimeout(res, intervalMs));
			}
		} catch (err) {
			return reject(err);
		}
	});

	promise.cancel = () => controller.abort();

	return wrapPromise(promise);
}

// Every stats endpoint the Wrapped deck reads, by resource name.
const STAT_RESOURCES = {
	date: ['matchesByDate'],
	forfeit: ['forfeit'],
	damage: ['damage'],
	champ: ['champs'],

	cardPreview: ['get_card_preview'],
	timeBreakdownStats: ['totalStats'],

	role: ['role'],
	cs: ['cs'],
	pings: ['pings'],
	objectives: ['objectives'],

	mapEvents: ['mapEvents'],

	highestKillGames: ['highestStatGames', '&stat=kills', '-kills'],
	highestDeathGames: ['highestStatGames', '&stat=deaths', '-deaths'],
	combatTotals: ['matchTotals'],
	killFreq: ['killFrequency'],
	deathFreq: ['deathFrequency'],
	kda: ['kda'],
};

/**
 * Resources are created (and fetched) on first use. The waiting page
 * (/addPlayer) shares this provider just to show the player's name and icon;
 * fetching every stats endpoint there cached a half-processed player's numbers
 * for 30 minutes, and the finished Wrapped then showed those (e.g. 11 games
 * instead of 512).
 *
 * `prefetch` starts every request immediately instead - the Wrapped deck
 * mounts only the slides near the current one, so without it each later
 * slide would wait on its own request when swiped to.
 */
export function UserResourceProvider({ puuid, year, prefetch = false, children }) {
	const resources = useMemo(() => {
		if (!puuid) return null;
		const resources = {};
		const made = {};
		const lazy = (name, create) => Object.defineProperty(resources, name, {
			enumerable: true,
			get: () => (made[name] ??= create()),
		});

		lazy('user', () => createUserResource(puuid, year));
		lazy('lolVersion', () => wrapPromise(fetchCached('https://ddragon.leagueoflegends.com/api/versions.json', 'lol-current-version')));
		for (const [name, [endpoint, extraQuery, suffix]] of Object.entries(STAT_RESOURCES)) {
			lazy(name, () => createResource(endpoint, puuid, year, extraQuery, suffix));
		}
		if (prefetch) Object.keys(resources).forEach((name) => resources[name]);
		return resources;
	}, [puuid, year, prefetch]);

	return (
		<StatsResourceContext.Provider value={resources}>
			{children}
		</StatsResourceContext.Provider>
	);
}

export function useStatsResources() {
	const ctx = useContext(StatsResourceContext);
	if (ctx === null) {
		throw new Error("useStatsResources must be used within a StatsResourceProvider");
	}
	return ctx;
}