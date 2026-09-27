import TableEntry from './../common/TableEntry.js';
import MapOverlay from './../graphs/MapOverlay.js';

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';
import EmptySlide from '../layout/EmptySlide.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css';

export default function KillsSlide({ puuid }) {
    const { highestKillGames, combatTotals } = useStatsResources();

    const combatStats = combatTotals.read()[0];
    if (!combatStats || !combatStats.numGames) {
        return <EmptySlide eyebrow="Champions killed" />;
    }

    const highestKillGamesData = highestKillGames.read().slice(0, 4);

    return (
        <StatCard
            eyebrow="You took down"
            title={combatStats.totalKills.toLocaleString()}
            subtitle="enemy champions this year"
            media={<MapOverlay type="kills" />}
        >
            <StatGrid
                items={[
                    { label: "Kills per game", value: (Math.round(combatStats.totalKills / combatStats.numGames * 100) / 100).toLocaleString() },
                    { label: "Killing sprees", value: combatStats.totalKillingSprees.toLocaleString() },
                    { label: "Tower takedowns", value: combatStats.totalTowerTakedowns.toLocaleString() },
                ]}
            />

            <div>
                <p className="slide-label">Your games with the most kills</p>
                {highestKillGamesData.map((game, idx) => <TableEntry key={`Highest_Kill_Entry_${idx}`} puuid={puuid} match={game} />)}
            </div>
        </StatCard>
    );
}
