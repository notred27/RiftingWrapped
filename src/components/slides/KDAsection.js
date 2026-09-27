import TableEntry from '../common/TableEntry.js';
import KDAgraph from '../graphs/KDAgraph.js'
import StatCard from '../layout/StatCard.js';
import EmptySlide from '../layout/EmptySlide.js';
import { plural } from '../../resources/theme.js';

import { useStatsResources } from '../../resources/UserResourceContext.js';

import './KDAsection.css'

const pct = (part, whole) => (whole > 0 ? Math.round(part / whole * 1000) / 10 : 0);

export default function KDAsection({ puuid }) {
    const { combatTotals, killFreq, deathFreq, kda } = useStatsResources();

    const combatStats = combatTotals.read()[0];
    if (!combatStats || !combatStats.numGames) {
        return <EmptySlide eyebrow="Kills vs. deaths" />;
    }

    const killFreqArr = killFreq.read();
    const deathFreqArr = deathFreq.read();
    const kdaGames = kda.read();

    const positiveWinRate = pct(combatStats.positiveWR, combatStats.totalPositiveGames);
    const negativeWinRate = pct(combatStats.negativeWR, combatStats.totalNegativeGames);

    return (
        <StatCard
            eyebrow="When you went positive, you won"
            title={`${positiveWinRate}%`}
            subtitle={combatStats.totalNegativeGames > 0
                ? <>of <strong>{plural(combatStats.totalPositiveGames, 'game')}</strong>, compared to <strong>{negativeWinRate}%</strong> of the {plural(combatStats.totalNegativeGames, 'game')} where you went negative</>
                : <>of <strong>{plural(combatStats.totalPositiveGames, 'game')}</strong>, and you never once went negative</>}
            media={
                <>
                    <p className="slide-label">Games by kills and deaths</p>
                    <KDAgraph kills={killFreqArr} deaths={deathFreqArr} />
                </>
            }
        >
            <div className="kda-split">
                {kdaGames.bestKDA?.stats && (
                    <div className="kda-split__col">
                        <p className="slide-label">Best KDA game</p>
                        <TableEntry puuid={puuid} match={kdaGames.bestKDA} />
                    </div>
                )}
                {kdaGames.worstKDA?.stats && (
                    <div className="kda-split__col">
                        <p className="slide-label">Worst KDA game</p>
                        <TableEntry puuid={puuid} match={kdaGames.worstKDA} />
                    </div>
                )}
            </div>
        </StatCard>
    );
}
