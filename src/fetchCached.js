export async function fetchCached(url, key, ttl = 5 * 60 * 1000) { // 5 min TTL
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
      localStorage.setItem(key, JSON.stringify({ data, timestamp: now }));
      return data;
    });
}