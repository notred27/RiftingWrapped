import { useStatsResources } from "./../../resources/UserResourceContext.js";
import './styles.css'
import StatCard from "../layout/StatCard.js";

export default function UserIntro({ year }) {
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

            <p className="intro-headline">
                Let's dive into your <strong>League of Legends</strong> performance in <strong>{year}</strong>!
            </p>

            <span className="intro-swipe-cue">
                Swipe to continue
                <span className="intro-swipe-cue__chevron" aria-hidden="true">›</span>
            </span>
        </StatCard>
    );
}