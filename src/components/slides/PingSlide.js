import { useStatsResources } from '../../resources/UserResourceContext.js';

import PingGraph from '../graphs/PingGraph.js';
import StatCard from '../layout/StatCard.js';

import './LaneSection.css';


export default function LaneSection({ puuid }) {
    const { pings } = useStatsResources();

    const pingArr = pings.read()[0];
    delete pingArr['Command Ping']

    const totalPings = Object.values(pingArr).reduce((a, c) => parseInt(a) + parseInt(c), 0);
    const maxPing = Object.keys(pingArr).reduce((a, b) => pingArr[a] > pingArr[b] ? a : b);


    return (
        <StatCard
            eyebrow={"You loved to alert your teammates, with a total of"}
            title={`${totalPings.toLocaleString()} pings`}
            subtitle={`"${maxPing}" was your favorite · ${Math.floor(pingArr[maxPing] / totalPings * 100)}% of all pings`}
        >

            {pingArr && <PingGraph pings={Object.values(pingArr)} labels={Object.keys(pingArr)} />}


            <br />
            <p className='subtitle'>Let's just hope they listened.</p>
        </StatCard>

    );
}
