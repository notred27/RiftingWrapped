import { useEffect, useRef } from 'react';

export default function Scroller({ children }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollerInner = scroller.querySelector('.scrollContent');
    const scrollerContent = Array.from(scrollerInner.children);


    scroller.setAttribute('data-animated', 'true');

    scrollerContent.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      scrollerInner.appendChild(clone);
    });
  }, []);

  return (
    <div className="scrollContainer" ref={scrollerRef}>
      <div className="scrollContent">
        {children}
      </div>
    </div>
  );
}
