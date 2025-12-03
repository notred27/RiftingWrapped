import { createContext, useContext, useMemo } from "react";

import { fetchCached } from "./fetchCached.js";
import wrapPromise from './wrapPromise.js';

const StatsResourceContext = createContext(null);

export function UserResourceProvider({ puuid, year = "2025", children }) {

    function createResource(endpoint, puuid, year) {
        // console.log(`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}`)
        const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}`, `${endpoint}-${puuid}-${year}`);
        return wrapPromise(promise);
    }


    function createUserResource(puuid, {
        intervalMs = 1500,    // poll interval
        maxAttempts = 15,
        timeoutMs = 70000     // absolute timeout fallback
    } = {}) {
        const controller = new AbortController();

        const promise = new Promise(async (resolve, reject) => {
            const start = Date.now();
            let attempts = 0;


            async function fetchUser() {
                // timestamp to avoid caches / cached fetchCached
                const url = `${process.env.REACT_APP_API_ENDPOINT}/users/${encodeURIComponent(puuid)}?_=${Date.now()}`;
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

                    // Absolute timeout
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

                        // console.warn("fetchUser error, will retry:", err);
                        await new Promise(res => setTimeout(res, intervalMs));
                        continue;
                    }

                    // Stop trying to refresh data if user icon is found
                    if (user && user.icon) {
                        return resolve(user);
                    }

                    // Continue trying until icon is found
                    await new Promise(res => setTimeout(res, intervalMs));
                }
            } catch (err) {
                return reject(err);
            }
        });

        promise.cancel = () => controller.abort();

        return wrapPromise(promise);
    }


    const resources = useMemo(() => {
        if (!puuid) return null;
        return {
            user: createUserResource(puuid),
lolVersion: wrapPromise(fetchCached('https://ddragon.leagueoflegends.com/api/versions.json', 'lol-current-version')),

            date: createResource('matchesByDate', puuid, year),
            forfeit: createResource('forfeit', puuid, year),
            damage: createResource('damage', puuid, year),
            champ: createResource('champs', puuid, year),


            cardPreview: createResource('get_card_preview', puuid, year),
            timeBreakdownStats : createResource('totalStats', puuid, year),



            role:createResource('role', puuid, year),
            cs:createResource('cs', puuid, year),
            pings:createResource('pings', puuid, year),
            objectives:createResource('objectives', puuid, year),
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
