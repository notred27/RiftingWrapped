import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import './SiteHeader.css';

export default function SiteHeader() {
    const headerRef = useRef(null);

    // Publish the header's real height as a custom property. The slide deck sizes
    // itself against the viewport minus this, and previously had to hardcode an
    // approximation that would drift if the header ever changed.
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const publish = () => {
            document.documentElement.style.setProperty(
                '--site-header-h',
                `${Math.round(el.getBoundingClientRect().height)}px`
            );
        };

        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <header className="site-header" ref={headerRef}>
            <Link className="site-header__brand" to="/">
                <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' className="site-header__logo" />
                <span className="site-header__wordmark">Rifting Wrapped</span>
            </Link>

            <nav className="site-header__nav">
                <Link to="/faq">FAQ</Link>
                <a
                    className="site-header__support"
                    href="https://ko-fi.com/notred27"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="site-header__corner site-header__corner--tl" />
                    <span className="site-header__corner site-header__corner--tr" />
                    <span className="site-header__corner site-header__corner--bl" />
                    <span className="site-header__corner site-header__corner--br" />
                    Support Us
                </a>
            </nav>
        </header>
    );
}
