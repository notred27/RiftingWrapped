// Thin wrapper around gtag so call sites don't each need to guard for it being
// blocked (ad blockers) or not yet loaded.
export function trackEvent(name, params = {}) {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
	window.gtag('event', name, params);
}

const LAST_SEEN_KEY = 'rw-last-seen';
const SESSION_GAP_MS = 12 * 60 * 60 * 1000;    // same visit window as lastVisit.js

/** Once per page load: report a return visit and how long the browser was away. */
export function trackReturnVisit(now = Date.now()) {
	let prev = null;
	try {
		prev = Number(localStorage.getItem(LAST_SEEN_KEY)) || null;
		localStorage.setItem(LAST_SEEN_KEY, String(now));
	} catch {
		return;     // storage unavailable - can't tell new from returning
	}
	if (prev && now - prev >= SESSION_GAP_MS) {
		trackEvent('return_visit', { days_since_last: Math.floor((now - prev) / 86400000) });
	}
}
