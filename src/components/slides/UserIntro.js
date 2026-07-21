import { useStatsResources } from "./../../resources/UserResourceContext.js";
import './UserIntro.css'
import './styles.css'
import StatCard from "../layout/StatCard.js";

export default function UserIntro({ year }) {
    const { user } = useStatsResources();
    const userInfo = user.read();

    return (
        <StatCard className="intro-card">
            <p className="intro-eyebrow">Hey there</p>

            <div className="intro-identity">
                <img
                    src={userInfo.icon}
                    alt="user icon"
                    className="intro-icon"
                />
                <div className="intro-name-block">
                    <h1 className="intro-name">{userInfo.displayName}</h1>
                    <p className="subtitle intro-tag">
                        #{userInfo.tag} · level {userInfo.level}
                    </p>
                </div>
            </div>

            <h2 className="intro-headline">
                Let's dive into your League of Legends performance in {year}
            </h2>

            <span className="capsule">Rifting Wrapped {year}</span>
        </StatCard>
    );
}