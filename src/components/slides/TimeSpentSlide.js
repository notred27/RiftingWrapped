import { useStatsResources } from "../../resources/UserResourceContext.js";

import TotalTimeGraph from "../graphs/TotalTimeGraph.js"
import SectionImage from '../common/SectionImage.js';

import SharePreviewCard from "../common/SharePreviewCard.js";
import SummaryCard from "./SummaryCard.js";
import StatCard from "../layout/StatCard.js";


export default function TimeSpentSlide({ puuid, year }) {
    const { timeBreakdownStats } = useStatsResources();
    const timeArr = timeBreakdownStats.read()[0];


    // convert to human-readable time
    const totalTime = Math.floor(timeArr["totalPlaytime"] / 3600);
    const totalTimeInRanked = Math.floor(timeArr["totalRankedTime"] / 3600);
    const totalTimeInRift = Math.floor(timeArr["totalSummonersRift"] / 3600);

    const ccTime = Math.floor(timeArr["timeCCingOthers"] / 3600);
    const deadTime = Math.floor(timeArr["totalTimeDead"] / 3600);
    const roamTime = Math.floor(timeArr["totalRoamTime"] / 3600);

    const dragonTime = Math.round(timeArr["dragons"] * 50 / 3600);
    const baronTime = Math.round(timeArr["barons"] * 40 / 3600);
    const baronBuffTime = Math.round(timeArr["barons"] * 180 / 3600);

    const otherTime = totalTime - (ccTime + deadTime + roamTime + dragonTime + baronTime + baronBuffTime);

    const timeLabels = ["Other", "Time Dead", "Time CC'ing Others", "Time Roaming", "Time Killing Baron", "Time Baron Buffed", "Time Killing Dragons"];
    const timeBreakdown = [otherTime, deadTime, ccTime, roamTime, baronTime, baronBuffTime, dragonTime];



    return (

        <StatCard
            eyebrow={"In Total, You spent"}
            title={`${totalTime.toLocaleString()} hours`}
            subtitle={"playing League this year!"}
        >
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", textAlign: "left" }}>
                <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>

                <div>
                    <h2 className="subtitle">This includes:</h2>

                    <p><span className="emphasize-lg">{totalTimeInRift}&nbsp;hrs</span> in Summoner's Rift,</p>

                    <p><span className="emphasize-lg">{totalTimeInRanked}&nbsp;hrs</span> in Ranked, and</p>

                    <p><span className="emphasize-lg">{totalTime - totalTimeInRanked - totalTimeInRift}&nbsp;hrs</span> in Other Game Modes.</p>
                </div>


            </div>


            <h2 className="subtitle">That's equivalent to <span className="emphasize">{Math.floor(totalTime / 8)} workdays</span> or for <span className="emphasize">{Math.floor(totalTime / 24)} full days</span>, for better or worse.</h2>

        </StatCard>


    )
}