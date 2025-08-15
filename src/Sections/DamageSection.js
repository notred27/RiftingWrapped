import { useEffect, useState } from 'react';

import StackedDamageChart from './../graphs/StackedDamageChart.js';
import SectionImage from './../SectionImage.js';

export default function DamageSection({ puuid, year }) {
    const [damageStats, setDamageStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDamage() {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/damage/${puuid}?year=${year}`);

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
            <SectionImage imgUrl={`https://www.hotspawn.com/wp-content/uploads/2018/11/lol_teamfight-1.jpg`} offset = {"45"} />

            {/* <h2>This year, you were a<br /><span className='emphasize' style={{ fontSize: "60px" }}>[insert architype here]</span></h2> */}

            <div id='DamageSectionContainer' >
                <div>
                    <h2 className='centeredText' >
                        You dealt a whopping
                        <br />
                        <span className='emphasize' >
                            {(damageStats["physicalDamageDealt"] + damageStats["trueDamageDealt"] + damageStats["magicDamageDealt"]).toLocaleString()} damage
                        </span>
                        <br />
                        to other champions.
                    </h2>

                    <h4>
                        (With an average of {Math.floor(damageStats["avgDealt"]).toLocaleString()} damage dealt per game!)
                    </h4>

                </div>

                <div>
                    <h2 className='centeredText'>
                        By comparison, you tanked
                        <br />
                        <span className='emphasize'>
                            {(damageStats["physicalDamageTaken"] + damageStats["trueDamageTaken"] + damageStats["magicDamageTaken"]).toLocaleString()} damage
                        </span>
                        <br />
                        from other champions.
                    </h2>

                    <h4 >
                        (With an average of {Math.floor(damageStats["avgTaken"]).toLocaleString()} damage taken per game!)
                    </h4>
                </div>
            </div>


            <div className='chartContainer'>
                <StackedDamageChart
                    damageDealt={[damageStats["physicalDamageDealt"], damageStats["trueDamageDealt"], damageStats["magicDamageDealt"]]}
                    damageTaken={[damageStats["physicalDamageTaken"], damageStats["trueDamageTaken"], damageStats["magicDamageTaken"]]}
                    chartTitle="Total Damage Dealt & Taken"
                />
            </div>


            <h2 className='centeredText' >
                During fights, you CC'd other players for a total of 
                <span className='emphasize'>
                    &nbsp;{(Math.floor(damageStats["timeCC"] / 60)).toLocaleString()} minutes!
                </span>
            </h2>

            <h4 className='centeredText' >
                That's equivalent to roughly {Math.floor(damageStats["timeCC"] / 60 / 120)} movies, or {Math.floor(damageStats["timeCC"] / 60 / (60 * 8))} workdays worth of time!
            </h4>

        </>
    )
}