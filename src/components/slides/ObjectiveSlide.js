import { useStatsResources } from '../../resources/UserResourceContext.js';

import ObjectiveBubbleChart from './../graphs/ObjectiveBubbleChart.js';
import StatCard from '../layout/StatCard.js';

import './LaneSection.css'



export default function ObjectiveSlide({ puuid }) {
    const { role, objectives } = useStatsResources();

    const roleArr = role.read()
    // Copy rather than mutate: these objects come from the shared resource cache,
    // so writing to them leaks into every other slide that reads the same data.
    const { _id, ...objectiveCounts } = objectives.read()[0] ?? {};
    const cleanedRoleData = roleArr.filter(role => role._id !== "");


    const totalObjectives = Object.values(objectiveCounts).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
    const totalRoleGames = cleanedRoleData.reduce((sum, role) => sum + role.count, 0);



    return (
        <StatCard
            eyebrow={"You helped take down tons of objectives, averaging"}
            title={`${(Math.floor(totalObjectives / totalRoleGames * 10) / 10).toLocaleString()} per game`}
            subtitle={`(${totalObjectives.toLocaleString()} objectives across ${totalRoleGames.toLocaleString()} Summoner's rift games)`}
        >

            <ObjectiveBubbleChart objectives={{
                barons: objectiveCounts["barons"],
                dragons: objectiveCounts["dragons"],
                riftHeralds: objectiveCounts["riftHeralds"],
                voidGrubs: objectiveCounts["voidGrubs"],
                atakhan: objectiveCounts["atakhans"],
                towers: objectiveCounts["towers"],
                inhibitors: objectiveCounts["inhibitors"]
            }} />

        </StatCard>

    );
}
