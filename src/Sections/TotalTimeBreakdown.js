import { useState, useEffect } from "react";
import TotalTimeGraph from "../graphs/TotalTimeGraph"

export default function TotalTimeBreakdown({ puuid, year }) {


    const [loading, setLoading] = useState(true);
    const [timeArr, setTimeArr] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:5000/totalStats/${puuid}?year=${year}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTimeArr(data[0]);
            } catch (error) {
                console.error('Failed to fetch champ data:', error)
                setTimeArr([]);
            } finally {
                setLoading(false);
            }
        }

        if (puuid) {
            fetchData()
        }
    }, [puuid, year])

    if (loading) return <div>Loading...</div>
    if (!timeArr || timeArr.length === 0) return <div>No champion data found</div>
  
    
    const totalTime = Math.floor(timeArr["totalPlaytime"] / 3600);
    const totalTimeInRanked = Math.floor(timeArr["totalRankedTime"] / 3600);
    const totalTimeInRift = Math.floor(timeArr["totalSummonersRift"] / 3600);

    const ccTime = Math.floor(timeArr["timeCCingOthers"] / 3600);
    const deadTime = Math.floor(timeArr["totalTimeDead"] / 3600);
    const roamTime = Math.floor(timeArr["totalRoamTime"] / 3600);


    const dragonTime = Math.round(timeArr["dragons"] * 50 / 3600)
    const baronTime = Math.round(timeArr["barons"] * 40 / 3600)
    const baronBuffTime = Math.round(timeArr["barons"] * 180 / 3600)

    const otherTime = totalTime - (ccTime + deadTime + roamTime + dragonTime + baronTime + baronBuffTime)

    const timeLabels = ["Other", "Time Dead", "Time CC'ing Others", "Time Roaming", "Time Killing Baron", "Time Baron Buffed", "Time Killing Dragons"]
    const timeBreakdown = [otherTime, deadTime, ccTime, roamTime, baronTime, baronBuffTime, dragonTime]


    return (
        <>

            <div style={{ height: '225px', width: "fit-content", overflow: 'hidden', position: 'relative' }}>
                <img
                    src="https://cdn1.epicgames.com/offer/24b9b5e323bc40eea252a10cdd3b2f10/EGS_LeagueofLegends_RiotGames_S1_2560x1440-80471666c140f790f28dff68d72c384b"
                    alt="Background"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transform: 'translateY(-10%)',
                        height: 'auto',
                        zIndex: 0,
                        display: 'block',
                        margin: 'auto',
                        maxWidth: '80vw'

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


            <div className="centeredColumn">

                <h2 className="emphasize">In Conclusion</h2>

                <h2>You spent <span className="emphasize">{totalTime.toLocaleString()} hours</span> playing league this year.</h2>

                <h4>This includes <span className="emphasize">{totalTimeInRanked} hours</span> in Ranked matches, <span className="emphasize">{totalTimeInRift} hours</span> in Summoner's Rift, and <span className="emphasize">{totalTime - totalTimeInRanked - totalTimeInRift} hours</span> in other gamemodes.</h4>

                <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>
                
                <h2>That's equivalent to <span className="emphasize">{Math.floor(totalTime / 8)} workdays</span> or <span className="emphasize">{Math.floor(totalTime / 24)} full days</span>, for better or worse.</h2>
            </div>
        </>
    )
}