import { useStatsResources } from '../../resources/UserResourceContext.js';
import { ROLE_COLORS, ROLE_COLOR_UNPLAYED, filterByRole } from '../../resources/roles.js';

import RoleGraph from './../graphs/RoleGraph.js';
import StatCard from '../layout/StatCard.js';

import './LaneSection.css';


export default function RoleSlide({ puuid }) {
    const { role } = useStatsResources();
    const roleArr = filterByRole(role.read());
    const playedRoles = roleArr.filter(r => r.games > 0).sort((a, b) => b.games - a.games);
    const unplayedRoles = roleArr.filter(r => r.games === 0);

    return (
        <StatCard
            eyebrow={"Out of all the lanes"}
            title={`${roleArr[0]?.label || "EVERYWHERE"}`}
            subtitle={"was your home"}
        >

            <div className="position-breakdown-body">
                <RoleGraph roles={roleArr} />

                <div className="position-breakdown-legend">
                    {playedRoles.map(role => (
                        <div className="position-breakdown-row" key={role.label}>
                            <span className="position-breakdown-role">
                                <span
                                    className="position-breakdown-swatch"
                                    style={{ background: ROLE_COLORS[role.label] || ROLE_COLOR_UNPLAYED }}
                                />
                                {role.label}
                            </span>
                            <span className="position-breakdown-stats">
                                {role.games} games · <span style={{ color: ROLE_COLORS[role.label], fontWeight: 500 }}>{role.winRate}% WR</span>
                            </span>
                        </div>
                    ))}

                    {unplayedRoles.length > 0 && (
                        <div className="position-breakdown-row position-breakdown-row-muted">
                            <span className="position-breakdown-role">
                                <span className="position-breakdown-swatch position-breakdown-swatch-muted" />
                                {unplayedRoles.map(r => r.label).join(' / ')}
                            </span>
                            <span className="position-breakdown-stats">0 games</span>
                        </div>
                    )}
                </div>
            </div>
        </StatCard>
    );
}
