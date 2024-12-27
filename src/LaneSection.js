import CSTableEntry from './CSTableEntry.js';

import RoleGraph from './graphs/RoleGraph.js';
// import RoleWinrateGraph from './RoleWinrateGraph.js';


export default function LaneSection({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet</div>
        )
    }


    const roles = new Array(5).fill(0)
    const roleWins = new Array(5).fill(0)


    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)


        switch (matchData[i].info.participants[targetPlayer].individualPosition) {
            case "TOP":
                roles[0] += 1

                if (matchData[i].info.participants[targetPlayer].win) {
                    roleWins[0] += 1
                }
                break;

            case "MIDDLE":
                roles[1] += 1
                if (matchData[i].info.participants[targetPlayer].win) {
                    roleWins[1] += 1
                }
                break;

            case "JUNGLE":
                roles[2] += 1
                if (matchData[i].info.participants[targetPlayer].win) {
                    roleWins[2] += 1
                }
                break;

            case "BOTTOM":
                roles[3] += 1
                if (matchData[i].info.participants[targetPlayer].win) {
                    roleWins[3] += 1
                }
                break;

            case "UTILITY":
                roles[4] += 1
                if (matchData[i].info.participants[targetPlayer].win) {
                    roleWins[4] += 1
                }
                break;

            default:
                break;
        }

    }

    const labels = ['Top', 'Mid', 'Jungle', 'ADC', 'Support']


    let combined = roles.map((roleGames, idx) => ({
        numGames: roleGames,
        label: labels[idx],
        numWins: roleWins[idx]
    }));

    combined.sort((a, b) => b.numGames - a.numGames)


    // console.log(roles.indexOf(Math.max(...roles)))


    let m = matchData.sort((a, b) => {
        const ta = a.info.participants[a.metadata.participants.indexOf(puuid)]
        const tb = b.info.participants[b.metadata.participants.indexOf(puuid)]

        // match.info.totalMinionsKilled	+ match.info.totalAllyJungleMinionsKilled	+ match.info.totalEnemyJungleMinionsKilled
        return (tb.totalMinionsKilled +  tb.neutralMinionsKilled) - (ta.totalMinionsKilled +  ta.neutralMinionsKilled)

    })

    m = m.filter((match) => !match.info.gameEndedInEarlySurrender && !match.info.gameEndedInSurrender && match.info.gameDuration > 960)


    const cs = []
    for (let i = 0; i < m.length; i++) {
        cs.push(<CSTableEntry puuid={puuid} match={m[i]} />)
    }


    const totalCreeps = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)
        return partialSum + a.info.participants[targetPlayer].totalMinionsKilled}, 0)

    const totalCamps = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)

        return partialSum + a.info.participants[targetPlayer].neutralMinionsKilled}, 0)

    const under50 = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)

        const totalCS = a.info.participants[targetPlayer].neutralMinionsKilled + a.info.participants[targetPlayer].totalMinionsKilled
        
        if(a.info.gameDuration > 900 && totalCS <= 100 && a.info.participants[targetPlayer].individualPosition !== "UTILITY") {
            return partialSum + 1
        }
    
        return partialSum}, 0)


    // {grub, herald, baron, drag, elder, tower, inhib, nexus}
    const takenObjectives = matchData.reduce((partialDict, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)

        const team = Math.floor(a.info.participants[targetPlayer].teamId /200)
        
        const objDict = a.info.teams[team].objectives
        // if(a.info.gameDuration > 900 && totalCS <= 100 && a.info.participants[targetPlayer].individualPosition !== "UTILITY") {
        //     return partialSum + 1
        // }
    
        try {
            partialDict["grub"] += objDict.horde.kills
            
        } catch (error) {
            
        }
        partialDict["herald"] += objDict.riftHerald.kills
        partialDict["baron"] += objDict.baron.kills
        partialDict["dragon"] += objDict.dragon.kills
        partialDict["elder"] += a.info.participants[targetPlayer].challenges.teamElderDragonKills
        partialDict["tower"] += objDict.tower.kills
        partialDict["inhib"] += objDict.inhibitor.kills
        partialDict["dragon"] += objDict.dragon.kills
        partialDict["nexus"] += a.info.participants[targetPlayer].win && !a.info.participants[targetPlayer].gameEndedInSurrender? 1: 0


        



        return partialDict}, {"grub":0, "herald":0, "baron":0, "dragon":0, "elder":0, "tower":0, "inhib":0, "nexus":0})


    return (
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>

      <h2 style={{fontWeight:"800"}}>Let's see how you did in your lane this year</h2>      


            <h2 style={{ textAlign: "center" }}>This year you rocked a variety of roles,<br /> but it's undeniable that<br /><span style={{ fontSize: "40px", fontWeight: "800" }}>{combined[0].label.toUpperCase()}</span><br />was your domain!</h2>

            <div style={{ width: "90vw", height: "300px", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "50px" }}>

                <RoleGraph positions={roles} wins={roleWins}></RoleGraph>

                <span>
                    <p style={{ margin: "5px", fontSize: "20px" }}>You played as:</p>
                    <h1 className='roleHeader'>{combined[0].label} for {combined[0].numGames} games ({Math.round(combined[0].numWins / combined[0].numGames * 100)}% WR)</h1>
                    <h2 className='roleHeader'>{combined[1].label} for {combined[1].numGames} games ({Math.round(combined[1].numWins / combined[1].numGames * 100)}% WR)</h2>
                    <h3 className='roleHeader'>{combined[2].label} for {combined[2].numGames} games ({Math.round(combined[2].numWins / combined[2].numGames * 100)}% WR)</h3>
                    <h4 className='roleHeader'>{combined[3].label} for {combined[3].numGames} games ({Math.round(combined[3].numWins / combined[3].numGames * 100)}% WR)</h4>
                    <h5 className='roleHeader'>{combined[4].label} for {combined[4].numGames} games ({Math.round(combined[4].numWins / combined[4].numGames * 100)}% WR)</h5>
                </span>


            </div>


            {/* 
            <span style={{height:"300px"}}>
                <RoleWinrateGraph wins={roleWins} allGames={roles}></RoleWinrateGraph>
            </span> */}

<h2 style={{fontWeight:"800"}}>This year you vanquished an army of creeps!</h2>


            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw"}}>
                <div>
                    <div className='csTableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                        <p>CS</p>
                        <p>CS/Min</p>
                    </div>
                    {cs.slice(0, 5)}
                    <h4 style={{textAlign:"center", fontWeight:"bolder"}}>Your Games With The Best CS</h4>

                </div>


                <div>
                <h2 style={{textAlign:"right"}}>You hit new highs with<br/>your CS this year, killing <br/><span className='emphasize'>{totalCreeps.toLocaleString()} Minions</span> and <br/><span className='emphasize'>{totalCamps.toLocaleString()} Jungle Monsters</span> </h2>
                <h4 style={{textAlign:"right"}}>(Averaging {Math.floor((totalCamps + totalCreeps) / matchData.length * 10) / 10} CS per game)</h4>
                </div>
                
            </div>

                <h2 style={{fontWeight:"800"}}>However, you may have also hit new lows...</h2>

            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
                <div>
                    <h2>There {under50 === 1 ? "was" : "were"} <span className='emphasize'>{under50} {under50 === 1 ? "game" : "games"}</span><br/> where you had less than 100 CS.</h2>
                    <h4>This excludes games under 15 minutes,<br/> and games where you played support.</h4>
                </div>


                <div>
                    <div className='csTableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                        <p>CS</p>
                        <p>CS/Min</p>
                    </div>
                    {cs.slice(-5).reverse()}
                    <h4 style={{textAlign:"center", fontWeight:"bolder"}}>Your Games With The Worst CS</h4>


                </div>
            </div>

            <h2 style={{fontWeight:"800"}}>You and your teammates conquered objectives left and right</h2>

            <h2>These include</h2>

            <div className='lineContainer'>
                <h1>{takenObjectives["grub"].toLocaleString()} Void Grubs,</h1>
                <h1>{takenObjectives["herald"].toLocaleString()} Heralds,</h1>
                <h1>{takenObjectives["baron"].toLocaleString()} Barons,</h1>
                <h1>{takenObjectives["dragon"].toLocaleString()} Dragons,</h1>
                <h1>{takenObjectives["elder"].toLocaleString()} Elder Dragons,</h1>
                <h1>{takenObjectives["tower"].toLocaleString()} Towers,</h1>
                <h1>{takenObjectives["inhib"].toLocaleString()} Inhibitors,</h1>


            </div>

            <h2>and finally</h2>

            <div className='lineContainer'>
                <h1>{takenObjectives["nexus"].toLocaleString()} Nexuses</h1>


            
            </div>


            
            




        </div>


    )
}