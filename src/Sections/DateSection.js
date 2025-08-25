import { useEffect, useState, Suspense, lazy} from 'react';

const CalanderGraph = lazy(() =>  import('../graphs/CalanderGraph.js'));

export default function DateSection({ puuid, year }) {
    const [monthlyStats, setMonthlyStats] = useState(null);


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMonthlyStats() {
            try {
                const monthEnd  = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/matchesByDate/${puuid}?year=${year}`);

                
                if (!monthEnd.ok) {
                    throw new Error('Network response was not ok');
                }
                const monthData = await monthEnd.json();

                setMonthlyStats(monthData);
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

            <h2>
                This year, you visited the Rift in <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalGames} games of League</span><br />
                spread across <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalUniqueDays} different days!</span>
            </h2>

            <h3>
                With this dedication, you were hitting the Rift every{" "}
                <span className="emphasize">
                    1 in {(Math.floor(3650 / totalUniqueDays) / 10).toFixed(1)} days
                </span>.
            </h3>

            

            <Suspense fallback={<div>Loading Chart...</div>}>
                <CalanderGraph dates={dates} />
            </Suspense>
        </div>
    );
}
