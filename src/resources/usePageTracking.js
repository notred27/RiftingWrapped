import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Player IDs are replaced with a placeholder so GA groups all player pages
// together instead of creating one row per player (and doesn't store the IDs).
const DYNAMIC_ROUTES = [
	{ prefix: '/addPlayer/', group: 'Add Player', path: '/addPlayer/:puuid' },
	{ prefix: '/player/', group: 'Player Profile', path: '/player/:puuid' },
];

const STATIC_GROUPS = {
	'/': 'Home',
	'/faq': 'FAQ',
	'/terms': 'Legal',
	'/privacy': 'Legal',
};

function classify(pathname) {
	const match = DYNAMIC_ROUTES.find((r) => pathname.startsWith(r.prefix));
	if (match) return { group: match.group, path: match.path };
	return { group: STATIC_GROUPS[pathname] ?? 'Other', path: pathname };
}

export function usePageTracking() {
	const { pathname, search } = useLocation();

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
