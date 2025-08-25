import wrapPromise from './wrapPromise.js';
import { fetchCached } from "./fetchCached";


export function createDateStatsResource(puuid, year) {
    const key = `date-${puuid}`;
    const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/matchesByDate/${puuid}?year=${year}`, key);
    return wrapPromise(promise);
}

export function createForfeitResource(puuid, year) {
    const key = `ff-${puuid}`;
    const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/forfeit/${puuid}?year=${year}`, key);
    return wrapPromise(promise);
}

export function createDamageResource(puuid, year) {
    const key = `damage-${puuid}`;
    const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/damage/${puuid}?year=${year}`, key);
    return wrapPromise(promise);
}

// export function createChampsResource(puuid, year) {
//     if (champCache.resource) return champCache.resource;

//     const resource = wrapPromise(
//         (async () => {
//             const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
//             const versions = await versionRes.json();
//             const latestVersion = versions[0];

//             const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
//             const champJson = await champRes.json();

//             const champList = Object.values(champJson.data).map(champ => ({
//                 id: champ.id,
//                 name: champ.name
//             }));

//             return {
//                 latestVersion,
//                 champList,
//                 champCount: champList.length
//             };
//         })()
//     );

//     champCache.resource = resource;
//     return resource;
// }

// export function createYourChampsResource(puuid, year) {
//     const promise = fetch(`${process.env.REACT_APP_API_ENDPOINT}/champs/${puuid}?year=${year}`)
//         .then(res => res.json());
//     return wrapPromise(promise);
// }
