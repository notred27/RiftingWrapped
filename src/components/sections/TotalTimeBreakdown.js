import { useStatsResources } from "../../resources/UserResourceContext.js";

import TotalTimeGraph from "../graphs/TotalTimeGraph.js"
import SectionImage from '../common/SectionImage.js';

import SharePreviewCard from "../common/SharePreviewCard.js";
import SummaryCard from "./SummaryCard.js";
import StatCard from "../common/StatCard.js";


export default function TotalTimeBreakdown({ puuid, year }) {
    const { cardPreview, timeBreakdownStats } = useStatsResources();
    const cardInfo = cardPreview.read();
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


    // For generating posts
    const shareUrl = `https://riftingwrapped.onrender.com/share/${puuid}?year=2026`;
    const shareText = `I spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`;

    return (
        <>
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

            <StatCard
                eyebrow={"Impressed with your stats?"}
                title={"Share your Wrapped!"}

            >
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px" }}>

                    <div >
                        <SharePreviewCard
                            username={cardInfo["username"]}
                            hoursPlayed={cardInfo["hoursPlayed"]}
                            champName={cardInfo["champName"]}
                            shareUrl={`https://riftingwrapped.onrender.com/share/${puuid}`}
                        />
                    </div>

                    <div className="shareButtonRow" >
                        <button
                            className="shareButton"
                            onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                alert("Copied share link!");
                            }}
                        >
                            Copy Link
                        </button>

                        <button
                            href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(
                                    `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
                                    '',
                                    'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=800'
                                );
                            }}
                            className="shareButton reddit"
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                        >
                            Share on Reddit
                        </button>

                        <button
                            href={`https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(
                                    `https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                                    '',
                                    'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=600'
                                );
                            }}
                            className="shareButton twitter"
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                        >
                            Share on Twitter
                        </button>

                        <button
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(
                                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                                    '',
                                    'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=600'
                                );
                            }}
                            className="shareButton facebook"
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                        >
                            Share on Facebook
                        </button>
                    </div>
                </div>
                <br />


                <h2 className="subtitle">Want to see your own recap? <a className="emphasize" style={{ textDecoration: "underline", cursor: "pointer" }} href="/">Try Rifting Wrapped out now!</a></h2>

            </StatCard>
        </>
    )
}