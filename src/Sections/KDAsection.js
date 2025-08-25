import { useEffect, useState } from 'react';

import TableEntry from './../TableEntry.js';
import KDAgraph from './../graphs/KDAgraph.js'
import MapOverlay from './../graphs/MapOverlay.js';

export default function KDAsection({ puuid, year }) {
    const [loading, setLoading] = useState(true);
    const [highestKillGames, setHighestKillGames] = useState(null);

    const [highestDeathGames, setHighestDeathGames] = useState(null);

    const [combatStats, setCombatStats] = useState(null);

    const [killFreqArr, setKillFreqArr] = useState(null);
    const [deathFreqArr, setDeathFreqArr] = useState(null);

    const [kdaGames, setKdaGames] = useState(null);



    useEffect(() => {
        if (!puuid) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [deathsRes, killsRes, totalsRes, killFreq, deathFreq, kdaRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/highestDeathGames/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/highestKillGames/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/matchTotals/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/killFrequency/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/deathFrequency/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/kda/${puuid}?year=${year}`),
                ]);

                if (!deathsRes.ok || !killsRes.ok || !totalsRes.ok || !killFreq.ok || !deathFreq.ok || !kdaRes.ok) {
                    throw new Error('One or more network responses were not ok');
                }

                const [deathData, killData, totalsData, killFreqData, deathFreqData, kdaData] = await Promise.all([
                    deathsRes.json(),
                    killsRes.json(),
                    totalsRes.json(),
                    killFreq.json(),
                    deathFreq.json(),
                    kdaRes.json(),


                ]);

                setHighestDeathGames(deathData);
                setHighestKillGames(killData);
                setCombatStats(totalsData[0]);
                setKillFreqArr(killFreqData);
                setDeathFreqArr(deathFreqData);
                setKdaGames(kdaData);

            } catch (error) {
                console.error('Failed to fetch game data:', error);
                setHighestDeathGames([]);
                setHighestKillGames([]);
                setCombatStats([]);
                setKillFreqArr([]);
                setDeathFreqArr([]);
                setKdaGames([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [puuid, year]);



    if (loading) return;
    if (!combatStats || combatStats.length === 0) return;

    return (
        <>
            <h1 className='emphasize'>Lets take a look at some of your highlights</h1>

            <div className='splitColumn'>
                <div>
                    {highestKillGames.map((game, idx) => <TableEntry key = {`Highest_Kill_Entry_${idx}`} puuid={puuid} match={game}></TableEntry>)}
                    <p className='tableLabel'>Your Games With The Most Kills</p>
                </div>

                <div className='verticalSpacing'>
                    <h2>
                        You killed <span className='emphasize'>{combatStats.totalKills.toLocaleString()}</span> champs,
                        <br />
                        averaging <span className='emphasize'>{Math.floor(combatStats.totalKills / combatStats.numGames * 100) / 100}</span> kills per game!
                    </h2>

                    <h2>
                        These stats are a result of <span className='emphasize'>{combatStats.totalKillingSprees}</span> killing
                        <br />
                        sprees, and the <span className='emphasize'>{combatStats.totalTowerTakedowns}</span> enemies
                        <br />
                        you killed under their own turrets.
                    </h2>

                    <h2>
                        Of the <span className='emphasize'>{combatStats.totalPositiveGames}</span> games where you went positive,
                        <br />
                        you won <span className='emphasize'>{Math.floor(combatStats.positiveWR / combatStats.totalPositiveGames * 10000) / 100}%</span> of the time.
                    </h2>

                </div>
            </div>


            <div className='splitColumn'>
                <div className='verticalSpacing' style={{textAlign: "right" }}>
                    <h2>
                        However, you were killed
                        <br />
                        <span className='emphasize'>{combatStats.totalDeaths.toLocaleString()}</span> times by other
                        <br />
                        players this year.
                    </h2>

                    <h2>
                        Due to this, you spent&nbsp;
                        {Math.round(combatStats.totalTimeDead / 60) < 300 ?
                            <span className='emphasize'>{Math.round(combatStats.totalTimeDead / 60)} minutes</span>
                            :
                            <span className='emphasize'>{Math.round(combatStats.totalTimeDead / 360) / 10} hours</span>
                        }
                        <br />
                        dead and waiting to respawn.
                    </h2>

                    <h2>
                        Of the <span className='emphasize'>{combatStats.totalNegativeGames}</span> games that you went negative,
                        <br />
                        you won <span className='emphasize'>{Math.floor(combatStats.negativeWR / combatStats.totalNegativeGames * 10000) / 100}%</span> of the time.
                    </h2>


                </div>

                <div>
                    {highestDeathGames.map((game, idx) => <TableEntry key = {`Lowest_Kill_Entry_${idx}`} puuid={puuid} match={game} />)}

                    <p className='tableLabel'>Your Games With The Most Deaths</p>
                </div>
            </div>


            <div className='chartContainer'>
                <KDAgraph kills={killFreqArr} deaths={deathFreqArr} />
            </div>



            <div className='splitColumn'>
                <div>
                    <h2>Your best KDA was <span className='emphasize'>{kdaGames["bestKDA"].stats.kda}</span></h2>
                    <TableEntry puuid={puuid} match={kdaGames["bestKDA"]} />
                </div>


                <div>
                    <h2>Your worst KDA was <span className='emphasize'>{kdaGames["worstKDA"].stats.kda}</span></h2>
                    <TableEntry puuid={puuid} match={kdaGames["worstKDA"]} />

                </div>

            </div>
            <MapOverlay puuid={puuid}> </MapOverlay>

        </>
    )
}