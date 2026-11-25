import { trackEvent } from './analytics';

/**
 * Look a Riot ID up, registering it first if it isn't tracked yet (or failed
 * before; the API restarts its processing). Resolves to the player
 * ({puuid, status, ...}); rejects with an Error whose message is ready to show.
 * `onRegistering` is called before the (slow) registration request.
 */
export async function findOrRegisterPlayer(displayName, tag, region, onRegistering) {
    const apiUrl = process.env.REACT_APP_API_ENDPOINT;
    const lookupUrl = `${apiUrl}/users/by-riot-id/${encodeURIComponent(displayName)}/${encodeURIComponent(tag)}/${region}`;
    let response = await fetch(lookupUrl);
    const found = response.ok ? await response.clone().json() : null;

    if (response.status === 404 || found?.status === 'failed') {
        trackEvent('register_start', { region });
        onRegistering?.();

        const addResponse = await fetch(`${apiUrl}/users`, {
            method: "POST",
            body: new URLSearchParams({ displayName, tag, region }),
        });
        const addBody = await addResponse.json().catch(() => null);

        if (!addResponse.ok && addResponse.status !== 409) {
            trackEvent('register_fail', { region, status: addResponse.status });
            throw new Error(addBody?.message || "Failed to find user. Please check that your name and region are correct.");
        }

        response = await fetch(lookupUrl);
    }

    if (!response.ok) throw new Error("User could not be fetched after creation.");

    const player = await response.json();
    if (!player.puuid) throw new Error("Registration didn't complete successfully. Please try again.");
    return player;
}

/** "Name#Tag" -> [name, tag], or null if it isn't in that shape. */
export function parseRiotId(value) {
    const parts = (value || '').split('#').map((n) => n.trim());
    return parts.length === 2 && parts[0] && parts[1] ? parts : null;
}
