export async function fetchCached(url, key, ttl = 30 * 60 * 1000) {
	let cached = null;
	try {
		cached = JSON.parse(localStorage.getItem(key) || 'null');
	} catch (e) {
		// corrupted cache or storage unavailable: drop it
		console.warn('fetchCached: bad cache for', key, e);
		forget(key);
		cached = null;
	}

	const now = Date.now();

	if (cached && cached.data && typeof cached.timestamp === 'number' && (now - cached.timestamp) < ttl) {
		console.debug('fetchCached: cache HIT for', key);
		const isEmptyArray = Array.isArray(cached.data) && cached.data.length === 0;
		if (isEmptyArray) {
			forget(key);
		}
		return Promise.resolve(cached.data);
	}

	// Start the fetch immediately and return the promise
	return fetch(url)
		.then((res) => {
			if (!res.ok) {
				const err = new Error(`HTTP ${res.status}`);
				err.status = res.status;
				throw err;
			}
			return res.json();
		})
		.then((data) => {
			// ensure data is cacheable (arrays/objects)
			const isNonEmptyArray = Array.isArray(data) && data.length > 0;
			const isObject = data && typeof data === 'object' && !Array.isArray(data);
			if (isNonEmptyArray || isObject) {
				try {
					localStorage.setItem(key, JSON.stringify({ data, timestamp: now }));
				} catch {
					// storage full or blocked: the data is still good, just not cached
				}
			} else {
				forget(key);
			}
			return data;
		});
}

function forget(key) {
	try {
		localStorage.removeItem(key);
	} catch {
		// storage unavailable - nothing to remove
	}
}

/**
 * Drop every cached response whose key mentions `fragment` (e.g. a puuid).
 * Used when a player's Wrapped finishes processing, so numbers cached while
 * it was still in progress aren't shown as their final stats.
 */
export function clearCached(fragment) {
	try {
		for (const key of Object.keys(localStorage)) {
			if (key.includes(fragment)) localStorage.removeItem(key);
		}
	} catch {
		// storage unavailable (private mode etc.) - nothing cached to clear
	}
}
