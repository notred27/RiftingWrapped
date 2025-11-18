
import { Helmet } from 'react-helmet-async';
import { Suspense, useEffect, useState } from "react";
import ErrorBoundary from '../../components/Error/ErrorBoundary.js';


export default function PlayerSEO({ puuid, year }) {

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
        <ErrorBoundary >

            <Helmet>
                <link rel="canonical" href={`https://www.riftingwrapped.com/player/${puuid}`} />

                <link rel="preload" as="fetch" href={`${process.env.REACT_APP_API_ENDPOINT}/users/${puuid}`} crossOrigin="anonymous" />

                {playerData &&
                    <>
                        <title>{playerData["username"]}'s Rifting Wrapped {year} | Your League of Legends Year in Review</title>
                        <meta name="description" content={`See how ${playerData["username"]} performed on the Rift in ${year}`} />
                        <link rel="preload" as="image" href={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData["champName"]}_0.jpg`} />

                        <meta property="og:title" content={`${playerData["username"]}'s Rifting Wrapped ${year} | Your League of Legends Year in Review`} />
                        <meta property="og:description" content={`See ${playerData["username"]}'s total hours, most played champion, and more on League of Legends this year!`} />
                        <meta property="og:image" content={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData["champName"]}_0.jpg`} />
                        <meta property="og:url" content={`https://www.riftingwrapped.com//player/${puuid}`} />
                        <meta name="twitter:card" content="summary_large_image" />

                    </>}
            </Helmet>
        </ErrorBoundary>
    )

}