import { useState, useRef, useCallback, useEffect, Children, Suspense } from 'react';
import ProgressBar from './ProgressBar.js';
import ErrorBoundary from '../error/ErrorBoundary.js';
import StatDisplayError from '../error/StatDisplayError.js';
import { trackEvent } from '../../resources/analytics.js';
import './SlideDeck.css';

// Fraction of the deck's width, on each side, that counts as a "tap to navigate" zone.
const TAP_ZONE_FRACTION = 0.3;
// Movement under this is a tap; anything more is a drag (scroll or swipe).
const TAP_SLOP = 10;
// Scroll-like deceleration used to project where a flick would come to rest.
const DECELERATION = 0.998;
// Initial slope of the track's ease-out curve, cubic-bezier(0.22, 1, ...): the
// release animation starts at (slope * distance / duration), so solving for the
// duration lets it begin at exactly the finger's speed.
const EASE_OUT_SLOPE = 1 / 0.22;

// Apple's momentum projection: distance (px) a flick at v px/s travels before stopping.
export const project = (v) => (v / 1000) * DECELERATION / (1 - DECELERATION);

// Past an edge the track follows less and less the further you pull.
export const rubberband = (overshoot, dimension, c = 0.55) =>
    (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));

// Slide a release lands on: nearest to the projected endpoint, at most one away
// from where the drag started, and inside the deck.
export const pickTarget = (offsetPx, velocity, width, startIndex, lastIndex) => {
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const nearest = Math.round(-(offsetPx + project(velocity)) / width);
    return clamp(clamp(nearest, startIndex - 1, startIndex + 1), 0, lastIndex);
};
// How many slides either side of the current one stay mounted. 1 keeps the next
// slide warm so it has already loaded by the time you swipe to it.
const PRELOAD_RADIUS = 1;

export default function SlideDeck({ children, renderFallback }) {
    const slides = Children.toArray(children);
    const [index, setIndex] = useState(0);
    const drag = useRef(null);
    const draggedRef = useRef(false);
    const trackRef = useRef(null);
    const indexRef = useRef(index);
    indexRef.current = index;

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

    // Touch drags move the track 1:1 with the finger. A touch landing mid-animation
    // grabs the track where it is on screen (its live transform), not where it
    // was heading, so a slide change can be caught and reversed.
    const onTouchStart = (e) => {
        const track = trackRef.current;
        const t = e.touches[0];
        const live = new DOMMatrix(getComputedStyle(track).transform).m41;
        track.style.transition = 'none';
        track.style.transform = `translateX(${live}px)`;
        drag.current = {
            x: t.clientX,
            y: t.clientY,
            base: live,
            offset: live,
            width: track.offsetWidth,
            startIndex: indexRef.current,
            axis: null,
            history: [{ x: t.clientX, t: e.timeStamp }],
        };
        draggedRef.current = false;
    };

    const onTouchMove = (e) => {
        const d = drag.current;
        if (!d) return;
        const t = e.touches[0];
        const dx = t.clientX - d.x;
        const dy = t.clientY - d.y;

        // Lock to one axis once past the slop. Vertical-dominant movement is the
        // user scrolling the slide, so the track stays put.
        if (!d.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= TAP_SLOP) {
            d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (d.axis !== 'x') return;

        const min = -lastIndex * d.width;
        let offset = d.base + dx;
        if (offset > 0) offset = rubberband(offset, d.width);
        else if (offset < min) offset = min + rubberband(offset - min, d.width);
        d.offset = offset;
        trackRef.current.style.transform = `translateX(${offset}px)`;

        d.history.push({ x: t.clientX, t: e.timeStamp });
        if (d.history.length > 5) d.history.shift();
    };

    const onTouchEnd = (e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        const track = trackRef.current;

        // Any movement past the slop was a drag (swipe or scroll), so swallow the
        // synthetic click; a real tap goes through to onClick's edge zones.
        if (d.axis) draggedRef.current = true;

        let target = d.startIndex;
        let duration = '';
        if (d.axis === 'x') {
            const first = d.history[0];
            const last = d.history[d.history.length - 1];
            const dt = last.t - first.t;
            const velocity = dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
            target = pickTarget(d.offset, velocity, d.width, d.startIndex, lastIndex);

            // Start the settle at the finger's speed so there's no seam between
            // dragging and animating.
            const remaining = Math.abs(-target * d.width - d.offset);
            if (Math.abs(velocity) > 1 && remaining > 0) {
                const s = (EASE_OUT_SLOPE * remaining) / Math.abs(velocity);
                duration = `${Math.min(0.5, Math.max(0.2, s))}s`;
            }
        }

        // Hand the track back to CSS: set the destination explicitly (React only
        // rewrites the style when index changes) and let the transition run from
        // wherever the finger left it.
        track.style.transition = '';
        track.style.transitionDuration = duration;
        track.style.transform = `translateX(-${target * 100}%)`;
        setIndex(target);
    };


    // Which slide people reach tells us where they drop off.
    useEffect(() => {
        trackEvent('slide_view', {
            slide_index: index,
            slide_total: slides.length,
            is_last: index === lastIndex,
        });
    }, [index, slides.length, lastIndex]);

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
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
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
                ref={trackRef}
                // A flick's speed-matched duration is for that one settle only.
                onTransitionEnd={(e) => { if (e.target === e.currentTarget) e.currentTarget.style.transitionDuration = ''; }}
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
