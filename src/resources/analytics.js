// Thin wrapper around gtag so call sites don't each need to guard for it being
// blocked (ad blockers) or not yet loaded.
export function trackEvent(name, params = {}) {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
	window.gtag('event', name, params);
}
