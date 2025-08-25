import { useEffect, useState } from 'react';

import CalanderGraph from '../graphs/CalanderGraph';

export default function DateSection({ puuid, year }) {
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMonthlyStats() {
            try {
                const [monthEnd, user] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/matchesByDate/${puuid}?year=${year}`),
                    fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_user/${puuid}`)
                
                ]);
                
                if (!monthEnd.ok || !user.ok) {
                    throw new Error('Network response was not ok');
                }
                const [monthData, userData] = await Promise.all([ monthEnd.json(), user.json()]);

                setMonthlyStats(monthData);
                setUserInfo(userData);
            } catch (error) {
                console.error('Failed to fetch monthly stats:', error);
                setMonthlyStats([]);
                setUserInfo([]);
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

    console.log()

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
            <img src = {userInfo["icon"]} alt = "user icon" style={{width:"200px"}}/>
            <h1 className='emphasize' style={{ fontSize: "60px", margin:"2px" }}>{userInfo["displayName"]}#{userInfo["tag"]}</h1>
            <h2 style={{marginTop:"4px", color:"#aaa"}}>Level {userInfo["level"]}</h2>

            <h1 className='emphasize'>Let's dive in to your performance in <span className='emphasize' style={{fontSize:"40px"}}>{year}</span>!</h1>

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

            <CalanderGraph dates={dates} />
        </div>
    );
}
