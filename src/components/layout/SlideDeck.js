import { useState, useRef, useCallback, useEffect, Children } from 'react';
import ProgressBar from './ProgressBar.js';
import './SlideDeck.css';

export default function SlideDeck({ children }) {
    const slides = Children.toArray(children);
    const [index, setIndex] = useState(0);
    const touchStartX = useRef(null);

    const goTo = useCallback((i) => {
        setIndex(Math.max(0, Math.min(slides.length - 1, i)));
    }, [slides.length]);

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta < -50) next();
        else if (delta > 50) prev();
        touchStartX.current = null;
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
        <div className="slide-deck">
            
            <ProgressBar total={slides.length} current={index} />
            <div
                className="slide-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {slides.map((slide, i) => (
                    <div className="slide" key={i}>
                        {slide}
                    </div>
                ))}
            </div>

            <button className="tap-zone tap-zone-left" onClick={prev} aria-label="Previous" />
            <button className="tap-zone tap-zone-right" onClick={next} aria-label="Next" />
        </div>
    );
}