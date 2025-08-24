import { useEffect, useState } from 'react';

import CalanderGraph from '../graphs/CalanderGraph';

export default function DateSection({ puuid, year }) {
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMonthlyStats() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/matchesByDate/${puuid}?year=${year}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMonthlyStats(data);
            } catch (error) {
                console.error('Failed to fetch monthly stats:', error);
                setMonthlyStats([]);
            } finally {
                setLoading(false);
            }
        }

        if (puuid) {
            fetchMonthlyStats();
        }
    }, [puuid, year]);

    if (loading) return;
    if (!monthlyStats || monthlyStats.length === 0) return;

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
        <div style={{ textAlign: "center" }}>
            <h1 className='emphasize'>Let's dive in to your performance in <span className='emphasize' style={{fontSize:"40px"}}>{year}</span>!</h1>

            <h2>
                This year, you visited the Rift in <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalGames} games of League</span><br />
                spread across <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalUniqueDays} different days!</span>
            </h2>

            <h4>
                With this dedication, you were hitting the Rift every{" "}
                <span className="emphasize">
                    1 in {(Math.floor(3650 / totalUniqueDays) / 10).toFixed(1)} days
                </span>.
            </h4>

            <CalanderGraph dates={dates} />
        </div>
    );
}
