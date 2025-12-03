import { useEffect, useState } from 'react'

import { useStatsResources } from "../../resources/UserResourceContext.js";

import HorizontalBarChart from '../graphs/ChampGraph.js'
import ChampGrid from '../graphs/ChampGrid.js'
import SectionImage from '../common/SectionImage.js'



export function calcTopChamps(champData) {
    const champDict = {}
    let totalGames = 0

    champData.forEach(({ champion, count }) => {
        champDict[champion] = count
        totalGames += count
    })

    const champNames = Object.keys(champDict)
    const champVals = champNames.map(name => champDict[name])

    const sorted = champNames
        .map((name, i) => ({ name, count: champVals[i] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    const sortedNames = sorted.map(item => item.name)
    const sortedCounts = sorted.map(item => item.count)

    return [sortedNames, sortedCounts, champNames, totalGames]
}




export default function ChampSection() {
    const { lolVersion, champ } = useStatsResources();
    const version = lolVersion.read()[0];
    const champData = champ.read();

    const [allChampions, setAllChampions] = useState([]);

    useEffect(() => {
        async function fetchChampionData() {
            try {
                const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
                const champJson = await champRes.json();

                const champList = Object.values(champJson.data).map(champ => ({
                    id: champ.id,
                    name: champ.name
                }));

                setAllChampions(champList);

                // Preload 
                // champList.forEach(({ id }) => {
                //     const img = new Image();
                //     img.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png`;
                // });

            } catch (error) {
                console.error('Failed to fetch champion data:', error);
            }
        }

        fetchChampionData();
    }, [version]);


    // Data cleaning
    const [sortedNames, sortedCounts, playedChamps, totalGames] = calcTopChamps(champData)
    const topChamp = sortedNames[0]
    const topCount = sortedCounts[0]


    return (
        <>
            <SectionImage
                imgUrl={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
                offset={"25"}
                height={400}
            />

            <div className="champSectionWrapper">
                <div className="champText">
                    <h1>
                        <span className='emphasize' style={{ fontSize: "60px" }}>{topChamp.toUpperCase()}</span>
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

            <div style={{ textAlign: "center" }}>
                You also played as {playedChamps.length} of {allChampions.length} unique champions
                ({Math.round(playedChamps.length / (allChampions.length) * 1000) / 10}% of the total roster)
            </div>

            <ChampGrid
                allChampions={allChampions}
                playedChampions={playedChamps}
                champData={champData}
                version={version}
            />
        </>
    )
}