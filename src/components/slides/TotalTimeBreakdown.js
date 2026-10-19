import { useState } from "react";
import { Link } from "react-router-dom";

import { useStatsResources } from "../../resources/UserResourceContext.js";
import { trackEvent } from "../../resources/analytics.js";

import SharePreviewCard from "../common/SharePreviewCard.js";
import StatCard from "../layout/StatCard.js";


/**
 * Last slide. For the player themselves it's "share your Wrapped"; for a
 * friend who arrived from a shared link (`isOwner` false) it leads with
 * "make your own" instead, which is how shared links turn into new sign-ups.
 */
export default function TotalTimeBreakdown({ puuid, year, isOwner = true }) {
    const { cardPreview, timeBreakdownStats } = useStatsResources();
    const cardInfo = cardPreview.read();
    const timeArr = timeBreakdownStats.read()[0];

    const totalTime = Math.floor((timeArr?.totalPlaytime ?? 0) / 3600);



    // Served by the API's share page (proxied through the site's domain), which
    // gives Discord/X/etc. a preview image of these stats, then redirects here.
    const shareUrl = `https://www.riftingwrapped.com/s/${year}/${puuid}`;
    const shareText = isOwner
        ? `I spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`
        : `${cardInfo["username"]} spent over ${totalTime} hours on League of Legends this year! #LeagueOfLegends #RiftingWrapped`;

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

    const popup = (url, height = 500, width = 600) => (e) => {
        e.preventDefault();
        window.open(url, '', `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${height},width=${width}`);
    };

    const networks = [
        { method: 'reddit', label: 'Reddit', url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, h: 600, w: 800 },
        { method: 'twitter', label: 'X / Twitter', url: `https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
        { method: 'facebook', label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    ];

    return (
        <StatCard
            eyebrow={isOwner ? "Impressed with your stats?" : `Liked ${cardInfo["username"]}'s recap?`}
            title={isOwner ? "Share your Wrapped" : "Your turn!"}
            subtitle={isOwner
                ? "Send your recap to friends, or post it for the world to see."
                : "Enter your Riot ID to see your own year on the Rift. It's free and takes a few seconds."}
            media={
                <SharePreviewCard
                    username={cardInfo["username"]}
                    hoursPlayed={cardInfo["hoursPlayed"]}
                    champName={cardInfo["champName"]}
                    shareUrl={shareUrl}
                    year={year}
                />
            }
        >
            {/* stopPropagation: taps here must not also trigger the deck's edge-tap navigation */}
            <div className="share-actions" onClick={(e) => e.stopPropagation()}>
                <div className="share-actions__primary">
                    {!isOwner &&
                        <Link className="btn btn--primary" to="/" onClick={() => trackEvent('viral_cta_click', { from: 'share_slide_visitor' })}>
                            Make your own
                        </Link>
                    }
                    {canNativeShare &&
                        <button type="button" className={`btn ${isOwner ? 'btn--primary' : 'btn--secondary'}`} onClick={nativeShare}>
                            Share
                        </button>
                    }
                    <button type="button" className={`btn ${canNativeShare || !isOwner ? 'btn--secondary' : 'btn--primary'}`} onClick={copyLink} aria-live="polite">
                        {copied ? "Link copied!" : "Copy link"}
                    </button>
                </div>

                {isOwner && <div className="share-actions__networks">
                    {networks.map(n => (
                        <a
                            key={n.method}
                            href={n.url}
                            className="btn btn--secondary"
                            target="_blank"
                            rel="noopener nofollow noreferrer"
                            onClick={(e) => { trackEvent('share', { method: n.method }); popup(n.url, n.h, n.w)(e); }}
                        >
                            {n.label}
                        </a>
                    ))}
                </div>}

                {isOwner &&
                    <p className="slide-note">
                        Want to see a friend's recap? <Link className="text-link" to="/" onClick={() => trackEvent('viral_cta_click', { from: 'share_slide' })}>Look them up</Link>
                    </p>
                }
            </div>
        </StatCard>
    )
}
