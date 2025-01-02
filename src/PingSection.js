import PingGraph from "./graphs/PingGraph"


export default function PingSection({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet</div>
        )
    }


    const pings = { "back": 0, "push": 0, "omw": 0, "allIn": 0, "assist": 0, "nvision": 0, "missing": 0, "evision": 0 }

    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
        pings["back"] += matchData[i].info.participants[targetPlayer].getBackPings
        pings["push"] += matchData[i].info.participants[targetPlayer].pushPings
        pings["omw"] += matchData[i].info.participants[targetPlayer].onMyWayPings
        pings["allIn"] += matchData[i].info.participants[targetPlayer].allInPings
        pings["assist"] += matchData[i].info.participants[targetPlayer].assistMePings
        pings["nvision"] += matchData[i].info.participants[targetPlayer].needVisionPings
        pings["missing"] += matchData[i].info.participants[targetPlayer].enemyMissingPings
        pings["evision"] += matchData[i].info.participants[targetPlayer].enemyVisionPings
    }

    const pingArr = Object.keys(pings).map(key => pings[key])
    const labels = ["Get Back", "Push", "On My Way", "All In", "Assist Me", "Need Vision", "Missing?", "Enemy Vision"]

    return (
        <div>
            <h2 className="emphasize" style={{ textAlign: "center" }}>You also <i>loved</i> to alert your teammates</h2>

            <div className="centeredRow">

                <div style={{ width: "50vw", textAlign: "right", paddingRight: "50px" }}>
                    <h2>You made a total of <br /><span className="emphasize">{pingArr.reduce((sum, x) => sum + x, 0).toLocaleString()} pings</span> to your <br />teammates this year,<br />
                        with your favorite ping being<br /> <span className="emphasize">{labels[pingArr.indexOf(Math.max(...pingArr))]}</span></h2>

                    <h4>Let's just hope they listened to them...</h4>
                </div>


                <div style={{ width: "40vw", height: "300px" }}>
                    <PingGraph pings={pingArr} labels={labels}></PingGraph>
                </div>

            </div>
        </div>


    )
}