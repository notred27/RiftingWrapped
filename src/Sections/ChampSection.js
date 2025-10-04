import { useEffect, useState } from 'react'

import HorizontalBarChart from '../graphs/ChampGraph.js'
import ChampGrid from '../graphs/ChampGrid.js'
import SectionImage from '../SectionImage.js'

import './../SectionImage.js'

export default function ChampSection({ puuid, year }) {
    const [loading, setLoading] = useState(true)

    const [champCount, setChampCount] = useState(null);
    const [champData, setChampData] = useState(null)
    const [allChampions, setAllChampions] = useState([]);
    const [version, setVersion] = useState('');


    useEffect(() => {
        async function fetchChampData() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/champs/${puuid}?year=${year}`)
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

                // Preload 
                champList.forEach(({ id }) => {
                    const img = new Image();
                    img.src = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${id}.png`;

                });

            } catch (error) {
                console.error('Failed to fetch champion data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchChampionData();
    }, []);


    if (loading) return <div>Loading...</div>
    if (!champData || champData.length === 0) return;

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
        .slice(0, 10)

    const sortedNames = sorted.map(item => item.name)
    const sortedCounts = sorted.map(item => item.count)

    const topChamp = sortedNames[0]
    const topCount = sortedCounts[0]




    return (
        <>
            <SectionImage
                imgUrl={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
                offset={"25"}
            />

            <div className="champSectionWrapper">
                <div className="champText">
                    <h1>
                        <span className='emphasize' style={{fontSize:"60px"}}>{topChamp.toUpperCase()}</span>
                        <br />
                        was your go-to champ
                        <br />
                        on the rift this year.
                    </h1>
                    <h2>
                        You played as {topChamp} in
                        <span className='emphasize'>
                            &nbsp;{topCount}&nbsp;
                        </span>
                        games,
                        <br />
                        accounting for
                        <span className='emphasize'>
                            &nbsp;{Math.round((topCount / totalGames) * 100)}%&nbsp;
                        </span>
                        of your total games!
                    </h2>
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