
import ff_img from './images/surrender.png'

export default function FFSection({puuid, matchData}) {
    if(matchData.length <= 0){
        return(
            <div>Not ready yet</div>
        )
    }

    let teamff = 0
    let opponentff = 0
    let under16 = 0

    let totalNonSurrenderTime = 0
    let totalSurrenderTime = 0

    for(let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        if(matchData[i].info.participants[targetPlayer].gameEndedInSurrender) {
            totalSurrenderTime += matchData[i].info.gameDuration
            if(matchData[i].info.participants[targetPlayer].win) {
                opponentff += 1;
            } else {
                teamff += 1;
            }

            if(matchData[i].info.gameDuration / 60 <= 16){
                under16 += 1
            }
            
        } else {
            totalNonSurrenderTime += matchData[i].info.gameDuration
        }
        
        
        
    }


    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap:"20px"}}> 

            <img src={ff_img} alt='ff_vote' />


            <div style={{ display: "grid", gridTemplateColumns:"50% 50%", columnGap:"20px", width:"80vw", height:"60px"}}>

                <h2 style={{gridRow:"1", fontWeight: "300", textAlign: "center", height: "100px", margin: "0px" }}>This year, your team forfeited <br/><span style={{ fontWeight: "800", fontSize: "30px" }}>{teamff}</span> times.</h2>

                <h2 style={{gridRow:"1", fontWeight: "300", textAlign: "center", height: "100px", margin: "0px" }}>Opponents forfeited against you <br/><span style={{ fontWeight: "800", fontSize: "30px" }}>{opponentff}</span> times.</h2>
            </div>

            <h3 style={{textAlign:"center", margin:"0px"}}><span style={{ fontWeight: "800", fontSize: "25px" }}>{under16}</span> of these games ended before 16 minutes!</h3>
            <br/>
            <h3 style={{textAlign:"center"}}>It's estimated that you saved <span style={{ fontWeight: "800", fontSize: "20px" }}>{Math.floor((totalNonSurrenderTime / (matchData.length - teamff - opponentff) * (teamff + opponentff) - totalSurrenderTime) / 36) / 100} hours</span> of playtime<br/> from these early surrenders.</h3>
        </div>
    )
}