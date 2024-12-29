import TotalTimeGraph from "./graphs/TotalTimeGraph"


export default function TotalTimeBreakdown({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet...</div>
        )
    }


    let totalTime = 0
    let ccTime = 0
    let deadTime = 0
    let roamTime = 0
    let baronTime = 0
    let dragonTime = 0

    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        totalTime += matchData[i].info.gameDuration
        ccTime += matchData[i].info.participants[targetPlayer].totalTimeCCDealt
        deadTime += matchData[i].info.participants[targetPlayer].totalTimeSpentDead

        if (matchData[i].info.gameDuration > 25 * 60) {
            roamTime += matchData[i].info.gameDuration - (25 * 60)
        }

        baronTime += matchData[i].info.participants[targetPlayer].challenges.baronTakedowns
        dragonTime += matchData[i].info.participants[targetPlayer].dragonKills

    }


    ccTime = Math.round(ccTime / 360) / 10
    deadTime = Math.round(deadTime / 360) / 10
    roamTime = Math.round(roamTime / 360) / 10
    let baronBuffTime = Math.round(baronTime * 180 / 360) / 10
    baronTime = Math.round(baronTime * 40 / 360) / 10
    dragonTime = Math.round(dragonTime * 50 / 360) / 10

    let otherTime = Math.round(Math.round(totalTime / 360) / 10 - ccTime - deadTime - roamTime - baronTime - baronBuffTime - dragonTime)


    const timeLabels = ["Other", "Time Dead", "Time CC'ing Others", "Time Roaming", "Time Killing Baron", "Time Baron Buffed", "Time Killing Dragons"]
    const timeBreakdown = [otherTime, deadTime, ccTime, roamTime, baronTime, baronBuffTime, dragonTime]


    totalTime = Math.floor(totalTime / 3600)


    return (
        <div style={{ display: "block", paddingBottom: "200px", textAlign: "center" }}>


            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>


                <h2 className="emphasize">In Conclusion</h2>


                <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>

                <h2>You spent <span className="emphasize">{totalTime} hours</span><br /> playing draft pick this year.</h2>

                <h4>That's equivalent to <span className="emphasize">{Math.floor(totalTime / 8)} hours</span> or <span className="emphasize">{Math.floor(totalTime / 24)} full days</span>, for better or worse.</h4>


            </div>

        </div>

    )

}