import wrapPromise from './wrapPromise.js';
import { fetchCached } from "./fetchCached.js";


export function createGenericResource(endpoint, puuid, year) {
    const promise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/${endpoint}/${puuid}?year=${year}`, `${endpoint}-${puuid}-${year}`);
    return wrapPromise(promise);
}

export function createUserResource(puuid) {
    const key = `user-${puuid}`;
    const userPromise = fetchCached(`${process.env.REACT_APP_API_ENDPOINT}/get_user/${puuid}`, key);
    return wrapPromise(userPromise);
}