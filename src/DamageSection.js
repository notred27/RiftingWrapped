import DamageChart from './DamageChart.js';

export default function DamageSection({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet...</div>
        )
    }


    const dmgTaken = [0,0,0]

    const physDamage = []
    const magDamage = []
    const trueDamage = []

    let ccTime = 0


    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        physDamage.push(matchData[i].info.participants[targetPlayer].physicalDamageDealtToChampions)
        magDamage.push(matchData[i].info.participants[targetPlayer].magicDamageDealtToChampions)
        trueDamage.push(matchData[i].info.participants[targetPlayer].trueDamageDealtToChampions)

        dmgTaken[0] += matchData[i].info.participants[targetPlayer].physicalDamageTaken
        dmgTaken[1] += matchData[i].info.participants[targetPlayer].trueDamageTaken
        dmgTaken[2] += matchData[i].info.participants[targetPlayer].magicDamageTaken



        ccTime += matchData[i].info.participants[targetPlayer].totalTimeCCDealt
    }

    const dmgPerGame = []
    for (let i = 0; i < physDamage.length; i++) {
        dmgPerGame.push(physDamage[i] + magDamage[i] + trueDamage[i])
    }

    const avgDmg = Math.floor(dmgPerGame.reduce((partialSum, a) => partialSum + a, 0) / dmgPerGame.length)

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>


                <div style={{ height: "300px", marginRight: "50px" }}>
                    <DamageChart damage={[physDamage.reduce((partialSum, a) => partialSum + a, 0), trueDamage.reduce((partialSum, a) => partialSum + a, 0), magDamage.reduce((partialSum, a) => partialSum + a, 0)]}></DamageChart>

                </div>


                <div>
                    <h2 style={{ fontWeight: "300", textAlign: "left", marginBottom: "5px" }}>You dealt a whopping<br /><span style={{ fontWeight: "800", fontSize: "30px" }}>{dmgPerGame.reduce((partialSum, a) => partialSum + a, 0).toLocaleString()} damage</span><br/>to other champions.</h2>
                    <h4 style={{ marginTop: "5px", fontSize: "small", fontWeight: "200" }}>(With an average of {avgDmg.toLocaleString()} damage dealt per game!)</h4>

                </div>
            </div>


            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>


                <div style={{ height: "300px", marginRight: "50px" }}>
                    <DamageChart damage={dmgTaken}></DamageChart>

                </div>


                <div>
                    <h2 style={{ fontWeight: "300", textAlign: "left", marginBottom: "5px" }}>By comparison, you tanked<br /><span style={{ fontWeight: "800", fontSize: "30px" }}>{dmgTaken.reduce((partialSum, a) => partialSum + a, 0).toLocaleString()} damage</span><br />from other champions.</h2>
                    <h4 style={{ marginTop: "5px", fontSize: "small", fontWeight: "200" }}>(With an average of {Math.floor(dmgTaken.reduce((partialSum, a) => partialSum + a, 0) / matchData.length).toLocaleString()} damage taken per game!)</h4>

                </div>
            </div>

            <h2 style={{margin:"5px", textAlign:"center"}}>During fights, you CC'd other players for a total of <span className='emphasize'>{(Math.floor(ccTime / 360) /10).toLocaleString()} hours</span>!</h2>
            <h4 style={{margin:"5px", textAlign:"center"}}>Thats equivalent to roughly {Math.floor(ccTime / 60 / 120)} movies, or {Math.floor(ccTime / 60 / (60*8))} workdays worth of time!</h4>


        </div>
    )
}