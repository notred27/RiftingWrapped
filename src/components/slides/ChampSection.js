import { useStatsResources } from "../../resources/UserResourceContext.js";

import HorizontalBarChart from '../graphs/ChampGraph.js';
import StatCard from '../layout/StatCard.js';
import EmptySlide from '../layout/EmptySlide.js';
import { plural } from '../../resources/theme.js';



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

	if (!topChamp) {
		return <EmptySlide eyebrow="Your go-to champion" title="No games yet" />;
	}

	return (
		<StatCard
			lead={
				<img
					className="champ-hero__splash"
					alt={`${topChamp} splash art`}
					src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp}_0.jpg`}
				/>
			}
			eyebrow="Your go-to champion was"
			title={topChamp.toUpperCase()}
			subtitle={<><strong>{plural(topCount, 'game')}</strong> · {Math.round((topCount / totalGames) * 100)}% of everything you played</>}
			media={
				<>
					<p className="slide-label">Most played champions</p>
					<HorizontalBarChart champs={sortedNames} values={sortedCounts} />
				</>
			}
		/>
	);
}
