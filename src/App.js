import { lazy, useEffect } from 'react';

import { Helmet } from 'react-helmet-async';
import { Navigate, Route, Routes, useLocation, useNavigationType, useParams } from 'react-router-dom';

import SiteFooter from './components/layout/SiteFooter.js';
import SiteHeader from './components/layout/SiteHeader.js';
import { usePageTracking } from './resources/usePageTracking.js';

const Home = lazy(() => import('./pages/Home/Home.js'));
const FAQ = lazy(() => import('./pages/Policy/FAQ.js'));
const TOS = lazy(() => import('./pages/Policy/TOS.js'));
const Privacy = lazy(() => import('./pages/Policy/Privacy.js'));
const HowItWorks = lazy(() => import('./pages/Policy/HowItWorks.js'));
const AddingPlayer = lazy(() => import('./pages/User/AddingPlayer.js'));
const PlayerStats = lazy(() => import('./pages/User/PlayerStats.js'));
const WeeklyRecap = lazy(() => import('./pages/Weekly/WeeklyRecap.js'));
const Leaderboards = lazy(() => import('./pages/Leaderboards/Leaderboards.js'));
const FriendBoard = lazy(() => import('./pages/Leaderboards/FriendBoard.js'));



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

/** Board invites (/b/<id>) work the same way, proxied to the API's invite page. */
function InviteRedirect() {
    const { boardId } = useParams();
    return <Navigate to={`/leaderboards/${boardId}?ref=invite`} replace />;
}

export default function App() {
    usePageTracking();
    const { pathname } = useLocation();
    const navType = useNavigationType();
    // New pages open at the top; back/forward (POP) keeps the browser's own scroll restore.
    useEffect(() => {
        if (navType !== 'POP') window.scrollTo(0, 0);
    }, [pathname, navType]);
    return (
        <>
            {/* Link-preview card for every page; pages with their own (player cards) override it. */}
            <Helmet>
                <meta property="og:image" content="https://www.riftingwrapped.com/og-home.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Rifting Wrapped: your League of Legends year in review" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="https://www.riftingwrapped.com/og-home.jpg" />
            </Helmet>
            {/* <div> */}
                <SiteHeader />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/player/:puuid" element={<PlayerStats />} />
                        <Route path="/player/:puuid/week" element={<WeeklyRecap />} />
                        <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />
                        <Route path="/s/:year/:puuid" element={<ShareRedirect />} />
                        <Route path="/b/:boardId" element={<InviteRedirect />} />
                        <Route path="/leaderboards" element={<Leaderboards />} />
                        <Route path="/leaderboards/:boardId" element={<FriendBoard />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />
                        <Route path="/terms" element={<TOS />} />
                        <Route path="/privacy" element={<Privacy />} />
                    </Routes>
                </main>

                <SiteFooter />
            {/* </div> */}
        </>
    );
}

