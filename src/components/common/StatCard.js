// import './StatCard.css';

/**
 * Generic card wrapper used for every stat section on the page.
 * Handles the outer rounded card, optional eyebrow/title text, and spacing -
 * children are whatever content goes inside (a StatHero, a StatGrid, a chart, etc).
 */
export default function StatCard({ eyebrow, title, subtitle, children, className = '' }) {
    return (
        <section className={`${className}`}>
            {eyebrow && <h2 className="subtitle">{eyebrow}</h2>}
            {title && <h1 className='emphasize-xlg'>{title}</h1>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
            {children}
        </section>
    );
}