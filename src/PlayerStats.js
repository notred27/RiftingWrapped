import { useParams } from 'react-router-dom';
import ChampSection from './Sections/ChampSection.js';
import DamageSection from './Sections/DamageSection.js';
import DateSection from './Sections/DateSection.js';
import FFSection from './Sections/FFSection.js';
import KDAsection from './Sections/KDAsection.js';
import LaneSection from './Sections/LaneSection.js';
import TotalTimeBreakdown from './Sections/TotalTimeBreakdown.js';


import UserIntro from './Sections/UserIntro.js';
import UserIntroFallback from './Sections/UserIntroFallback.js';

import { Helmet } from 'react-helmet-async';
import '@fortawesome/fontawesome-free/css/all.min.css';


import { Suspense, useState, useEffect, useMemo } from "react";
import { createUserResource } from "./userResource.js";


import { createDateStatsResource, createForfeitResource, createDamageResource } from './dataResource.js';

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

    const resource = useMemo(() => createUserResource(puuid, year), [puuid]);
    const dateResource = useMemo(() => createDateStatsResource(puuid, year), [puuid]);
    const ffResource = useMemo(() => createForfeitResource(puuid, year), [puuid]);
    const damageResource = useMemo(() => createDamageResource(puuid, year), [puuid]);

    return (

        <>
            <Helmet>
                {playerData &&
                    <>
                        <title>{playerData["username"]}'s 2025 Rifting Wrapped</title>
                        <meta name="description" content={`See how ${playerData["username"]} performed on the Rift in 2025`} />
                        <link rel="preload" as="image" href={`https://example.com/share-images/${playerData["champName"]}'s.jpg`} />

                        <meta property="og:title" content={`${playerData["username"]}'s 2025 Rifting Wrapped | Your League of Legends Year in Review`} />
                        <meta property="og:description" content={`See ${playerData["username"]}'s total hours, most played champion, and more on League of Legends this year!`} />
                        <meta property="og:image" content={`https://example.com/share-images/${playerData["champName"]}'s.jpg`} />
                        <meta property="og:url" content={`https://master.d1t2tctgq2njxi.amplifyapp.com/player/${puuid}`} />
                        <meta name="twitter:card" content="summary_large_image" />

                    </>}

                <link
                    rel="preload"
                    as="fetch"
                    href={`${process.env.REACT_APP_API_ENDPOINT}/get_user/${puuid}`}
                    crossOrigin="anonymous"
                />

                <link rel="canonical" href={`https://master.d1t2tctgq2njxi.amplifyapp.com/player/${puuid}`} />

            </Helmet>


            <Suspense fallback={<UserIntroFallback year={year} />}>
                <div className="fade-in">
                    <UserIntro resource={resource} year={year} />
                </div>
            </Suspense>


            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
            }}>


                <Suspense fallback={<div style={{ height: "500px", width: "80vw" }} />}>
                    <div className="fade-in">
                        <DateSection resource={dateResource} />
                        <FFSection resource={ffResource} puuid={puuid} />

                    </div>
                </Suspense>

                <Suspense fallback={<span />}>
                    <>
                        <ChampSection puuid={puuid} year={year} />
                        <DamageSection resource= {damageResource} />
                        <KDAsection puuid={puuid} year={year} />
                        <LaneSection puuid={puuid} year={year} />
                        <TotalTimeBreakdown puuid={puuid} year={year} />
                    </>
                </Suspense>


                <p id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>

            </div>
        </>
    );
}

export default PlayerStats;
