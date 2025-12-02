export async function fetchCached(url, key, ttl = 30 * 60 * 1000) {
    let cached = null;
    try {
        cached = JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
        // corrupted cache => drop it
        console.warn('fetchCached: bad cache for', key, e);
        localStorage.removeItem(key);
        cached = null;
    }

    const now = Date.now();

    if (cached && cached.data && typeof cached.timestamp === 'number' && (now - cached.timestamp) < ttl) {
        console.debug('fetchCached: cache HIT for', key);
        const isEmptyArray = Array.isArray(cached.data) && cached.data.length === 0;
        if (isEmptyArray) {
            localStorage.removeItem(key);
        }
        return Promise.resolve(cached.data);
    }

    console.debug('fetchCached: cache MISS for', key, 'fetching', url);

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
                localStorage.setItem(key, JSON.stringify({ data, timestamp: now }));
            } else {
                localStorage.removeItem(key);
            }
            return data;
        })
        .catch(err => {
            // bubble up error, but don't leave a rejected unobserved promise
            throw err;
        });
}
