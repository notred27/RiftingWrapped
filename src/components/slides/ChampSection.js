import { useEffect, useState } from 'react';
import { useStatsResources } from "../../resources/UserResourceContext.js";


import HorizontalBarChart from '../graphs/ChampGraph.js';
import ChampGrid from '../graphs/ChampGrid.js';
import StatCard from '../layout/StatCard.js';



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
		<StatCard
			eyebrow="Your go-to champion was"
			title={`${topChamp.toUpperCase()}`}
			subtitle={`${topCount} games · ${Math.round((topCount / totalGames) * 100)}% of your games`}
		>

			<div style={{ position: "relative" }} >
				<HorizontalBarChart
					champs={sortedNames}
					values={sortedCounts}
				/>
				<img
					alt={`${topChamp}-portrait`}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						zIndex: "1",
						opacity: "0.4",
						borderRadius: "8px",
						objectFit: "cover",
						objectPosition: "center",
					}}
					src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
				/>
			</div>

			<br />

			<p>
				You also played as <span className='emphasize-md'>{playedChamps.length}</span> of <span className='emphasize-md'>{allChampions.length}</span> unique champions
			</p>
			<p className='subtitle'>
				(that's {Math.round(playedChamps.length / (allChampions.length) * 1000) / 10}% of the total roster)
			</p>

			<div >
				<ChampGrid
					allChampions={allChampions}
					playedChampions={playedChamps}
					champData={champData}
					version={version}
				/>
			</div>

		</StatCard>
		);
}