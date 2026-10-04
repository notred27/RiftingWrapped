import { useStatsResources } from "./../../resources/UserResourceContext.js";
import './styles.css'
import StatCard from "../layout/StatCard.js";

/**
 * `waiting` is for the page shown while a new player's matches are still being
 * processed: there's no deck to swipe through yet, so the "let's dive in"
 * headline and swipe cue are left out.
 */
export default function UserIntro({ year, waiting = false }) {
    const { user } = useStatsResources();
    const userInfo = user.read();

    return (
        <StatCard className="intro-card">
            {/* <span className="intro-badge">
                <span className="capsule">Rifting Wrapped {year}</span>
            </span> */}

            <div className="intro-avatar-wrap">
                <img
                    src={userInfo.icon}
                    alt="user icon"
                    className="intro-avatar"
                />
                <span className="intro-level-badge">Lvl {userInfo.level}</span>
            </div>

            <p className="intro-eyebrow">Hey there</p>
            <h1 className="intro-name">{userInfo.displayName}#{userInfo.tag}</h1>

            {!waiting && <>
                <p className="intro-headline">
                    Let's dive into your <strong>League of Legends</strong> performance in <strong>{year}</strong>!
                </p>

                <span className="intro-swipe-cue">
                    Swipe to continue
                    <span className="intro-swipe-cue__chevron" aria-hidden="true">›</span>
                </span>
            </>}
        </StatCard>
    );
}