import { Link } from 'react-router-dom';

import './SiteFooter.css';

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer__brand">
                <Link className="site-footer__brand-row" to={"/"}>
                    <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' className="site-footer__logo" />
                    <span className="site-footer__wordmark">Rifting Wrapped</span>
                </Link>
                <span className="site-footer__tagline">
                    LOL Stats in Review
                </span>
            </div>

            <div className="site-footer__cols">
                <div className="site-footer__col">
                    <span className="site-footer__col-title">For Players</span>
                    <Link to="/">Yearly Review</Link>
                    <Link to="/how-it-works">How it Works</Link>
                    <Link to="/faq">FAQ</Link>
                    {/* <Link to="/">Weekly Review</Link>
                    <Link to="/">Yearly Review</Link> */}
                </div>
                <div className="site-footer__col">
                    <span className="site-footer__col-title">Explore</span>
                    <Link to="/leaderboards">Leaderboards</Link>
                    <Link to="/">Champ Stats</Link>
                    <Link to="/">Player Stats</Link>
                </div>
                <div className="site-footer__col">
                    <span className="site-footer__col-title">Legal</span>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                    {/* <Link to="/">Riot Disclaimer</Link> */}
                </div>

                <div className="site-footer__col">
                    <span className="site-footer__col-title">Support Us</span>
                    <Link to="https://ko-fi.com/notred27">Buy us a Ko-fi</Link>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span className="site-footer__copyright">
                    &copy; 2025 Rifting Wrapped. All Rights Reserved.
                </span>


                 <p className="site-footer__desc">
                All data used in Rifting Wrapped comes from the public League of Legends
                matches. Rifting Wrapped isn't endorsed by Riot
                Games and doesn't reflect the views or opinions of Riot Games or anyone
                officially involved in producing or managing Riot Games properties. Riot Games,
                and all associated properties are trademarks or registered trademarks of
                Riot Games, Inc.
            </p>
            </div>
        </footer>
    );
}
