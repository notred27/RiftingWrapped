import "./temp.css";
import Roles from "./../../images/tmpRoles.png"
import Kills from "./../../images/tmpKills.png"
import Deaths from "./../../images/tmpDeaths.png"

import { useStatsResources } from "../../resources/UserResourceContext.js";


function calcTopChamp(data) {
        const champData = data.read();
        const champDict = {}

        champData.forEach(({ champion, count }) => {
            champDict[champion] = count
        })

        const champNames = Object.keys(champDict)
        const champVals = champNames.map(name => champDict[name])

        const sorted = champNames
            .map((name, i) => ({ name, count: champVals[i] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        const sortedNames = sorted.map(item => item.name)
        const sortedCounts = sorted.map(item => item.count)

        return [sortedNames[0], sortedCounts[0]]
    }


export default function SummarySection({ year = "2025" }) {
    const { champ, user } = useStatsResources();
    const userInfo = user.read();
    const topChamp = calcTopChamp(champ);

    return (
        <div className="summary-wrapper">
            <div className="summary-card">
                <div className="top-row">
                    <img
                        className="avatar"
                        src={userInfo.icon}
                        alt="avatar"
                    />
                    <div style={{ textAlign: "left" }}>
                        <p className="username">
                            {userInfo.displayName.toUpperCase()}<span className="tag">#{userInfo.tag.toUpperCase()}</span>
                        </p>
                        <div style={{ marginTop: 6 }}>
                            <span style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 10, fontSize: 12, fontWeight: 800 }}>
                                RIFTING WRAPPED {year}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        width: "340px",
                        height: "180px",
                        overflow: "hidden",
                        position: "relative",
                        borderRadius: "4px"
                    }}
                >
                    <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp[0]}_0.jpg`}
                        alt="Warwick"
                        style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            transform: "translateY(-30px)"
                        }}
                    />
                    <div className="overlay-badge">{topChamp[0].toUpperCase()} • {topChamp[1]} Games</div>

                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Top Game Modes</div>
                        <div className="stat-number">Swiftplay <div className="label">205 games</div></div>
                        <div className="stat-number">Arena <div className="label">138 games</div></div>
                        <div className="stat-number">Brawl <div className="label">27 games</div></div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Favorite Role</div>
                        <div className="stat-number">Jungle</div>

                        <img src={Roles} />
                    </div>
                </div>

                <div className="big-stats">
                    <div className="big-stat">
                        <div className="num">2,223</div>
                        <div className="label">Kills</div>

                        <img src={Kills} />

                    </div>

                    <div className="big-stat">
                        <div className="num">3,342</div>
                        <div className="label">Deaths</div>

                        <img src={Deaths} />

                    </div>
                </div>

                <div className="small-grid">
                    <div className="stat-card">
                        <div className="stat-label">Most Used Ping</div>
                        <div className="stat-number">On My Way</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label">Hours Played</div>
                        <div className="stat-number">169 hrs</div>
                    </div>
                </div>

                <div className="card-footer">
                    <img src="/favicon-32x32.png" alt="logo" style={{ height: 36 }} />
                    <div>RIFTINGWRAPPED.COM</div>
                </div>
            </div>
        </div>
    );
}
