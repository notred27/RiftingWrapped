import { useStatsResources } from "../../resources/UserResourceContext.js";

import HorizontalBarChart from '../graphs/ChampGraph.js';
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
	const { champ } = useStatsResources();
	const champData = champ.read();

	const [sortedNames, sortedCounts, , totalGames] = calcTopChamps(champData)
	const topChamp = sortedNames[0]
	const topCount = sortedCounts[0]


	return (
		<StatCard>

			<div className="champ-hero">
				<img
					className="champ-hero__portrait"
					alt={`${topChamp} portrait`}
					src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
				/>
				<div className="champ-hero__text">
					<p className="subtitle">Your go-to champion was</p>
					<h1 className="champ-hero__name">{topChamp.toUpperCase()}</h1>
					<p className="subtitle">{topCount} games · {Math.round((topCount / totalGames) * 100)}% of your games</p>
				</div>
			</div>

			<HorizontalBarChart
				champs={sortedNames}
				values={sortedCounts}
			/>

		</StatCard>
		);
}