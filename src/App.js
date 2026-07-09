import { lazy } from 'react';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import SiteHeader from './components/layout/SiteHeader.js';
import SiteFooter from './components/layout/SiteFooter.js';



const Home = lazy(() => import('./pages/Home/Home.js'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ.js'));
const About = lazy(() => import('./pages/About/About.js'));
const Contact = lazy(() => import('./pages/Contact/Contact.js'));

const AddingPlayer = lazy(() => import('./pages/User/AddingPlayer.js'));
const PlayerStats = lazy(() => import('./pages/User/PlayerStats.js'));


function App() {
    return (
        <Router >
            <div>
                <SiteHeader />

                <main style={{ minHeight: "80vh" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/player/:puuid" element={<PlayerStats />} />
                        <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />
                        <Route path="/faq" element={<FAQ />} />
                        {/* <Route path="/about" element={<About />} /> */}
                        {/* <Route path="/contact-us" element={<Contact />} /> */}
                    </Routes>
                </main>

                <SiteFooter />
            </div>
        </Router>
    );
}

export default App;
