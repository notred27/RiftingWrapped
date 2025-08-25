import wrapPromise from "./wrapPromise";
import { fetchCached } from "./fetchCached";

export function createUserResource(puuid) {
    const key = `user-${puuid}`;
    const userPromise = fetchCached(
    `${process.env.REACT_APP_API_ENDPOINT}/get_user/${puuid}`, key);
    return wrapPromise(userPromise);
}
