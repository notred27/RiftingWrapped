import {useEffect, useState} from 'react'

import HorizontalBarChart from '../graphs/ChampGraph.js'
import ChampGrid from '../graphs/ChampGrid.js'


export default function ChampSection({ puuid, year }) {
    const [champData, setChampData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [champCount, setChampCount] = useState(null);

    const [allChampions, setAllChampions] = useState([]);
    const [version, setVersion] = useState('');


    useEffect(() => {
        async function fetchChampData() {
            try {
                const response = await fetch(`http://localhost:5000/champs/${puuid}?year=${year}`)
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setChampData(data)
            } catch (error) {
                console.error('Failed to fetch champ data:', error)
                setChampData([])
            } finally {
                setLoading(false)
            }
        }

        if (puuid) {
            fetchChampData()
        }
    }, [puuid, year])


    useEffect(() => {
        async function fetchChampionData() {
            try {
                const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
                const versions = await versionRes.json();
                const latestVersion = versions[0];
                setVersion(latestVersion);

                const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
                const champJson = await champRes.json();

                const champList = Object.values(champJson.data).map(champ => ({
                    id: champ.id,
                    name: champ.name
                }));

                setAllChampions(champList);
                setChampCount(champList.length);

            } catch (error) {
                console.error('Failed to fetch champion data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchChampionData();
    }, []);


    if (loading) return <div>Loading...</div>
    if (!champData || champData.length === 0) return <div>No champion data found</div>

    // Extract champ counts and names
    const champDict = {}
    let totalGames = 0

    champData.forEach(({ champion, count }) => {
        champDict[champion] = count
        totalGames += count
    })

    const champNames = Object.keys(champDict)
    const champVals = champNames.map(name => champDict[name])

    // Sort descending by count
    const sorted = champNames
        .map((name, i) => ({ name, count: champVals[i] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // top 10

    const sortedNames = sorted.map(item => item.name)
    const sortedCounts = sorted.map(item => item.count)

    const topChamp = sortedNames[0]
    const topCount = sortedCounts[0]




    return (

        <>
            <div style={{ height: '225px', width: "fit-content", overflow: 'hidden', position: 'relative' }}>
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
                    alt="Background"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transform: 'translateY(-40%)',
                        height: 'auto',
                        zIndex: 0,
                        display: 'block',
                        margin: 'auto',
                        maxWidth: '100vw'

                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '15%',
                        height: '100%',
                        background: 'linear-gradient(to right, #0d1317, transparent)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '15%',
                        height: '100%',
                        background: 'linear-gradient(to left, #0d1317, transparent)',
                        pointerEvents: 'none',
                    }}
                />
            </div>

            <div className='centeredRow'>


                <div>
                    <h2 style={{ fontWeight: "300", textAlign: "left", marginBottom: "5px" }}>
                        <span className='emphasize' style={{ fontSize: "60px" }}>{topChamp.toUpperCase()}</span><br />
                        was your go-to champ on the rift this year.
                    </h2>
                    <h4 style={{ marginTop: "5px", fontWeight: "200" }}>
                        You played as {topChamp} in <span className='emphasize'>{topCount}</span> games,<br />
                        accounting for <span className='emphasize'>{Math.round((topCount / totalGames) * 100)}%</span> of your total games!
                    </h4>


                </div>

                <div id='ChampHistogram'>
                    <HorizontalBarChart
                        champs={sortedNames}
                        values={sortedCounts}
                    />
                </div>

            </div>


            <div>
                You also played as {champNames.length} of {champCount} unique champions
                ({Math.round(champNames.length / champCount * 1000) / 10}% of the total roster)
            </div>

            <ChampGrid
                allChampions={allChampions}
                playedChampions={champNames}
                champData={champData}
                version={version}
            />

        </>
    )
}