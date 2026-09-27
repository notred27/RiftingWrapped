import { useStatsResources } from '../../resources/UserResourceContext.js';

import TableEntry from './../common/TableEntry.js';
import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';
import EmptySlide from '../layout/EmptySlide.js';


export default function CsSlide({ puuid }) {
    const { cs } = useStatsResources();
    const csArr = cs.read();
    const stats = csArr.stats?.[0];

    if (!stats || !stats.numGames) {
        return <EmptySlide eyebrow="Creep score" />;
    }

    const avgCs = Math.floor((stats.totalMinions + stats.totalJungleMinions) / stats.numGames * 10) / 10;

    return (
        <StatCard
            eyebrow="You stayed busy, with an average of"
            title={`${avgCs.toLocaleString()} CS`}
            subtitle="per game"
            media={csArr.bestCs?.length > 0 && (
                <>
                    <p className="slide-label">Your games with the highest CS</p>
                    {csArr.bestCs.map((game, idx) => <TableEntry key={`Highest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}
                </>
            )}
        >
            <StatGrid items={[
                { label: "Minions killed", value: stats.totalMinions.toLocaleString() },
                { label: "Jungle monsters", value: stats.totalJungleMinions.toLocaleString() },
                { label: "Games under 100 CS*", value: stats.lowCsGames.toLocaleString() },
            ]} />

            <p className="slide-note">* Summoner's Rift games longer than 15 minutes.</p>
        </StatCard>
    );
}
