import { useStatsResources } from "../../resources/UserResourceContext.js";

import TotalTimeGraph from "../graphs/TotalTimeGraph.js"
import StatCard from "../layout/StatCard.js";
import StatGrid from "../layout/StatGrid.js";
import EmptySlide from "../layout/EmptySlide.js";
import { plural } from "../../resources/theme.js";

const hours = (seconds) => Math.floor((seconds || 0) / 3600);
const hrs = (n) => (n === 1 ? "1 hr" : `${n.toLocaleString()} hrs`);
const hoursOneDp = (seconds) => Math.round((seconds || 0) / 360) / 10;

export default function TimeSpentSlide() {
    const { timeBreakdownStats } = useStatsResources();
    const timeArr = timeBreakdownStats.read()[0];

    if (!timeArr || !timeArr.totalPlaytime) {
        return <EmptySlide eyebrow="Time on the Rift" />;
    }

    const totalTime = hours(timeArr.totalPlaytime);
    const totalTimeInRanked = hours(timeArr.totalRankedTime);
    const totalTimeInRift = hours(timeArr.totalSummonersRift);
    const otherModes = Math.max(0, totalTime - totalTimeInRanked - totalTimeInRift);

    const timeLabels = ["Dead", "CC'ing others", "Past the 15 min mark", "Killing Baron", "With Baron buff", "Killing dragons"];
    const timeBreakdown = [
        hoursOneDp(timeArr.totalTimeDead),
        hoursOneDp(timeArr.timeCCingOthers),
        hoursOneDp(timeArr.totalRoamTime),
        hoursOneDp(timeArr.barons * 40),
        hoursOneDp(timeArr.barons * 180),
        hoursOneDp(timeArr.dragons * 50),
    ];

    return (
        <StatCard
            eyebrow="In total, you spent"
            title={totalTime >= 1 ? plural(totalTime, 'hour') : plural(Math.round(timeArr.totalPlaytime / 60), 'minute')}
            subtitle={totalTime >= 24
                ? <>playing League this year. That's <strong>{plural(Math.floor(totalTime / 8), 'workday')}</strong>, or <strong>{plural(Math.floor(totalTime / 24), 'full day')}</strong>, for better or worse.</>
                : "playing League this year."}
            media={
                <>
                    <p className="slide-label">Where some of that time went (hours)</p>
                    <TotalTimeGraph times={timeBreakdown} labels={timeLabels} />
                </>
            }
        >
            <StatGrid
                items={[
                    { label: "Ranked", value: hrs(totalTimeInRanked) },
                    { label: "Unranked Rift", value: hrs(totalTimeInRift) },
                    { label: "Other modes", value: hrs(otherModes) },
                ]}
            />
        </StatCard>
    );
}
