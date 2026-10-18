import { lazy } from 'react';

import { Navigate, Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';

import SiteFooter from './components/layout/SiteFooter.js';
import SiteHeader from './components/layout/SiteHeader.js';
import { usePageTracking } from './resources/usePageTracking.js';

const Home = lazy(() => import('./pages/Home/Home.js'));
const FAQ = lazy(() => import('./pages/Policy/FAQ.js'));
const TOS = lazy(() => import('./pages/Policy/TOS.js'));
const Privacy = lazy(() => import('./pages/Policy/Privacy.js'));
const AddingPlayer = lazy(() => import('./pages/User/AddingPlayer.js'));
const PlayerStats = lazy(() => import('./pages/User/PlayerStats.js'));



/**
 * Share links (/s/<year>/<puuid>) are normally proxied by AWS Amplify to the
 * API's share page, which serves link-preview tags and then redirects to the
 * Wrapped. If a request reaches the app instead (e.g. before that rewrite is
 * set up), still take the visitor to the Wrapped.
 */
function ShareRedirect() {
    const { year, puuid } = useParams();
    return <Navigate to={`/player/${puuid}?year=${year}&from=share`} replace />;
}

export default function App() {
    usePageTracking();
    return (
        <>
            {/* <div> */}
                <SiteHeader />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/player/:puuid" element={<PlayerStats />} />
                        <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />
                        <Route path="/s/:year/:puuid" element={<ShareRedirect />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/terms" element={<TOS />} />
                        <Route path="/privacy" element={<Privacy />} />
                    </Routes>
                </main>

                <SiteFooter />
            {/* </div> */}
        </>
    );
}

