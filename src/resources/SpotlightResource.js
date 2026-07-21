import { fetchCached } from "./fetchCached.js";
import wrapPromise from './wrapPromise.js';

let cachedResource = null;
let cachedForCount = null;

export function createSpotlightResource(count = 8) {
    if (cachedResource && cachedForCount === count) {
        return cachedResource;
    }

    const promise = fetchCached(
        `${process.env.REACT_APP_API_ENDPOINT}/users/spotlight?year=${process.env.REACT_APP_WRAP_YEAR}&count=${count}`,
        `spotlight-${count}`
    );

    cachedResource = wrapPromise(promise);
    cachedForCount = count;
    return cachedResource;
}