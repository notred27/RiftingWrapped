import SectionImage from './../common/SectionImage.js';

import { lazy, Suspense } from 'react';


import { useStatsResources } from "./../../resources/UserResourceContext.js";

const StackedDamageChart = lazy(() => import('./../graphs/StackedDamageChart.js'));


export default function DamageSection({ resource }) {
    const {damage} = useStatsResources();
    const damageStats = damage.read()[0];

    return (
        <>
            <SectionImage imgUrl={`https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2018/10/League-of-Legends.jpg`} offset={"35"} />

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

                    <h3>
                        (With an average of {Math.floor(damageStats["avgDealt"]).toLocaleString()} damage dealt per game!)
                    </h3>

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

                    <h3>
                        (With an average of {Math.floor(damageStats["avgTaken"]).toLocaleString()} damage taken per game!)
                    </h3>
                </div>
            </div>

            <Suspense fallback={<div style={{ width: "600px", height: "300px" }}></div>}>

                <div className='chartContainer'>


                    <StackedDamageChart
                        damageDealt={[damageStats["physicalDamageDealt"], damageStats["trueDamageDealt"], damageStats["magicDamageDealt"]]}
                        damageTaken={[damageStats["physicalDamageTaken"], damageStats["trueDamageTaken"], damageStats["magicDamageTaken"]]}
                        chartTitle="Total Damage Dealt & Taken"
                    />
                </div>
            </Suspense>

            <h2 className='centeredText' >
                During fights, you CC'd other players for a total of
                <span className='emphasize'>
                    &nbsp;{(Math.floor(damageStats["timeCC"] / 60)).toLocaleString()} minutes!
                </span>
            </h2>

            <h3 className='centeredText' >
                That's equivalent to roughly {Math.floor(damageStats["timeCC"] / 60 / 120)} movies, or {Math.floor(damageStats["timeCC"] / 60 / (60 * 8))} workdays worth of time!
            </h3>

        </>
    )
}