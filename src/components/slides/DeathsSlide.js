import TableEntry from './../common/TableEntry.js';
import MapOverlay from './../graphs/MapOverlay.js';

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';
import EmptySlide from '../layout/EmptySlide.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css'

function formatTimeDead(seconds) {
    const minutes = Math.round(seconds / 60);
    return minutes < 300 ? `${minutes} min` : `${Math.round(seconds / 360) / 10} hrs`;
}

export default function DeathsSlide({ puuid }) {
    const { highestDeathGames, combatTotals } = useStatsResources();

    const combatStats = combatTotals.read()[0];
    if (!combatStats || !combatStats.numGames) {
        return <EmptySlide eyebrow="Deaths" />;
    }

    const highestDeathGamesData = highestDeathGames.read().slice(0, 4);

    return (
        <StatCard
            eyebrow="But you also died"
            title={combatStats.totalDeaths.toLocaleString()}
            subtitle="times, and here's where it kept happening"
            media={<MapOverlay type="deaths" />}
        >
            <StatGrid
                items={[
                    { label: "Deaths per game", value: (Math.round(combatStats.totalDeaths / combatStats.numGames * 100) / 100).toLocaleString() },
                    { label: "Time spent dead", value: formatTimeDead(combatStats.totalTimeDead) },
                ]}
            />

            <div>
                <p className="slide-label">Your games with the most deaths</p>
                {highestDeathGamesData.map((game, idx) => <TableEntry key={`Highest_Death_Entry_${idx}`} puuid={puuid} match={game} />)}
            </div>
        </StatCard>
    );
}
