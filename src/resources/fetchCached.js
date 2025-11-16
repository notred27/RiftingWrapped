export async function fetchCached(url, key, ttl = 30 * 60 * 1000) { // 30 min TTL
const cached = JSON.parse(localStorage.getItem(key) || '{}');
  const now = Date.now();
  
  if (cached.data && now - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then((data) => {
      // do not cache empty data
      if(data.length !== 0) {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: now }));

      } else {
        // extra sanity check
        localStorage.removeItem(key);
      }

      return data;
    });
}