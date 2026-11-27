// Runs as `prebuild`: bakes the current player count into the bundle as
// REACT_APP_USER_COUNT so the home page's first paint (and the prerendered
// HTML before its fetch lands) shows a recent number. Never fails the build.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../.env.production.local', import.meta.url);

async function main() {
    let api = process.env.REACT_APP_API_ENDPOINT;
    if (!api) {
        const env = await readFile(new URL('../.env', import.meta.url), 'utf8').catch(() => '');
        api = env.match(/^REACT_APP_API_ENDPOINT=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
    }
    if (!api) throw new Error('REACT_APP_API_ENDPOINT not set');

    const res = await fetch(`${api}/users/count`, { signal: AbortSignal.timeout(10000) });
    const { count } = await res.json();
    if (!Number.isInteger(count) || count <= 0) throw new Error(`bad count: ${count}`);

    // Keep any other lines someone put in this file.
    const old = await readFile(OUT, 'utf8').catch(() => '');
    const kept = old.split('\n').filter((l) => l && !l.startsWith('REACT_APP_USER_COUNT='));
    await writeFile(OUT, [...kept, `REACT_APP_USER_COUNT=${count}`].join('\n') + '\n');
    console.log(`user-count: baked in ${count}`);
}

main().catch((err) => console.warn('user-count: skipped,', err.message));
