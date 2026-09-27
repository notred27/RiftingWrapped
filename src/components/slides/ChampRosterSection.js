import { useEffect, useState } from 'react';

import { useStatsResources } from "../../resources/UserResourceContext.js";

import ChampGrid from '../graphs/ChampGrid.js';
import StatCard from '../layout/StatCard.js';
import { calcTopChamps } from './ChampSection.js';
import EmptySlide from '../layout/EmptySlide.js';


export default function ChampRosterSection() {
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


	const [, , playedChamps] = calcTopChamps(champData)
	const rosterPercent = allChampions.length
		? Math.round((playedChamps.length / allChampions.length) * 1000) / 10
		: 0;

	if (playedChamps.length === 0) {
		return <EmptySlide eyebrow="Your champion pool" />;
	}

	return (
		<StatCard
			eyebrow={playedChamps.length === 1 ? "You stuck with just" : "You also played as"}
			title={playedChamps.length === 1 ? '1 champion' : `${playedChamps.length} champions`}
			subtitle={`of ${allChampions.length} total · that's ${rosterPercent}% of the roster`}
		>

			<div>
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
