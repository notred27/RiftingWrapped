import "./SummaryCard.css";

import { useStatsResources } from "../../resources/UserResourceContext.js";
import { calcTopChamps } from "./ChampSection.js"
import { filterByRole } from "./RoleSlide.js"
import RoleGraph from "../graphs/RoleGraph.js"
import MapOverlay from "../graphs/MapOverlay.js"
import ObjectiveBubbleChart from "../graphs/ObjectiveBubbleChart.js"

export default function SummaryCard({ year = "2025" }) {
    const { champ, user, role, combatTotals, timeBreakdownStats, objectives } = useStatsResources();
    const userInfo = user.read();

    const [sortedNames, sortedCounts] = calcTopChamps(champ.read())
    const topChampName = sortedNames[0]
    const topChampCount = sortedCounts[0];

    const roleArr = filterByRole(role.read());
    const topRole = roleArr[0];

    const combatStats = combatTotals.read()[0];

    const totalPlaytime = Math.floor((timeBreakdownStats.read()[0]?.totalPlaytime ?? 0) / 3600);

    const objectiveArr = objectives.read()[0] || {};

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
                            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChampName}_0.jpg`}
                            alt={`most played champ :${topChampName}`}
                            style={{
                                width: "300px",
                                // height: "100px",
                                borderRadius: "2px",
                                objectFit: "cover",
                                transform: "translateY(-10%)"
                            }}
                        />
                        <div className="overlay-badge">{topChampName.toUpperCase()} • {topChampCount} Games</div>

                    </div>


                    <div id="game-mode-stats" className="stat-card">
                        <div className="stat-label">Top Objectives</div>

                        <ObjectiveBubbleChart objectives={{
                            barons: objectiveArr["barons"],
                            dragons: objectiveArr["dragons"],
                            riftHeralds: objectiveArr["riftHeralds"],
                            voidGrubs: objectiveArr["voidGrubs"],
                            atakhan: objectiveArr["atakhans"],
                            towers: objectiveArr["towers"],
                            inhibitors: objectiveArr["inhibitors"]
                        }} />
                    </div>


                    <div id="role-stats" className="stat-card">
                        <div className="stat-label">Favorite Role</div>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", alignItems: "center", gap: "4px" }}>

                            <RoleGraph roles={roleArr} />
                            <div className="stat-number">{topRole?.label || "Everywhere"}</div>
                            <div className="label">{topRole?.games || 0} games ({topRole?.winRate || 0}% WR)</div>
                        </div>

                    </div>


                    <div id="kill-stats" className="big-stat">
                        <div className="big-stat__text">
                            <div className="num">{(combatStats?.totalKills ?? 0).toLocaleString()}</div>
                            <div className="label" style={{ paddingBottom: "4px" }}>Kills</div>
                        </div>

                        <MapOverlay type="kills" />

                    </div>

                    <div id="death-stats" className="big-stat">
                        <div className="big-stat__text">

                            <div className="num">{(combatStats?.totalDeaths ?? 0).toLocaleString()}</div>
                            <div className="label" style={{ paddingBottom: "4px" }}>Deaths</div>
                        </div>
                        <MapOverlay type="deaths" />

                    </div>

                    <div id="ping-stats" className="stat-card">
                        <div className="stat-label">Most Used Ping</div>
                        <div className="stat-number">On My Way</div>
                    </div>

                    <div id="hour-stats" className="stat-card">
                        <div className="stat-label">Hours Played</div>
                        <div className="stat-number">{totalPlaytime} hrs</div>
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
