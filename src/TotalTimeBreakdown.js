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

    for(let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        totalTime += matchData[i].info.gameDuration
        ccTime += matchData[i].info.participants[targetPlayer].totalTimeCCDealt
        deadTime += matchData[i].info.participants[targetPlayer].totalTimeSpentDead

        if(matchData[i].info.gameDuration > 25 * 60) {
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

    return(

        <div>
            time breakdown: <br/> 
            Total time: {Math.round(totalTime / 360) /10 } <br/> 
            CC time: {Math.round(ccTime / 360) /10} <br/> 
            Dead time: {Math.round(deadTime / 360) /10} <br/> 
            Roam time: {Math.round(roamTime / 360) /10} <br/> 
            Baron time: {Math.round(baronTime * 40 / 360) /10} <br/> 
            Time spent baron buffed: {Math.round(baronTime * 180 / 360) /10} <br/> 

            Dragon time: {Math.round(dragonTime * 50 / 360) /10} <br/> 

            Other time: {timeBreakdown} <br/> 

            Time spent playing winning games?

            <div style={{width:"90vw"}}>
            <TotalTimeGraph times={timeBreakdown} labels={timeLabels}></TotalTimeGraph>

            </div>


        </div>
    )

}