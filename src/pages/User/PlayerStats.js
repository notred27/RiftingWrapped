import { useParams } from 'react-router-dom';
import ChampSection from '../../components/sections/ChampSection.js';
import DamageSection from '../../components/sections/DamageSection.js';
import DateSection from '../../components/sections/DateSection.js';
import FFSection from '../../components/sections/FFSection.js';
import KDAsection from '../../components/sections/KDAsection.js';
import LaneSection from '../../components/sections/LaneSection.js';
import TotalTimeBreakdown from '../../components/sections/TotalTimeBreakdown.js';

import UserIntro from '../../components/sections/UserIntro.js';
import UserIntroFallback from '../../components/sections/UserIntroFallback.js';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { Helmet } from 'react-helmet-async';


import { Suspense, useEffect, useState } from "react";

// import Temp from '../../components/sections/Temp.js';


import { UserResourceProvider } from "../../resources/UserResourceContext.js";


function PlayerStats() {
    const { puuid } = useParams();
    const year = "2025";


    const [playerData, setPlayerData] = useState(null);


    useEffect(() => {
        async function fetchPlayerData() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_card_preview/${puuid}`);
                const data = await response.json();
                setPlayerData(data);
            } catch (err) {
                console.error('Failed to fetch player data', err);
            }
        }

        fetchPlayerData();
    }, [puuid]);


    return (

        <>
            <Helmet>
                {playerData &&
                    <>
                        <title>{playerData["username"]}'s 2025 Rifting Wrapped</title>
                        <meta name="description" content={`See how ${playerData["username"]} performed on the Rift in 2025`} />
                        <link rel="preload" as="image" href={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData["champName"]}_0.jpg`} />

                        <meta property="og:title" content={`${playerData["username"]}'s 2025 Rifting Wrapped | Your League of Legends Year in Review`} />
                        <meta property="og:description" content={`See ${playerData["username"]}'s total hours, most played champion, and more on League of Legends this year!`} />
                        <meta property="og:image" content={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData["champName"]}_0.jpg`} />
                        <meta property="og:url" content={`https://www.riftingwrapped.com//player/${puuid}`} />
                        <meta name="twitter:card" content="summary_large_image" />

                    </>}

                <link
                    rel="preload"
                    as="fetch"
                    href={`${process.env.REACT_APP_API_ENDPOINT}/getUser?puuid=${puuid}`}
                    crossOrigin="anonymous"
                />

                <link rel="canonical" href={`https://master.d1t2tctgq2njxi.amplifyapp.com/player/${puuid}`} />

            </Helmet>

            <UserResourceProvider puuid={puuid} year={year}>

                <Suspense fallback={<UserIntroFallback year={year} />}>
                    <div className="fade-in">
                        <UserIntro year={year} />
                    </div>
                </Suspense>


                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>

                    <Suspense fallback={<div style={{ height: "500px", width: "80vw" }} />}>
                        <DateSection />
                        <FFSection />
                        <ChampSection />
                        <DamageSection />
                        <KDAsection puuid={puuid} year={year} />
                        <LaneSection puuid={puuid} year={year} />
                        <TotalTimeBreakdown puuid={puuid} year={year} />
                    </Suspense>

                    {/* <Suspense fallback={<span />}>
                        <div className="fade-in">
                            <Temp year={year} />
                        </div>
                    </Suspense> */}

                </div>

            </UserResourceProvider>


        </>
    );
}

export default PlayerStats;
