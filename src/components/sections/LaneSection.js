import { useStatsResources } from '../../resources/UserResourceContext.js';

import RoleGraph from './../graphs/RoleGraph.js';
import PingGraph from './../graphs/PingGraph.js';
import ObjectiveBubbleChart from './../graphs/ObjectiveBubbleChart.js';

import TableEntry from './../common/TableEntry.js';



import StatCard from '../common/StatCard.js';

import './LaneSection.css'
import StatGrid from '../common/StatGrid.js';

function filterByRole(arr) {

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


export default function LaneSection({ puuid }) {
    const { role, cs, pings, objectives } = useStatsResources();
    const csArr = cs.read();
    const objectiveArr = objectives.read()[0];
    const pingArr = pings.read()[0];
    delete pingArr['Command Ping']
    const roleArr = filterByRole(role.read());


    const playedRoles = roleArr.filter(r => r.games > 0).sort((a, b) => b.games - a.games);
    const unplayedRoles = roleArr.filter(r => r.games === 0);

    objectiveArr['_id'] = 0;
    const totalObjectives = Object.values(objectiveArr).reduce((a, c) => parseInt(a) + parseInt(c), 0);
    const totalRoleGames = roleArr.reduce((sum, role) => sum + role.games, 0);

    const totalPings = Object.values(pingArr).reduce((a, c) => parseInt(a) + parseInt(c), 0);
    const maxPing = Object.keys(pingArr).reduce((a, b) => pingArr[a] > pingArr[b] ? a : b);


    return (
        <>
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

            <StatCard
                eyebrow={"You stayed busy, with an average of"}
                title={`${(Math.floor((csArr.stats[0].totalMinions + csArr.stats[0].totalJungleMinions) / csArr.stats[0].numGames * 10) / 10).toLocaleString()} CS `}
                subtitle={"per game"}
            >

                <StatGrid items={[
                    { label: "Minions Killed", value: `${csArr.stats[0].totalMinions.toLocaleString()}` },
                    { label: "Jungle Monsters Killed", value: `${csArr.stats[0].totalJungleMinions.toLocaleString()}` },

                ]} />

                <br />

                <div>
                    <p className='tableLabel'>Your Games With The Highest CS</p>

                    {csArr.bestCs.map((game, idx) => <TableEntry key={`Highest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}

                </div>




                <div >

                    <h2>
                        Games under 100CS
                    </h2>

                    <p className='emphasize-lg'>{csArr.stats[0].lowCsGames.toLocaleString()} games</p>
                    <p className='subtitle'>
                        * This excludes special game modes, and games that lasted less than 15 minutes.
                    </p>
                </div>

                {/* <div>
                        {csArr.worstCs.map((game, idx) => <TableEntry key={`Lowest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}
                        <p className='tableLabel'>Your Games With The Lowest CS</p>
                    </div> */}

            </StatCard>


            <StatCard
                eyebrow={"You helped take down tons of objectives, averaging"}
                title={`${(Math.floor(totalObjectives / totalRoleGames * 10) / 10).toLocaleString()} per game`}
                subtitle={`(${totalObjectives.toLocaleString()} objectives across ${totalRoleGames.toLocaleString()} games)`}
            >

                <ObjectiveBubbleChart objectives={{
                    barons: objectiveArr["barons"],
                    dragons: objectiveArr["dragons"],
                    riftHeralds: objectiveArr["riftHeralds"],
                    voidGrubs: objectiveArr["voidGrubs"],
                    atakhan: objectiveArr["atakhans"],
                    towers: objectiveArr["towers"],
                    inhibitors: objectiveArr["inhibitors"]
                }} />

            </StatCard>
            <StatCard
                eyebrow={"You loved to alert your teammates, with a total of"}
                title={`${totalPings.toLocaleString()} pings`}
                subtitle={`"${maxPing}" was your favorite · ${Math.floor(pingArr[maxPing] / totalPings * 100)}% of all pings`}
            >

                <div style={{ width: "90%", margin: "0 auto" }}>
                    {pingArr && <PingGraph pings={Object.values(pingArr)} labels={Object.keys(pingArr)} />}

                </div>

                <br />
                <p className='subtitle'>Let's just hope they listened.</p>
            </StatCard>
        </>
    );
}
