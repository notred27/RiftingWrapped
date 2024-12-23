import DamageChart from './DamageChart.js';

export default function DamageSection({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet...</div>
        )
    }


    const physDamage = []
    const magDamage = []
    const trueDamage = []

    let ccTime = 0


    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)

        physDamage.push(matchData[i].info.participants[targetPlayer].physicalDamageDealtToChampions)
        magDamage.push(matchData[i].info.participants[targetPlayer].magicDamageDealtToChampions)
        trueDamage.push(matchData[i].info.participants[targetPlayer].trueDamageDealtToChampions)

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
                    <h2 style={{ fontWeight: "300", textAlign: "left", marginBottom: "5px" }}>You dealt a whopping<br /><span style={{ fontWeight: "800", fontSize: "30px" }}>{dmgPerGame.reduce((partialSum, a) => partialSum + a, 0).toLocaleString()}</span><br />points of damage<br />to other champions.</h2>
                    <h4 style={{ marginTop: "5px", fontSize: "small", fontWeight: "200" }}>(That's an average of {avgDmg.toLocaleString()} damage per game!)</h4>

                </div>
            </div>

            <p style={{margin:"5px", textAlign:"center"}}>You also cc'd other players for a total of {Math.floor(ccTime / 60)} minutes!</p>
            <p style={{margin:"5px", textAlign:"center"}}>Thats about {Math.floor(ccTime / 60 / 120)} movies worth of time</p>
            <p style={{margin:"5px", textAlign:"center"}}>Thats about {Math.floor(ccTime / 60 / (60*8))} workdays worth of time</p>


        </div>
    )
}