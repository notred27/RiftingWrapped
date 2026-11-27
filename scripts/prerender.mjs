// Snapshots the main pages after `react-scripts build` so search engines get
// real HTML without running JavaScript. Each page is saved to
// build/prerender/<name>.html; build/index.html stays the empty app shell,
// because Amplify serves it for every other route (player pages etc.) and a
// home-page snapshot there would give them the home page's canonical link.
// Amplify rewrites ("/faq" -> "/prerender/faq.html", ...) put these live.
//
// Runs as `postbuild`; a failure (e.g. no Chrome on the build image) only
// skips pre-rendering, it never fails the deploy.
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const BUILD = fileURLToPath(new URL('../build/', import.meta.url));
const PAGES = {
    home: '/',
    leaderboards: '/leaderboards',
    faq: '/faq',
    'how-it-works': '/how-it-works',
    privacy: '/privacy',
    terms: '/terms',
};
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };
// Analytics would count the build as a visit.
const BLOCKED = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com/;

async function main() {
    const shell = await readFile(join(BUILD, 'index.html'));
    const server = createServer(async (req, res) => {
        const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
        try {
            const body = await readFile(join(BUILD, path));
            res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' }).end(body);
        } catch {
            res.writeHead(200, { 'Content-Type': 'text/html' }).end(shell);   // SPA fallback, like Amplify
        }
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const origin = `http://127.0.0.1:${server.address().port}`;

    let browser;
    try {
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        await mkdir(join(BUILD, 'prerender'), { recursive: true });
        for (const [name, route] of Object.entries(PAGES)) {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (r) => (BLOCKED.test(r.url()) ? r.abort() : r.continue()));
            await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 60000 });
            const html = '<!DOCTYPE html>' + await page.evaluate(() => document.documentElement.outerHTML);
            await writeFile(join(BUILD, 'prerender', `${name}.html`), html.replaceAll(origin, ''));
            console.log(`prerendered ${route} -> build/prerender/${name}.html`);
            await page.close();
        }
    } finally {
        await browser?.close();
        server.close();
    }
}

// The Amplify rewrites point at these files, so they must exist even when
// snapshotting fails: fall back to the plain app shell, as before pre-rendering.
async function writeShellFallbacks() {
    const shell = await readFile(join(BUILD, 'index.html'));
    await mkdir(join(BUILD, 'prerender'), { recursive: true });
    for (const name of Object.keys(PAGES)) {
        await writeFile(join(BUILD, 'prerender', `${name}.html`), shell, { flag: 'wx' }).catch(() => {});  // keep snapshots
    }
}

main()
    .catch((err) => console.warn(`Pre-rendering skipped: ${err.message}`))
    .finally(writeShellFallbacks);
