import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function getContentGroup(pathname) {
	if (pathname.startsWith('/addPlayer/')) return 'Add Player';
	if (pathname.startsWith('/players/')) return 'Player Profile';
	return 'Other';
}

export function usePageTracking() {
	const location = useLocation();

	useEffect(() => {
		if (typeof window.gtag !== 'function') return;

		window.gtag('event', 'page_view', {
			page_path: location.pathname,
			page_location: window.location.href,
			content_group: getContentGroup(location.pathname),
		});
	}, [location]);
}