import { useStatsResources } from '../../resources/UserResourceContext.js';

import ObjectiveBubbleChart from './../graphs/ObjectiveBubbleChart.js';
import StatCard from '../layout/StatCard.js';
import EmptySlide from '../layout/EmptySlide.js';


export default function ObjectiveSlide() {
    const { role, objectives } = useStatsResources();

    const roleArr = role.read()
    // Copy rather than mutate: these objects come from the shared resource cache,
    // so writing to them leaks into every other slide that reads the same data.
    const { _id, numGames: _numGames, ...objectiveCounts } = objectives.read()[0] ?? {};
    const riftGames = roleArr.filter(r => r._id !== "").reduce((sum, r) => sum + r.count, 0);

    const totalObjectives = Object.values(objectiveCounts).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);

    if (!riftGames || !totalObjectives) {
        return <EmptySlide eyebrow="Objectives" message="No Summoner's Rift objectives this year yet. Towers don't take themselves!" />;
    }

    return (
        <StatCard
            eyebrow="You helped take down tons of objectives, averaging"
            title={`${(Math.floor(totalObjectives / riftGames * 10) / 10).toLocaleString()} per game`}
            subtitle={<><strong>{totalObjectives.toLocaleString()} objectives</strong> across {riftGames.toLocaleString()} Summoner's Rift games</>}
            media={
                <ObjectiveBubbleChart objectives={{
                    barons: objectiveCounts.barons,
                    dragons: objectiveCounts.dragons,
                    riftHeralds: objectiveCounts.riftHeralds,
                    voidGrubs: objectiveCounts.voidGrubs,
                    atakhan: objectiveCounts.atakhans,
                    towers: objectiveCounts.towers,
                    inhibitors: objectiveCounts.inhibitors
                }} />
            }
        />
    );
}
