import { useStatsResources } from '../../resources/UserResourceContext.js';

import PingGraph from '../graphs/PingGraph.js';
import StatCard from '../layout/StatCard.js';
import EmptySlide from '../layout/EmptySlide.js';


export default function LaneSection() {
    const { pings } = useStatsResources();

    // Copy rather than delete off the cached object - this data is shared with
    // every other slide that reads `pings`.
    const { 'Command Ping': _commandPing, ...pingArr } = pings.read()[0] ?? {};

    const totalPings = Object.values(pingArr).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
    if (totalPings === 0) {
        return <EmptySlide eyebrow="Pings" title="The strong, silent type" message="No pings recorded this year. Your team must have loved you." />;
    }

    const pingNames = Object.keys(pingArr);
    const maxPing = pingNames.reduce((a, b) => pingArr[a] > pingArr[b] ? a : b);
    const maxPingShare = Math.round(pingArr[maxPing] / totalPings * 100);

    return (
        <StatCard
            eyebrow="You loved to alert your teammates, with a total of"
            title={`${totalPings.toLocaleString()} pings`}
            subtitle={<><strong>"{maxPing}"</strong> was your favorite, at {maxPingShare}% of all pings. Let's hope they listened.</>}
            media={
                <>
                    <p className="slide-label">Pings by type</p>
                    <PingGraph pings={Object.values(pingArr)} labels={pingNames} />
                </>
            }
        />
    );
}
