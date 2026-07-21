import { Link } from 'react-router-dom';

import './SiteFooter.css';

export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__brand">
                <Link className="site-footer__brand-row" to={"/"}>
                    <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' className="site-footer__logo" />
                    <span className="site-footer__wordmark">Rifting Wrapped</span>
                </Link>
                <span className="site-footer__tagline">
                    League of Legends<br />Year in Review
                </span>
            </div>

            <a
                className="site-footer__cta"
                href="https://ko-fi.com/notred27"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span className="site-footer__corner site-footer__corner--tl" />
                <span className="site-footer__corner site-footer__corner--tr" />
                <span className="site-footer__corner site-footer__corner--bl" />
                <span className="site-footer__corner site-footer__corner--br" />
                <span className="site-footer__cta-label">Support This Project</span>
                <span className="site-footer__cta-value">Buy us a Ko-fi</span>
            </a>

            <p className="site-footer__desc">
                All data used in Rifting Wrapped comes from the public League of Legends
                matches a user has participated in. Rifting Wrapped isn't endorsed by Riot
                Games and doesn't reflect the views or opinions of Riot Games or anyone
                officially involved in producing or managing Riot Games properties. Riot Games,
                and all associated properties are trademarks or registered trademarks of
                Riot Games, Inc.
            </p>

            <div className="site-footer__cols">
                <div className="site-footer__col">
                    <span className="site-footer__col-title">Site</span>
                    <Link to="/">Home</Link>
                    <Link to="/faq">FAQ</Link>
                </div>
                <div className="site-footer__col">
                    <span className="site-footer__col-title">Legal</span>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span className="site-footer__copyright">
                    <img src='/favicon-32x32.png' alt='' />
                    &copy; {year} Rifting Wrapped
                </span>
                <Link to="/privacy">Privacy Policy</Link>
            </div>
        </footer>
    );
}
