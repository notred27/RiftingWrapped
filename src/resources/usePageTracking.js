import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackReturnVisit } from './analytics.js';

// Player IDs are replaced with a placeholder so GA groups all player pages
// together instead of creating one row per player (and doesn't store the IDs).
const DYNAMIC_ROUTES = [
	{ prefix: '/addPlayer/', group: 'Add Player', path: '/addPlayer/:puuid' },
	{ prefix: '/player/', group: 'Player Profile', path: '/player/:puuid' },
	{ prefix: '/leaderboards/', group: 'Friends Board', path: '/leaderboards/:boardId' },
];

const STATIC_GROUPS = {
	'/': 'Home',
	'/leaderboards': 'Leaderboards',
	'/faq': 'FAQ',
	'/how-it-works': 'How It Works',
	'/terms': 'Legal',
	'/privacy': 'Legal',
};

function classify(pathname) {
	// Must run before the generic /player/ prefix, which would swallow it.
	if (pathname.startsWith('/player/') && pathname.endsWith('/week')) {
		return { group: 'Weekly Recap', path: '/player/:puuid/week' };
	}
	const match = DYNAMIC_ROUTES.find((r) => pathname.startsWith(r.prefix));
	if (match) return { group: match.group, path: match.path };
	return { group: STATIC_GROUPS[pathname] ?? 'Other', path: pathname };
}

export function usePageTracking() {
	const { pathname, search } = useLocation();

	useEffect(() => { trackReturnVisit(); }, []);

	useEffect(() => {
		if (typeof window.gtag !== 'function') return;

		const { group, path } = classify(pathname);
		window.gtag('event', 'page_view', {
			page_location: `${window.location.origin}${path}${search}`,
			page_title: group,
			content_group: group,
		});
	}, [pathname, search]);
}
