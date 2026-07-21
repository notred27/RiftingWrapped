import { useStatsResources } from "../../resources/UserResourceContext.js";

import SharePreviewCard from "../common/SharePreviewCard.js";
import StatCard from "../layout/StatCard.js";


export default function TotalTimeBreakdown({ puuid, year }) {
    const { cardPreview, timeBreakdownStats } = useStatsResources();
    const cardInfo = cardPreview.read();
    const timeArr = timeBreakdownStats.read()[0];

    const totalTime = Math.floor(timeArr["totalPlaytime"] / 3600);



    // For generating posts
    const shareUrl = `https://riftingwrapped.onrender.com/share/${puuid}?year=2026`;
    const shareText = `I spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`;

    return (

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
                        shareUrl={shareUrl}
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

                    <a
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
                    </a>

                    <a
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
                    </a>

                    <a
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
                    </a>
                </div>
            </div>
            <br />


            <h2 className="subtitle">Want to see your own recap? <a className="emphasize" style={{ textDecoration: "underline", cursor: "pointer" }} href="/">Try Rifting Wrapped out now!</a></h2>

        </StatCard>

    )
}