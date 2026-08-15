import { useStatsResources } from '../../resources/UserResourceContext.js';

import PingGraph from '../graphs/PingGraph.js';
import StatCard from '../layout/StatCard.js';

import './LaneSection.css';


export default function LaneSection({ puuid }) {
    const { pings } = useStatsResources();

    // Copy rather than delete off the cached object - this data is shared with
    // every other slide that reads `pings`.
    const { 'Command Ping': _commandPing, ...pingArr } = pings.read()[0] ?? {};

    const totalPings = Object.values(pingArr).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
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
