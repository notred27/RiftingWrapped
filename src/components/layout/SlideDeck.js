import { useState, useRef, useCallback, useEffect, Children } from 'react';
import ProgressBar from './ProgressBar.js';
import './SlideDeck.css';

// Fraction of the deck's width, on each side, that counts as a "tap to navigate" zone.
const TAP_ZONE_FRACTION = 0.3;
const SWIPE_THRESHOLD = 50;

export default function SlideDeck({ children }) {
    const slides = Children.toArray(children);
    const [index, setIndex] = useState(0);
    const touchStartX = useRef(null);

    const goTo = useCallback((i) => {
        setIndex(Math.max(0, Math.min(slides.length - 1, i)));
    }, [slides.length]);

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    // Click-to-navigate for mouse users. There's no covering overlay button for this
    // (an absolutely-positioned overlay would sit in its own stacking context above
    // .slide-track's transformed content and swallow clicks meant for real controls
    // like the champion grid's arrows) - instead this fires on .slide-deck itself via
    // normal bubbling, so any interactive element inside a slide can call
    // stopPropagation() to opt out and handle its own click.
    const onClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = (e.clientX - rect.left) / rect.width;
        if (fraction <= TAP_ZONE_FRACTION) {
            prev();
        } else if (fraction >= 1 - TAP_ZONE_FRACTION) {
            next();
        }
    };

    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;

        const endX = e.changedTouches[0].clientX;
        const delta = endX - touchStartX.current;
        touchStartX.current = null;

        // A real drag always navigates, even if it started on top of a tap-zone button.
        if (delta < -SWIPE_THRESHOLD) {
            e.preventDefault();
            next();
            return;
        }
        if (delta > SWIPE_THRESHOLD) {
            e.preventDefault();
            prev();
            return;
        }

        // Not a drag - treat it as a tap. Only the outer 30% zones navigate; a tap in
        // the middle is left alone so it can interact with slide content underneath.
        // preventDefault suppresses the browser's synthetic click that would otherwise
        // fire right after on whatever was actually touched and double-navigate via onClick.
        const rect = e.currentTarget.getBoundingClientRect();
        const fraction = (endX - rect.left) / rect.width;
        if (fraction <= TAP_ZONE_FRACTION) {
            e.preventDefault();
            prev();
        } else if (fraction >= 1 - TAP_ZONE_FRACTION) {
            e.preventDefault();
            next();
        }
    };


    useEffect(() => {
    const handler = (e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
}, [next, prev]);

    return (
        <div
            className="slide-deck"
            onClick={onClick}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <ProgressBar total={slides.length} current={index} />
            <div
                className="slide-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {slides.map((slide, i) => (
                    <div className="slide" key={i}>
                        {slide}
                    </div>
                ))}
            </div>
        </div>
    );
}