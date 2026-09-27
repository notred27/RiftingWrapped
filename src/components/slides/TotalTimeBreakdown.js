import { useState } from "react";

import { useStatsResources } from "../../resources/UserResourceContext.js";
import { trackEvent } from "../../resources/analytics.js";

import SharePreviewCard from "../common/SharePreviewCard.js";
import StatCard from "../layout/StatCard.js";


export default function TotalTimeBreakdown({ puuid, year }) {
    const { cardPreview, timeBreakdownStats } = useStatsResources();
    const cardInfo = cardPreview.read();
    const timeArr = timeBreakdownStats.read()[0];

    const totalTime = Math.floor(timeArr["totalPlaytime"] / 3600);



    // For generating posts
    const shareUrl = `https://riftingwrapped.onrender.com/share/${puuid}?year=${year}`;
    const shareText = `I spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`;

    const [copied, setCopied] = useState(false);
    const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    const nativeShare = async () => {
        trackEvent('share', { method: 'native' });
        try {
            await navigator.share({ title: "My Rifting Wrapped", text: shareText, url: shareUrl });
        } catch {
            // User dismissed the share sheet - nothing to do.
        }
    };

    const copyLink = async () => {
        trackEvent('share', { method: 'copy_link' });
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy your share link:", shareUrl);
        }
    };

    return (

        <StatCard
            eyebrow={"Impressed with your stats?"}
            title={"Share your Wrapped!"}

        >
            <div className="slide-split">

                <div >
                    <SharePreviewCard
                        username={cardInfo["username"]}
                        hoursPlayed={cardInfo["hoursPlayed"]}
                        champName={cardInfo["champName"]}
                        shareUrl={shareUrl}
                        year={year}
                    />
                </div>

                <div className="shareButtonRow" onClick={(e) => e.stopPropagation()}>
                    {canNativeShare &&
                        <button type="button" className="shareButton" onClick={nativeShare}>
                            Share
                        </button>
                    }
                    <button type="button" className="shareButton" onClick={copyLink} aria-live="polite">
                        {copied ? "Copied!" : "Copy Link"}
                    </button>

                    <a
                        href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
                        onClick={(e) => {
                            e.preventDefault();
                            trackEvent('share', { method: 'reddit' });
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
                            trackEvent('share', { method: 'twitter' });
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
                            trackEvent('share', { method: 'facebook' });
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


            <h2 className="subtitle">Want to see your own recap? <a className="emphasize" style={{ textDecoration: "underline", cursor: "pointer" }} href="/" onClick={() => trackEvent('viral_cta_click', { from: 'share_slide' })}>Try Rifting Wrapped out now!</a></h2>

        </StatCard>

    )
}