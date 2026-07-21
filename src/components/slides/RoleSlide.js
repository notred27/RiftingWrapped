import { useStatsResources } from '../../resources/UserResourceContext.js';

import RoleGraph from './../graphs/RoleGraph.js';
import StatCard from '../layout/StatCard.js';

import './LaneSection.css';


export function filterByRole(arr) {

    // Filter games by role, should move to backend
    const roleDicts = {
        "TOP": { wins: 0, games: 0 },
        "MIDDLE": { wins: 0, games: 0 },
        "JUNGLE": { wins: 0, games: 0 },
        "BOTTOM": { wins: 0, games: 0 },
        "UTILITY": { wins: 0, games: 0 },
    };

    // Filter out empty _id
    const filtered = arr.filter(item => item._id !== "");

    filtered.forEach(role => {
        const key = role._id;
        if (roleDicts[key]) {
            roleDicts[key].games = role.count;
            roleDicts[key].wins = role.winsInRole;
        }
    });

    const labels = ['Top', 'Mid', 'Jungle', 'ADC', 'Support'];
    return Object.keys(roleDicts).map((key, idx) => {
        const winRate = roleDicts[key].games > 0
            ? Math.round(roleDicts[key].wins / roleDicts[key].games * 100)
            : 0;

        return {
            label: labels[idx],
            ...roleDicts[key],
            winRate
        };
    }).sort((a, b) => b.games - a.games);
}


const ROLE_COLORS = {
    Top: '#D5896F',
    Mid: '#DAB785',
    Jungle: '#70A288',
    ADC: '#04395E',
    Support: '#031D44',
};


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
                                    style={{ background: ROLE_COLORS[role.label] || '#3a3a37' }}
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
