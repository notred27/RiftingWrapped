import { Suspense } from 'react';
import ErrorBoundary from '../../components/error/ErrorBoundary.js';
import StatDisplayError from '../../components/error/StatDisplayError.js';


/**
 * The one slide template every stat slide uses, so they all share the same
 * structure, alignment and type:
 *
 *   lead      optional visual above the headline (champion splash, avatar)
 *   eyebrow   short lead-in line            "You visited the Rift during"
 *   title     the big accent headline        "348 games"
 *   subtitle  one supporting line            "on 184 different days"
 *   media     the chart / map for the slide
 *   children  supporting detail: stat tiles, match lists, notes
 *
 * On phones everything stacks (header, media, detail). From 960px, a slide with
 * `media` splits into two columns - header and detail on the left, media on
 * the right - so desktop uses the width instead of leaving it empty.
 */
export default function StatCard({ lead, eyebrow, title, subtitle, media, children, className = '' }) {
    const hasHead = lead || eyebrow || title || subtitle;
    const classes = ['slide-card', media ? 'slide-card--split' : '', className].filter(Boolean).join(' ');

    return (
        <ErrorBoundary fallback={(err) => <StatDisplayError error={err} />}>
            <Suspense fallback={<div />}>
                <section className={classes}>
                    {hasHead && (
                        <header className="slide-head">
                            {lead && <div className="slide-lead">{lead}</div>}
                            {eyebrow && <p className="slide-eyebrow">{eyebrow}</p>}
                            {title && <h1 className="slide-title">{title}</h1>}
                            {subtitle && <p className="slide-subtitle">{subtitle}</p>}
                        </header>
                    )}
                    {media && <div className="slide-media">{media}</div>}
                    {children && <div className="slide-body">{children}</div>}
                </section>
            </Suspense>
        </ErrorBoundary>
    );
}
