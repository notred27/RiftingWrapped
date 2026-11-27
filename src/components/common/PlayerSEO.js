import { useEffect, useState } from "react";

import { Helmet } from 'react-helmet-async';

import ErrorBoundary from '../error/ErrorBoundary.js';


export default function PlayerSEO({ puuid, year }) {
    const [playerData, setPlayerData] = useState(null);

    useEffect(() => {
        async function fetchPlayerData() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_card_preview/${puuid}?year=${year}`);
                const data = await response.json();
                setPlayerData(data);
            } catch (err) {
                console.error('Failed to fetch player data', err);
            }
        }

        fetchPlayerData();
    }, [puuid, year]);


    return (
        <ErrorBoundary >

            <Helmet defer={false}>
                <link rel="canonical" href={`https://www.riftingwrapped.com/player/${puuid}`} />
                <link rel="preload" as="fetch" href={`${process.env.REACT_APP_API_ENDPOINT}/users/${puuid}`} crossOrigin="anonymous" />

                {playerData &&
                    <>
                        <title>{`${playerData["username"]}'s LoL Wrapped ${year} | Rifting Wrapped`}</title>
                        <meta name="description" content={`${playerData["username"]}'s League of Legends year in review for ${year}: most played champions, hours on the Rift, best and worst games, and more.`} />
                        <link rel="preload" as="image" href={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${playerData["champName"]}_0.jpg`} />

                        <meta property="og:title" content={`${playerData["username"]}'s LoL Wrapped ${year} | Rifting Wrapped`} />
                        <meta property="og:description" content={`See ${playerData["username"]}'s ${year} League of Legends year in review: total hours, most played champion, and more.`} />
                        <meta property="og:image" content={`${process.env.REACT_APP_API_ENDPOINT}/share/${puuid}/image.jpg?year=${year}`} />
                        <meta property="og:image:alt" content={`${playerData["username"]}'s ${year} League of Legends stats`} />
                        <meta name="twitter:image" content={`${process.env.REACT_APP_API_ENDPOINT}/share/${puuid}/image.jpg?year=${year}`} />
                        <meta property="og:url" content={`https://www.riftingwrapped.com/player/${puuid}`} />
                        <meta name="twitter:card" content="summary_large_image" />
                    </>}
            </Helmet>
        </ErrorBoundary>
    )
}