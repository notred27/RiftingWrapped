import { useEffect, useState } from 'react';

import TableEntry from './../common/TableEntry.js';
import RoleGraph from './../graphs/RoleGraph.js';
import ObjectiveBubbleChart from './../graphs/ObjectiveBubbleChart.js';
import PingGraph from './../graphs/PingGraph.js';
import SectionImage from './../common/SectionImage.js';

export default function LaneSection({ puuid, year }) {
    const [roleArr, setRoleArr] = useState([]);
    const [csArr, setCsArr] = useState([]);
    const [objectiveArr, setObjectiveArr] = useState([]);
    const [pingArr, setPingArr] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRoles() {
            try {
                const [roles, cs, objectives, pings] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/role/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/cs/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/objectives/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/pings/${puuid}?year=${year}`),
                ]);
                if (!roles.ok || !cs.ok || !objectives.ok || !pings.ok) {
                    throw new Error('Error from database.');
                }

                const [roleData, csData, objectivesData, pingData] = await Promise.all([
                    roles.json(),
                    cs.json(),
                    objectives.json(),
                    pings.json()
                ]);

                const roleDicts = {
                    "TOP": { wins: 0, games: 0 },
                    "MIDDLE": { wins: 0, games: 0 },
                    "JUNGLE": { wins: 0, games: 0 },
                    "BOTTOM": { wins: 0, games: 0 },
                    "UTILITY": { wins: 0, games: 0 },
                };

                // Filter out empty _id
                const filtered = roleData.filter(item => item._id !== "");

                filtered.forEach(role => {
                    const key = role._id;
                    if (roleDicts[key]) {
                        roleDicts[key].games = role.count;
                        roleDicts[key].wins = role.winsInRole;
                    }
                });

                const labels = ['Top', 'Mid', 'Jungle', 'ADC', 'Support'];
                const arr = Object.keys(roleDicts).map((key, idx) => {
                    const winRate = roleDicts[key].games > 0
                        ? Math.round(roleDicts[key].wins / roleDicts[key].games * 100)
                        : 0;

                    return {
                        label: labels[idx],
                        ...roleDicts[key],
                        winRate
                    };
                }).sort((a, b) => b.games - a.games);

                setRoleArr(arr);
                setCsArr(csData);
                setObjectiveArr(objectivesData[0]);
                setPingArr(pingData[0]);
            } catch (error) {
                console.error('Failed to fetch lane section data:', error);
                setRoleArr([]);
                setCsArr([]);
                setObjectiveArr([]);
                setPingArr([]);
            } finally {
                setLoading(false);
            }
        }

        if (puuid) {
            fetchRoles();
        }


    }, [puuid, year]);

    if (loading) return;
    if (!roleArr || roleArr.length === 0 || !csArr || !objectiveArr) return;

    // const labels = ["Get Back", "Push", "On My Way", "All In", "Assist Me", "Need Vision", "Missing?", "Enemy Vision"]



    return (
        <>
            <SectionImage 
                imgUrl={`/images/banner2.webp`}
                offset = {"40"}
            />

            <h2 className='emphasize'>Let's see how you did in your lane this year</h2>

            <h2 style={{ textAlign: "center" }}>
                This year you rocked a variety of roles,<br />
                but it's undeniable that<br />
                <span className='emphasize' style={{ fontSize: "40px" }}>
                    {roleArr[0]?.label || "a lane"}
                </span><br />
                was your domain!
            </h2>

            <div id='PositionBreakdownContainer'>
                <RoleGraph roles={roleArr} />


                <span>
                    <p style={{ margin: "5px", fontSize: "20px" }}>You played as:</p>
                    {roleArr.map((role, idx) => {
                        const Tag = `h${Math.min(idx + 1, 6)}`;
                        return (
                            <Tag className='roleHeader' key={role.label}>
                                {role.label} for {role.games} games ({role.winRate}% WR)
                            </Tag>
                        );
                    })}
                </span>
            </div>

            <div className='splitColumn'>


                <div>
                    {csArr.bestCs.map((game, idx) => <TableEntry key={`Highest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}

                    <p className='tableLabel'>Your Games With The Highest CS</p>
                </div>


                <div className="verticalSpacing" style={{ textAlign: "right" }}>
                    <h2>
                        You hit new highs with
                        <br />
                        your CS this year, killing
                        <br />
                        <span className='emphasize'>{csArr.stats[0].totalMinions.toLocaleString()} Minions</span> and
                        <br />
                        <span className='emphasize'>{csArr.stats[0].totalJungleMinions.toLocaleString()} Jungle Monsters!</span>
                    </h2>


                    <h2>
                        That's an average of
                        <br />
                        <span className='emphasize'>{(Math.floor((csArr.stats[0].totalMinions + csArr.stats[0].totalJungleMinions) / csArr.stats[0].numGames * 10) / 10).toLocaleString()}</span> total CS per game.
                    </h2>

                </div>
            </div>


            <div className='splitColumn'>

                <div className='verticalSpacing' >
                    <h2>
                        However, you also hit new
                        <br />
                        lows in <span className='emphasize'>{csArr.stats[0].lowCsGames.toLocaleString()} games</span> where
                        <br />
                        you had <span className='emphasize'>less than 100 cs.</span>
                    </h2>

                    <h2>
                        This excludes special gamemodes,
                        <br />
                        games that lasted less than 15 minutes.
                    </h2>
                </div>

                <div>
                    {csArr.worstCs.map((game, idx) => <TableEntry key={`Lowest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}

                    <p className='tableLabel'>Your Games With The Lowest CS</p>
                </div>
            </div>


            <div className='splitColumn'>
                <div>
                    <h2 className='emphasize'>You also helped to take down tons of objectives,</h2>

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

                <div>
                    <h2 className='emphasize' style={{ textAlign: "center" }}>
                        and loved to ping your teammates.
                        <br />
                        Let's just hope they listened.
                    </h2>

                    <div style={{ width: "400px", height: "500px" }}>
                        {pingArr && <PingGraph pings={Object.values(pingArr)} labels={Object.keys(pingArr)} />}
                    </div>
                </div>

            </div>


        </>
    );
}
