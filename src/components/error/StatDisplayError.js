import EmptySlide from '../layout/EmptySlide.js';

/**
 * Per-slide error fallback. The API answers 404/422 when a player simply has no
 * data for a stat, which is an empty state rather than a server fault, so only
 * genuine failures get the "couldn't load" copy.
 */
export default function StatDisplayError({ error }) {
    const message = error?.message || "";
    const status = error?.status ?? (message.match(/\b(4\d\d|5\d\d)\b/) || [])[1];
    const isEmpty = String(status) === "404" || String(status) === "422" || /empty|no data/i.test(message);

    if (isEmpty) {
        return <EmptySlide />;
    }

    return (
        <EmptySlide
            eyebrow="Something went wrong"
            title="We couldn't load this stat"
            message="Try refreshing the page in a moment. The rest of your Wrapped should still work."
        />
    );
}
