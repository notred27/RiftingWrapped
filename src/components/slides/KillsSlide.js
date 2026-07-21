import TableEntry from './../common/TableEntry.js';
import MapOverlay from './../graphs/MapOverlay.js';

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css';

export default function KillsSlide({ puuid, year }) {
    const {
        highestKillGames,
        combatTotals,

    } = useStatsResources();

    const highestKillGamesData = highestKillGames.read().slice(0, 4);
    const combatStats = combatTotals.read()[0];


    if (!combatStats) return null;

    return (
        <StatCard>
            <div style={{ textAlign: "left" }}>
                <p>Total Champs Killed</p>
                <h1 className='emphasize-xlg'>{combatStats.totalKills.toLocaleString()}</h1>
            </div>

            <StatGrid
                items={[
                    { label: "Avg. Kills Per Game", value: `${Math.floor(combatStats.totalKills / combatStats.numGames * 100) / 100}` },
                    { label: "Killing Sprees", value: `${combatStats.totalKillingSprees}` },
                    { label: "Enemies Dove", value: `${combatStats.totalTowerTakedowns}` },
                ]}
            />

            <div className='kill-detail-row'>
                <MapOverlay puuid={puuid} year={year} type='kills' />
                <div className='kill-detail-games'>
                    {highestKillGamesData.map((game, idx) => <TableEntry key={`Highest_Kill_Entry_${idx}`} puuid={puuid} match={game} />)}
                    <p className='tableLabel'>Your Games With The Most Kills</p>
                </div>
            </div>
        </StatCard>
    )
}