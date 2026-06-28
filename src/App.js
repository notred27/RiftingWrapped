import { lazy } from 'react';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// import Home from './pages/Home/Home.js';
// import PlayerStats from './pages/User/PlayerStats.js';
// import AddingPlayer from './pages/User/AddingPlayer.js';
// import FAQ from './pages/FAQ/FAQ.js';
// import KofiWidget from './components/KofiWidget.js';




const Home = lazy(() => import('./pages/Home/Home.js'));

const FAQ = lazy(() => import('./pages/FAQ/FAQ.js'));
const About = lazy(() => import('./pages/About/About.js'));
const Contact = lazy(() => import('./pages/Contact/Contact.js'));


const AddingPlayer = lazy(() => import('./pages/User/AddingPlayer.js'));
const PlayerStats = lazy(() => import('./pages/User/PlayerStats.js'));
// const KofiWidget = lazy(() => import('./components/KofiWidget.js'));



function App() {
    return (
        <Router >
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                <header className="site-header">
                    <span style={{ display: "flex", gap: "5px", width: "max-content" }}>
                        <img src='/favicon-32x32.png' alt='rifting wrapped logo' className="site-header__logo" />
                        <div className="site-header__title">
                            Rifting Wrapped 2025
                        </div>
                    </span>
                    <nav className="site-header__nav">
                        <Link to="/">Home</Link>
                        <Link to="/faq">FAQ</Link>
                    </nav>
                </header>

                <main style={{ flex: "1" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/player/:puuid" element={<PlayerStats />} />
                        <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />

                        <Route path="/faq" element={<FAQ />} />
                        {/* <Route path="/about" element={<About />} /> */}
                        {/* <Route path="/contact-us" element={<Contact />} /> */}
                    </Routes>
                </main>

                <footer style={{
                    backgroundColor: "#0f2331",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    alignItems: "start",
                    justifyContent: "space-between",
                    gap: "24px",
                    padding: "clamp(24px, 4vh, 48px) clamp(16px, 5vw, 64px)",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    width: "100%"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px"
                    }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' style={{ width: "20px", height: "20px" }} />
                            <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#fff" }}>
                                Rifting Wrapped 2025
                            </span>
                        </span>

                        {[["/", "Home"], ["/faq", "FAQ"], ["https://ko-fi.com/notred27", "Support Us"]].map(([to, label]) => (
                            <Link key={to} to={to} className="footer-link" style={{ color: "#a0b4c8", textDecoration: "none", fontSize: "0.88rem", fontWeight: "600" }}>
                                {label}
                            </Link>
                        ))}
                    </div>

                    <p style={{
                        fontSize: "0.78rem",
                        color: "#7a8a99",
                        lineHeight: "1.6",
                        margin: "0",
                        maxWidth: "1200px"
                    }}>
                        All data used in Rifting Wrapped comes from the public League of Legends
                        matches a user has participated in. Rifting Wrapped isn't endorsed by Riot
                        Games and doesn't reflect the views or opinions of Riot Games or anyone
                        officially involved in producing or managing Riot Games properties. Riot Games,
                        and all associated properties are trademarks or registered trademarks of
                        Riot Games, Inc.
                    </p>
                </footer>

            </div>

        </Router>
    );
}

export default App;
