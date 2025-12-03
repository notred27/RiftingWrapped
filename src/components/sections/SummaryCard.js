import "./SummaryCard.css";
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


export default function SummaryCard({ year = "2025" }) {
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
                        <div style={{ marginTop: 2 }}>
                            <span className="appName" style={{ background: "rgba(255,255,255,0.03)", fontWeight: 800 }}>
                                RIFTING WRAPPED {year}
                            </span>
                        </div>
                    </div>
                </div>



                <div className="stats-grid">


                    <div
                        style={{
                            height: "140px",
                            width: "100%",

                            overflowY: "hidden",
                            position: "relative",
                            borderRadius: "10px",
                            marginBottom: "10px",
                            gridArea: "1 / 1 / 2 / 3"
                        }}
                    >
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChamp[0]}_0.jpg`}
                            alt={`most played champ :${topChamp[0]}`}
                            style={{
                                width: "300px",
                                // height: "100px",
                                borderRadius: "2px",
                                objectFit: "cover",
                                transform: "translateY(-10%)"
                            }}
                        />
                        <div className="overlay-badge">{topChamp[0].toUpperCase()} • {topChamp[1]} Games</div>

                    </div>


                    <div id="game-mode-stats" className="stat-card">
                        <div className="stat-label">Top Game Modes</div>

                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", alignItems: "center" }}>

                            <div className="stat-number">Swiftplay <div className="label">205 games</div></div>
                            <div className="stat-number">Arena <div className="label">138 games</div></div>
                            <div className="stat-number">Brawl <div className="label">27 games</div></div>
                        </div>
                    </div>


                    <div id="role-stats" className="stat-card">
                        <div className="stat-label">Favorite Role</div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", alignItems: "center", gap: "4px" }}>

                            <img src={Roles} style={{ width: "80px" }} alt={`most played role: `} />
                            <div className="stat-number">Jungle</div>
                            <div className="label">138 games (50% WR)</div>
                        </div>

                    </div>


                    <div id="kill-stats" className="big-stat">
                        <div className="big-stat__text">
                            <div className="num">2,223</div>
                            <div className="label" style={{ paddingBottom: "4px" }}>Kills</div>
                        </div>


                        <img src={Kills} style={{ width: "90%", borderRadius: "6px" }} alt="kills heatmap" />

                    </div>

                    <div id="death-stats" className="big-stat">
                        <div className="big-stat__text">

                            <div className="num">3,342</div>
                            <div className="label" style={{ paddingBottom: "4px" }}>Deaths</div>
                        </div>
                        <img src={Deaths} style={{ width: "90%", borderRadius: "6px" }} alt="deaths heatmap" />

                    </div>

                    <div id="ping-stats" className="stat-card">
                        <div className="stat-label">Most Used Ping</div>
                        <div className="stat-number">On My Way</div>
                    </div>

                    <div id="hour-stats" className="stat-card">
                        <div className="stat-label">Hours Played</div>
                        <div className="stat-number">169 hrs</div>
                    </div>

                </div>



                <div className="card-footer">
                    <img src="/favicon-32x32.png" alt="logo" style={{ height: "16px", width: "16px", paddingBottom: "2px" }} />
                    <div>RIFTINGWRAPPED.COM</div>
                </div>
            </div>
        </div>
    );
}
