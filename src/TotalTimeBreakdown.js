import TotalTimeGraph from "./graphs/TotalTimeGraph"


export default function TotalTimeBreakdown({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet...</div>
        )
    }

    // Dictionary to hold time summaries
    const times = {
        "total": 0,
        "dead": 0,
        "cc": 0,
        "roam": 0,
        "baron": 0,
        "dragon": 0
    }


    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        times.total += matchData[i].info.gameDuration
        times.cc += matchData[i].info.participants[targetPlayer].totalTimeCCDealt
        times.dead += matchData[i].info.participants[targetPlayer].totalTimeSpentDead
        times.baron += matchData[i].info.participants[targetPlayer].challenges.baronTakedowns
        times.dragon += matchData[i].info.participants[targetPlayer].dragonKills

        // Estimate roaming time
        if (matchData[i].info.gameDuration > 25 * 60) {
            times.roam += matchData[i].info.gameDuration - (25 * 60)
        }
    }



    times.cc = Math.round(times.cc / 360) / 10
    times.dead = Math.round(times.dead / 360) / 10
    times.roam = Math.round(times.roam / 360) / 10

    let baronBuffTime = Math.round(times.baron * 180 / 360) / 10

    times.baron = Math.round(times.baron * 40 / 360) / 10
    times.dragon = Math.round(times.dragon * 50 / 360) / 10
    let totalTime = Math.floor(times.total / 3600)

    let otherTime = (Math.round(Math.round(times.total / 360) / 10) - Object.keys(times).reduce((sum, key) => { return sum + times[key] }, 0)) + times.total

    // console.log(Object.keys(times).reduce((arr, key) => {arr.push(key); return arr}, []))

    const timeLabels = ["Other", "Time Dead", "Time CC'ing Others", "Time Roaming", "Time Killing Baron", "Time Baron Buffed", "Time Killing Dragons"]
    const timeBreakdown = [otherTime, times.dead, times.cc, times.roam, times.baron, baronBuffTime, times.dragon]


    return (
        <div id="TotalTimeContainer">

            <div className="centeredColumn">

                <h2 className="emphasize">In Conclusion</h2>

                <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>

                <h2>You spent <span className="emphasize">{totalTime} hours</span><br /> playing draft pick this year.</h2>

                <h4>That's equivalent to <span className="emphasize">{Math.floor(totalTime / 8)} workdays</span> or <span className="emphasize">{Math.floor(totalTime / 24)} full days</span>, for better or worse.</h4>

            </div>
        </div>
    )
}