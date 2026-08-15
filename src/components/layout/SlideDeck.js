import { useState, useRef, useCallback, useEffect, Children, Suspense } from 'react';
import ProgressBar from './ProgressBar.js';
import ErrorBoundary from '../error/ErrorBoundary.js';
import StatDisplayError from '../error/StatDisplayError.js';
import './SlideDeck.css';

// Fraction of the deck's width, on each side, that counts as a "tap to navigate" zone.
const TAP_ZONE_FRACTION = 0.3;
const SWIPE_THRESHOLD = 50;
// Movement under this is a tap; anything more is a drag (scroll or swipe).
const TAP_SLOP = 10;
// How many slides either side of the current one stay mounted. 1 keeps the next
// slide warm so it has already loaded by the time you swipe to it.
const PRELOAD_RADIUS = 1;

export default function SlideDeck({ children, renderFallback }) {
    const slides = Children.toArray(children);
    const [index, setIndex] = useState(0);
    const touchStart = useRef(null);
    const draggedRef = useRef(false);

    const lastIndex = slides.length - 1;

    // Functional updates rather than reading `index` from the closure: two key
    // presses (or a tap and a swipe) inside the same render both computed from
    // the same stale index, so rapid input only advanced one slide.
    const next = useCallback(() => setIndex(i => Math.min(lastIndex, i + 1)), [lastIndex]);
    const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);

    // Click-to-navigate for mouse users. There's no covering overlay button for this
    // (an absolutely-positioned overlay would sit in its own stacking context above
    // .slide-track's transformed content and swallow clicks meant for real controls
    // like the champion grid's arrows) - instead this fires on .slide-deck itself via
    // normal bubbling, so any interactive element inside a slide can call
    // stopPropagation() to opt out and handle its own click.
    const onClick = (e) => {
        // A touch that turned out to be a drag still emits a synthetic click on
        // release; ignore that one so scrolling never lands on a navigation.
        if (draggedRef.current) {
            draggedRef.current = false;
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = (e.clientX - rect.left) / rect.width;
        if (fraction <= TAP_ZONE_FRACTION) {
            prev();
        } else if (fraction >= 1 - TAP_ZONE_FRACTION) {
            next();
        }
    };

    const onTouchStart = (e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
        draggedRef.current = false;
    };

    const onTouchEnd = (e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;

        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;

        // Barely moved: a real tap. Let it through to onClick, which decides
        // whether it landed in an edge zone.
        if (Math.abs(dx) < TAP_SLOP && Math.abs(dy) < TAP_SLOP) return;

        draggedRef.current = true;

        // Vertical-dominant movement is the user scrolling, not swiping. Bail out
        // rather than navigating - this is what used to make an up/down scroll near
        // either edge jump to the next slide, since a vertical drag falls under the
        // horizontal swipe threshold and used to be treated as an edge tap.
        if (Math.abs(dy) >= Math.abs(dx)) return;

        if (dx <= -SWIPE_THRESHOLD) {
            next();
        } else if (dx >= SWIPE_THRESHOLD) {
            prev();
        }
    };


    useEffect(() => {
        const handler = (e) => {
            // Don't hijack arrow keys while someone is typing or using a control.
            const el = document.activeElement;
            const tag = el?.tagName;
            if (el?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [next, prev]);

    const stop = (e) => e.stopPropagation();

    return (
        <div
            className="slide-deck"
            onClick={onClick}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="group"
            aria-roledescription="carousel"
            aria-label="Your Rifting Wrapped"
        >
            <ProgressBar total={slides.length} current={index} />

            {/* Real controls for keyboard and screen-reader users. They're visually
                hidden until focused so they neither take layout space on mobile nor
                overlap in-slide controls (the champion grid's arrows sit in the same
                spot), while still being reachable by Tab. */}
            <button
                type="button"
                className="slide-nav slide-nav--prev"
                onClick={(e) => { stop(e); prev(); }}
                disabled={index === 0}
                aria-label="Previous slide"
            >
                ‹
            </button>
            <button
                type="button"
                className="slide-nav slide-nav--next"
                onClick={(e) => { stop(e); next(); }}
                disabled={index === lastIndex}
                aria-label="Next slide"
            >
                ›
            </button>

            <div
                className="slide-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {slides.map((slide, i) => {
                    const isCurrent = i === index;
                    // Only mount slides near the current one. Every slide reads its own
                    // Suspense resources, so mounting all sixteen meant building sixteen
                    // slides' worth of charts and canvases before the first one appeared.
                    const isMounted = Math.abs(i - index) <= PRELOAD_RADIUS;

                    return (
                        <div
                            className="slide"
                            key={i}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${slides.length}`}
                            aria-hidden={!isCurrent}
                        >
                            {isMounted && (
                                // Per-slide boundaries: without these a single slow
                                // endpoint suspends the whole deck, and a single failing
                                // one replaces the entire wrap with an error page.
                                <ErrorBoundary fallback={(err) => <StatDisplayError error={err} />}>
                                    <Suspense fallback={renderFallback ? renderFallback() : <div />}>
                                        {slide}
                                    </Suspense>
                                </ErrorBoundary>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="sr-only" role="status" aria-live="polite">
                Slide {index + 1} of {slides.length}
            </p>
        </div>
    );
}
