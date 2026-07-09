import TableEntry from './../common/TableEntry.js';
import KDAgraph from './../graphs/KDAgraph.js'
import MapOverlay from './../graphs/MapOverlay.js';

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css'

export default function KDAsection({ puuid, year }) {
    const {
        highestKillGames,
        highestDeathGames,
        combatTotals,
        killFreq,
        deathFreq,
        kda,
    } = useStatsResources();

    const highestKillGamesData = highestKillGames.read().slice(0,4);
    const highestDeathGamesData = highestDeathGames.read().slice(0,4);
    const combatStats = combatTotals.read()[0];
    const killFreqArr = killFreq.read();
    const deathFreqArr = deathFreq.read();
    const kdaGames = kda.read();

    if (!combatStats) return null;

    return (
        <>
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

            <StatCard>
                <KDAgraph kills={killFreqArr} deaths={deathFreqArr} />

                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", width: "100%", justifyContent: "center", textAlign: "left" }}>
                    <div style={{ width: "50%" }}>
                        <p>
                            Of the <span className='emphasize'>{combatStats.totalPositiveGames}</span> games where you went positive,<br /> you won <span className='emphasize'>{Math.floor(combatStats.positiveWR / combatStats.totalPositiveGames * 10000) / 100}%</span> of the time.
                        </p>
                        <TableEntry puuid={puuid} match={kdaGames["bestKDA"]} />
                        <p className='tableLabel'>Your best KDA game</p>
                    </div>

                    <div style={{ width: "50%" }}>
                        <p>
                            Of the <span className='emphasize'>{combatStats.totalNegativeGames}</span> games that you went negative,<br /> you won <span className='emphasize'>{Math.floor(combatStats.negativeWR / combatStats.totalNegativeGames * 10000) / 100}%</span> of the time.
                        </p>
                        <TableEntry puuid={puuid} match={kdaGames["worstKDA"]} />
                        <p className='tableLabel'>Your worst KDA game</p>
                    </div>
                </div>
            </StatCard>
        </>
    )
}