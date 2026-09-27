/**
 * Shown in place of a slide when the player doesn't have the data it needs
 * (e.g. no ranked games, no pings), instead of rendering NaN / undefined or
 * an error page. Uses the same markup as StatCard so it sits in the deck like
 * any other slide.
 */
export default function EmptySlide({
    eyebrow = "Not enough data yet",
    title = "Nothing to show here",
    message = "Play a few more games this year and check back - this stat fills in as your matches are processed.",
}) {
    return (
        <section className="slide-card slide-card--empty">
            <header className="slide-head">
                <p className="slide-eyebrow">{eyebrow}</p>
                <h1 className="slide-title slide-title--quiet">{title}</h1>
                <p className="slide-subtitle">{message}</p>
            </header>
        </section>
    );
}
