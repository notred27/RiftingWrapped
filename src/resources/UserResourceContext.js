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

export function UserResourceProvider({ puuid, year, children }) {
    const resources = useMemo(() => {
        if (!puuid) return null;
        return {
            user: createUserResource(puuid, year),
            lolVersion: wrapPromise(fetchCached('https://ddragon.leagueoflegends.com/api/versions.json', 'lol-current-version')),

            date: createResource('matchesByDate', puuid, year),
            forfeit: createResource('forfeit', puuid, year),
            damage: createResource('damage', puuid, year),
            champ: createResource('champs', puuid, year),

            cardPreview: createResource('get_card_preview', puuid, year),
            timeBreakdownStats: createResource('totalStats', puuid, year),

            role: createResource('role', puuid, year),
            cs: createResource('cs', puuid, year),
            pings: createResource('pings', puuid, year),
            objectives: createResource('objectives', puuid, year),

            mapEvents: createResource('mapEvents', puuid, year),

            highestKillGames: createResource('highestStatGames', puuid, year, '&stat=kills', '-kills'),
            highestDeathGames: createResource('highestStatGames', puuid, year, '&stat=deaths', '-deaths'),
            combatTotals: createResource('matchTotals', puuid, year),
            killFreq: createResource('killFrequency', puuid, year),
            deathFreq: createResource('deathFrequency', puuid, year),
            kda: createResource('kda', puuid, year),
        };
    }, [puuid, year]);

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