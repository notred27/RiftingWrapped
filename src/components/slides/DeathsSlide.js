import TableEntry from './../common/TableEntry.js';
import KDAgraph from './../graphs/KDAgraph.js'
import MapOverlay from './../graphs/MapOverlay.js';

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css'

export default function DeathsSlide({ puuid, year }) {
    const {
        highestDeathGames,
        combatTotals,
    } = useStatsResources();

    const highestDeathGamesData = highestDeathGames.read().slice(0, 4);
    const combatStats = combatTotals.read()[0];

    if (!combatStats) return null;

    return (
        <StatCard>
            <div style={{ textAlign: "left" }}>
                <p>Total Deaths</p>
                <h1 className='emphasize-xlg'>{combatStats.totalDeaths.toLocaleString()}</h1>
            </div>

            <StatGrid
                items={[
                    { label: "Avg. Deaths Per Game", value: `${Math.floor(combatStats.totalDeaths / combatStats.numGames * 100) / 100}` },
                    { label: "Total Time Dead", value: `${Math.round(combatStats.totalTimeDead / 60) < 300 ? `${Math.round(combatStats.totalTimeDead / 60)} minutes ` : `${Math.round(combatStats.totalTimeDead / 360) / 10} hrs`}` },
                    // { label: " ", value: ` ` },
                ]}
            />

            <div className='kill-detail-row'>
                <MapOverlay puuid={puuid} year={year} type='deaths' />
                <div className='kill-detail-games'>
                    {highestDeathGamesData.map((game, idx) => <TableEntry key={`Highest_Death_Entry_${idx}`} puuid={puuid} match={game} />)}
                    <p className='tableLabel'>Your Games With The Most Deaths</p>
                </div>
            </div>
        </StatCard>

    );
}