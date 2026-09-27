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
    const pingNames = Object.keys(pingArr);
    // reduce() without a seed throws on an empty array, which took the whole
    // slide down for players with no recorded pings.
    const maxPing = pingNames.length ? pingNames.reduce((a, b) => pingArr[a] > pingArr[b] ? a : b) : null;
    const maxPingShare = totalPings > 0 && maxPing ? Math.floor(pingArr[maxPing] / totalPings * 100) : 0;


    return (
        <StatCard
            eyebrow={"You loved to alert your teammates, with a total of"}
            title={`${totalPings.toLocaleString()} pings`}
            subtitle={maxPing ? `"${maxPing}" was your favorite · ${maxPingShare}% of all pings` : "Strong, silent type."}
        >

            {pingArr && <PingGraph pings={Object.values(pingArr)} labels={Object.keys(pingArr)} />}


            <br />
            <p className='subtitle'>Let's just hope they listened.</p>
        </StatCard>

    );
}
