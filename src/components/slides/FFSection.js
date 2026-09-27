import { useStatsResources } from "./../../resources/UserResourceContext.js";

import StatCard from "../layout/StatCard.js";
import StatGrid from "../layout/StatGrid.js";
import EmptySlide from "../layout/EmptySlide.js";

import FFGraph from "../graphs/FFGraph.js";

import './styles.css'

export default function FFSection() {
    const { forfeit } = useStatsResources();
    const ffData = forfeit.read()[0];

    if (!ffData || !ffData.numSurrenders) {
        return <EmptySlide eyebrow="Surrenders" title="No surrenders" message="Every game you played went the distance. Respect." />;
    }

    const youFFd = ffData.numSurrenders - ffData.numSurrendersWon;
    const enemiesFFd = ffData.numSurrendersWon;

    // Estimate time saved: surrendered games vs. your average full-length game.
    // This can come out negative (surrendered games that still ran long), in
    // which case the tile is left out rather than showing "-2.49 hrs".
    const fullGames = ffData.numGames - ffData.numSurrenders;
    const avgFullGame = fullGames > 0 ? ffData.totalNonSurrenderTime / fullGames : 0;
    const hoursSaved = Math.floor((avgFullGame * ffData.numSurrenders - ffData.totalSurrenderTime) / 36) / 100;

    let title = `${ffData.numSurrenders} surrenders`;
    let subtitle = "decided your games early this year";
    if (youFFd > 0 && enemiesFFd > 0) {
        if (enemiesFFd >= youFFd) {
            title = `${(enemiesFFd / youFFd).toFixed(1)}x`;
            subtitle = "Enemies gave up on you this many times more often than you gave up on them";
        } else {
            title = `${(youFFd / enemiesFFd).toFixed(1)}x`;
            subtitle = "You were this many times more likely to give up than your enemies";
        }
    }

    const tiles = [{ label: "Surrendered at 15", value: `${ffData.gamesEndingBefore16} games` }];
    if (hoursSaved > 0) tiles.push({ label: "Time saved by surrenders", value: `${hoursSaved} hrs` });

    return (
        <StatCard
            eyebrow="You ended some games early, but refused to end others"
            title={title}
            subtitle={subtitle}
            media={<FFGraph youFFd={youFFd} enemiesFFd={enemiesFFd} />}
        >
            <StatGrid items={tiles} />
        </StatCard>
    );
}
