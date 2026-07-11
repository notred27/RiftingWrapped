import { useStatsResources } from '../../resources/UserResourceContext.js';

import RoleGraph from './../graphs/RoleGraph.js';
import PingGraph from './../graphs/PingGraph.js';
import ObjectiveBubbleChart from './../graphs/ObjectiveBubbleChart.js';

import TableEntry from './../common/TableEntry.js';



import StatCard from '../layout/StatCard.js';

import './LaneSection.css'
import StatGrid from '../layout/StatGrid.js';



export default function ObjectiveSlide({ puuid }) {
    const { role, objectives } = useStatsResources();

    const roleArr = role.read()
    console.log(roleArr)
    const objectiveArr = objectives.read()[0];
    objectiveArr['_id'] = 0;
    const cleanedRoleData = roleArr.filter(role => role._id !== "");


    const totalObjectives = Object.values(objectiveArr).reduce((a, c) => parseInt(a) + parseInt(c), 0);
    const totalRoleGames = cleanedRoleData.reduce((sum, role) => sum + role.count, 0);



    return (
        <StatCard
            eyebrow={"You helped take down tons of objectives, averaging"}
            title={`${(Math.floor(totalObjectives / totalRoleGames * 10) / 10).toLocaleString()} per game`}
            subtitle={`(${totalObjectives.toLocaleString()} objectives across ${totalRoleGames.toLocaleString()} Summoner's rift games)`}
        >

            <ObjectiveBubbleChart objectives={{
                barons: objectiveArr["barons"],
                dragons: objectiveArr["dragons"],
                riftHeralds: objectiveArr["riftHeralds"],
                voidGrubs: objectiveArr["voidGrubs"],
                atakhan: objectiveArr["atakhans"],
                towers: objectiveArr["towers"],
                inhibitors: objectiveArr["inhibitors"]
            }} />

        </StatCard>

    );
}
