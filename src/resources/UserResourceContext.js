import { createContext, useContext, useMemo } from "react";

import { fetchCached } from "./fetchCached.js";
import wrapPromise from './wrapPromise.js';

const StatsResourceContext = createContext(null);

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
 * The deck needs seventeen stat payloads. /summary answers all of them in one
 * response, so a viewer makes one request instead of seventeen - this matters
 * most for shared links, where every new visitor pays the full set.
 *
 * The request is started at most once per provider, and each resource below
 * reads its own slice of it.
 */
function createSummaryLoader(puuid, year) {
	let promise = null;
	return () => (promise ??= fetchCached(
		`${process.env.REACT_APP_API_ENDPOINT}/summary/${puuid}?year=${year}`,
		`summary-${puuid}-${year}`
	).then(
		(data) => ({ ok: true, data }),
		(error) => ({ ok: false, error })
	));
}

async function readSummaryPart(loadSummary, name, { endpoint, extraQuery = '', suffix = '', puuid, year }) {
	const result = await loadSummary();

	if (result.ok) {
		const part = result.data?.[name];
		if (part && part.__error__) {
			// A stat this player has no data for. Carry the status the individual
			// endpoint would have returned so the slide renders the same empty
			// state rather than an error.
			const err = new Error(part.__error__.message || 'No data available for this stat');
			err.status = part.__error__.status;
			throw err;
		}
		if (part !== undefined) return part;
	}

	// API predates /summary (or didn't include this key): fall back to the
	// single endpoint so the frontend and API can deploy in either order.
	return fetchCached(
		`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}${extraQuery}`,
		`${endpoint}-${puuid}-${year}${suffix}`
	);
}

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
		const loadSummary = createSummaryLoader(puuid, year);
		for (const [name, [endpoint, extraQuery, suffix]] of Object.entries(STAT_RESOURCES)) {
			lazy(name, () => wrapPromise(
				readSummaryPart(loadSummary, name, { endpoint, extraQuery, suffix, puuid, year })
			));
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