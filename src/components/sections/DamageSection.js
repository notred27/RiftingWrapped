import SectionImage from './../common/SectionImage.js';

import { lazy, Suspense } from 'react';


import { useStatsResources } from "./../../resources/UserResourceContext.js";

const StackedDamageChart = lazy(() => import('./../graphs/StackedDamageChart.js'));


export default function DamageSection({ resource }) {
    const { damage } = useStatsResources();
    const damageStats = damage.read()[0];

    return (
        <section>
            <div>
                <h2 className='subtitle'>Damage dealt to champions</h2>
                <h1 className='emphasize-xlg' >
                    {(damageStats["physicalDamageDealt"] + damageStats["trueDamageDealt"] + damageStats["magicDamageDealt"]).toLocaleString()}
                </h1>
                <p className='subtitle'>
                    {Math.floor(damageStats["avgDealt"]).toLocaleString()} average dmg per game
                </p>


                <br/>

                <h2 className='subtitle'>By comparison, you tanked <span className='emphasize'>{(damageStats["physicalDamageTaken"] + damageStats["trueDamageTaken"] + damageStats["magicDamageTaken"]).toLocaleString()}</span> damage</h2>


                <hr />

                <Suspense fallback={<div style={{ width: "100%", height: "200px" }}></div>}>

    
                    <StackedDamageChart
                        damageDealt={[damageStats["physicalDamageDealt"], damageStats["trueDamageDealt"], damageStats["magicDamageDealt"]]}
                        damageTaken={[damageStats["physicalDamageTaken"], damageStats["trueDamageTaken"], damageStats["magicDamageTaken"]]}
                        chartTitle="Total Damage Dealt & Taken"
                    />

            </Suspense>
            </div>

            {/* <h2>This year, you were a<br /><span className='emphasize' style={{ fontSize: "60px" }}>[insert architype here]</span></h2> */}

           

            

            <h2 className='centeredText' >
                During fights, you CC'd other players for a total of
                <span className='emphasize'>
                    &nbsp;{(Math.floor(damageStats["timeCC"] / 60)).toLocaleString()} minutes!
                </span>
            </h2>

   

        </section>
    )
}