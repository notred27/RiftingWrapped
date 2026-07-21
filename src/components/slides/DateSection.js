import { Suspense, lazy } from 'react';
import { useStatsResources } from "./../../resources/UserResourceContext.js";

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';

import './styles.css'


const CalanderGraph = lazy(() => import('./../graphs/CalanderGraph.js'));

export default function DateSection() {
    const { date } = useStatsResources();
    const monthlyStats = date.read();

    const dates = Array(12).fill(0);
    let totalGames = 0;
    let totalUniqueDays = 0;

    for (let entry of monthlyStats) {
        const month = entry._id.month - 1;
        dates[month] = entry.uniqueDays;

        totalGames += entry.totalMatches;
        totalUniqueDays += entry.uniqueDays;
    }

    return (
        <StatCard
            eyebrow="you visited the Rift during"
            title={`${totalGames} Games!`} >

            <StatGrid
                items={[
                    { label: "Unique Days Played", value: `${totalUniqueDays} days` },
                    { label: "Played Once Every", value: `${(Math.floor(3650 / totalUniqueDays) / 10).toFixed(1)} days` },
                ]}
            />

            <br />
            <Suspense fallback={<div style={{ width: "100%", height: "40px" }}></div>}>
                <div style={{ margin: "10px" }}>
                    <p className='subtitle' style={{ textAlign: "left" }}>Breakdown By Month</p>
                    <CalanderGraph dates={dates} />
                </div>

            </Suspense>
        </StatCard>
    );
}
