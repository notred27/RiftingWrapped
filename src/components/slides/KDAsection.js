import TableEntry from '../common/TableEntry.js';
import KDAgraph from '../graphs/KDAgraph.js'
import StatCard from '../layout/StatCard.js';


import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css'

export default function KDAsection({ puuid, year }) {
    const {
        combatTotals,
        killFreq,
        deathFreq,
        kda,
    } = useStatsResources();


    const combatStats = combatTotals.read()[0];
    const killFreqArr = killFreq.read();
    const deathFreqArr = deathFreq.read();
    const kdaGames = kda.read();

    if (!combatStats) return null;

    return (

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

    )
}