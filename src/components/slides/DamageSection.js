import { lazy, Suspense } from 'react';
import { useStatsResources } from "./../../resources/UserResourceContext.js";

import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';
import EmptySlide from '../layout/EmptySlide.js';

const StackedDamageChart = lazy(() => import('./../graphs/StackedDamageChart.js'));

export default function DamageSection() {
    const { damage } = useStatsResources();
    const damageStats = damage.read()[0];

    if (!damageStats) {
        return <EmptySlide eyebrow="Damage dealt to champions" />;
    }

    const dealt = damageStats.physicalDamageDealt + damageStats.trueDamageDealt + damageStats.magicDamageDealt;
    const taken = damageStats.physicalDamageTaken + damageStats.trueDamageTaken + damageStats.magicDamageTaken;

    return (
        <StatCard
            eyebrow="You dealt a total of"
            title={dealt.toLocaleString()}
            subtitle={<>damage to champions · <strong>{Math.floor(damageStats.avgDealt || 0).toLocaleString()}</strong> per game</>}
            media={
                <Suspense fallback={<div style={{ width: "100%", height: "200px" }} />}>
                    <p className="slide-label">Damage by type</p>
                    <StackedDamageChart
                        damageDealt={[damageStats.physicalDamageDealt, damageStats.trueDamageDealt, damageStats.magicDamageDealt]}
                        damageTaken={[damageStats.physicalDamageTaken, damageStats.trueDamageTaken, damageStats.magicDamageTaken]}
                    />
                </Suspense>
            }
        >
            <StatGrid
                items={[
                    { label: "Damage tanked", value: taken.toLocaleString() },
                    { label: "Time spent CC'ing enemies", value: `${Math.floor(damageStats.timeCC / 60).toLocaleString()} min` },
                ]}
            />
        </StatCard>
    );
}
