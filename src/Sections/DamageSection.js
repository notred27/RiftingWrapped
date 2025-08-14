import {useEffect, useState} from 'react';
import StackedDamageChart from './../graphs/StackedDamageChart.js';

export default function DamageSection({ puuid, year }) {
    const [damageStats, setDamageStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDamage() {
            try {
                const res = await fetch(`http://localhost:5000/damage/${puuid}?year=${year}`);

                if (!res.ok) {
                    throw new Error('Error from database.')
                }

                const data = await res.json();
                setDamageStats(data[0]);


            } catch (err) {

            } finally {
                setLoading(false);
            }
        }

        if (puuid) {
            fetchDamage();
        }

    }, [puuid, year])

    if (loading) return <div>Loading...</div>;
    if (!damageStats || damageStats.length === 0) return <div>No match date data found</div>;


    return (
        <>

            <div style={{ height: '225px', width: "fit-content", overflow: 'hidden', position: 'relative' }}>
                <img
                    src={`https://www.hotspawn.com/wp-content/uploads/2018/11/lol_teamfight-1.jpg`}
                    alt="Background"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transform: 'translateY(-40%)',
                        height: 'auto',
                        zIndex: 0,
                        display: 'block',
                        margin: 'auto',
                        maxWidth: '80vw',
                        minHeight: '450px'

                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '15%',
                        height: '100%',
                        background: 'linear-gradient(to right, #0d1317, transparent)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '15%',
                        height: '100%',
                        background: 'linear-gradient(to left, #0d1317, transparent)',
                        pointerEvents: 'none',
                    }}
                />
            </div>


            {/* <h2>This year, you were a<br /><span className='emphasize' style={{ fontSize: "60px" }}>[insert architype here]</span></h2> */}


            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", justifyContent: "center", textAlign:"center", minWidth:"60vw", gap:"50px"}}>

                <div>
                    <h2 style={{ fontWeight: "300", marginBottom: "5px" }}>You dealt a whopping<br /><span style={{ fontWeight: "800", fontSize: "30px" }}>{(damageStats["physicalDamageDealt"] + damageStats["trueDamageDealt"] + damageStats["magicDamageDealt"]).toLocaleString()} damage</span><br />to other champions.</h2>
                    <h4 style={{ marginTop: "5px", fontSize: "small", fontWeight: "200" }}>(With an average of {Math.floor(damageStats["avgDealt"]).toLocaleString()} damage dealt per game!)</h4>

                </div>

                <div>
                    <h2 style={{ fontWeight: "300", marginBottom: "5px" }}>By comparison, you tanked<br /><span style={{ fontWeight: "800", fontSize: "30px" }}>{(damageStats["physicalDamageTaken"] + damageStats["trueDamageTaken"] + damageStats["magicDamageTaken"]).toLocaleString()} damage</span><br />from other champions.</h2>
                    <h4 style={{ marginTop: "5px", fontSize: "small", fontWeight: "200" }}>(With an average of {Math.floor(damageStats["avgTaken"]).toLocaleString()} damage taken per game!)</h4>

                </div>

            </div>


            <div style={{ height: "300px", width: "600px", marginRight: "50px" }}>
                <StackedDamageChart
                    damageDealt={[damageStats["physicalDamageDealt"], damageStats["trueDamageDealt"], damageStats["magicDamageDealt"]]}
                    damageTaken={[damageStats["physicalDamageTaken"], damageStats["trueDamageTaken"], damageStats["magicDamageTaken"]]}
                    chartTitle="Total Damage Dealt & Taken"
                />
            </div>


            <h2 style={{ margin: "5px", textAlign: "center" }}>During fights, you CC'd other players for a total of <span className='emphasize'>{(Math.floor(damageStats["timeCC"] / 60)).toLocaleString()} minutes</span>!</h2>
            <h4 style={{ margin: "5px", textAlign: "center" }}>Thats equivalent to roughly {Math.floor(damageStats["timeCC"] / 60 / 120)} movies, or {Math.floor(damageStats["timeCC"] / 60 / (60 * 8))} workdays worth of time!</h4>

        </>
    )
}