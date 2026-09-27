import { Suspense, lazy } from 'react';
import { useStatsResources } from "./../../resources/UserResourceContext.js";

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';
import EmptySlide from '../layout/EmptySlide.js';

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

    if (!totalGames || !totalUniqueDays) {
        return <EmptySlide eyebrow="You visited the Rift during" title="0 games" message="No matches recorded this year yet. Queue up and check back!" />;
    }

    return (
        <StatCard
            eyebrow="You visited the Rift during"
            title={`${totalGames.toLocaleString()} games`}
            subtitle={<>spread across <strong>{totalUniqueDays} different days</strong></>}
            media={
                <Suspense fallback={<div style={{ width: "100%", height: "200px" }} />}>
                    <p className="slide-label">Days played by month</p>
                    <CalanderGraph dates={dates} />
                </Suspense>
            }
        >
            <StatGrid
                items={[
                    { label: "Games per day played", value: (Math.round(totalGames / totalUniqueDays * 10) / 10).toLocaleString() },
                    { label: "Played once every", value: `${(Math.round(3650 / totalUniqueDays) / 10).toFixed(1)} days` },
                ]}
            />
        </StatCard>
    );
}
