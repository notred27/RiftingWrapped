/**
 * Design tokens for code that can't use CSS variables directly (canvas charts,
 * d3). Values are read from the :root tokens in public/index.html so there is a
 * single source of truth; the fallbacks only matter in tests / SSR.
 */
function cssVar(name, fallback) {
	if (typeof window === 'undefined' || !window.getComputedStyle) return fallback;
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
}

export const theme = {
	get text() { return cssVar('--text-color', '#FFFFFF'); },
	get textMuted() { return cssVar('--text-muted-color', '#9DA3A6'); },
	get surface() { return cssVar('--second-bg-color', '#141a21'); },
	get surface2() { return cssVar('--surface-2', '#1c232c'); },
	get bg() { return cssVar('--bg-color', '#0a0e14'); },
	get accent() { return cssVar('--accent-color', '#c52184'); },
	get accentText() { return cssVar('--accent-text', '#e0428f'); },
	get muted() { return cssVar('--chart-muted', '#4a515c'); },
	get grid() { return cssVar('--chart-grid', 'rgba(255, 255, 255, 0.07)'); },
	get axis() { return cssVar('--chart-axis', '#9DA3A6'); },
	get kills() { return cssVar('--chart-kills', '#d95926'); },
	get deaths() { return cssVar('--chart-deaths', '#3987e5'); },
	get physical() { return cssVar('--chart-2', '#d95926'); },
	get magic() { return cssVar('--chart-violet', '#9085e9'); },
	get trueDmg() { return cssVar('--chart-3', '#199e70'); },
	get fontBody() { return cssVar('--font-body', 'Inter, system-ui, sans-serif'); },
};

/** Highlight-the-top-one colouring used by every single-series bar chart. */
export function highlightColors(values) {
	const max = Math.max(...values);
	let used = false;
	return values.map((v) => {
		if (!used && v === max) {
			used = true;
			return theme.accent;
		}
		return theme.muted;
	});
}

/** "1 game" / "3 games" - count formatted with its unit pluralised. */
export function plural(count, singular, pluralForm = `${singular}s`) {
	return `${Number(count).toLocaleString()} ${count === 1 ? singular : pluralForm}`;
}
