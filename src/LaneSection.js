import CSTableEntry from './CSTableEntry.js';
import PingSection from './PingSection.js'
import RoleGraph from './graphs/RoleGraph.js';
// import RoleWinrateGraph from './RoleWinrateGraph.js';


export default function LaneSection({ puuid, matchData }) {
    if (matchData.length <= 0) {
        return (
            <div>Not ready yet</div>
        )
    }


    const roleDicts = {
        "TOP": { "wins": 0, "games": 0 },
        "MIDDLE": { "wins": 0, "games": 0 },
        "JUNGLE": { "wins": 0, "games": 0 },
        "BOTTOM": { "wins": 0, "games": 0 },
        "UTILITY": { "wins": 0, "games": 0 },
    }

    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
        const position = matchData[i].info.participants[targetPlayer].individualPosition

        try {
            roleDicts[position].games += 1

            if (matchData[i].info.participants[targetPlayer].win) {
                roleDicts[position].wins += 1
            }
        } catch {
            console.log("Unknown role:", position)
        }
    }

    const labels = ['Top', 'Mid', 'Jungle', 'ADC', 'Support']
    const roleArr = Object.keys(roleDicts).map((key, idx) => {
        roleDicts[key].label = labels[idx];

        if (roleDicts[key].numGames !== 0) {
            roleDicts[key].winRate = Math.round(roleDicts[key].wins / roleDicts[key].games * 100);
        } else {
            roleDicts[key].winRate = 0;
        }

        return roleDicts[key]
    })
    roleArr.sort((a, b) => b.games - a.games)



    let bestCS = matchData.filter((match) => !match.info.gameEndedInEarlySurrender && !match.info.gameEndedInSurrender && match.info.gameDuration > 960)

    bestCS = bestCS.sort((a, b) => {
        const ta = a.info.participants[a.metadata.participants.indexOf(puuid)]
        const tb = b.info.participants[b.metadata.participants.indexOf(puuid)]
        return (tb.totalMinionsKilled + tb.neutralMinionsKilled) - (ta.totalMinionsKilled + ta.neutralMinionsKilled)
    })

    const cs = []
    for (let i = 0; i < bestCS.length; i++) {
        cs.push(<CSTableEntry puuid={puuid} match={bestCS[i]} />)
    }


    const totalCreeps = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)
        return partialSum + a.info.participants[targetPlayer].totalMinionsKilled
    }, 0)

    const totalCamps = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)
        return partialSum + a.info.participants[targetPlayer].neutralMinionsKilled
    }, 0)

    // under 100 cs
    const under50 = matchData.reduce((partialSum, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)
        const totalCS = a.info.participants[targetPlayer].neutralMinionsKilled + a.info.participants[targetPlayer].totalMinionsKilled

        if (a.info.gameDuration > 900 && totalCS <= 100 && a.info.participants[targetPlayer].individualPosition !== "UTILITY") {
            return partialSum + 1
        }

        return partialSum
    }, 0)


    const takenObjectives = matchData.reduce((partialDict, a) => {
        const targetPlayer = a.metadata.participants.indexOf(puuid)
        const team = Math.floor(a.info.participants[targetPlayer].teamId / 200)
        const objDict = a.info.teams[team].objectives

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
        partialDict["nexus"] += a.info.participants[targetPlayer].win && !a.info.participants[targetPlayer].gameEndedInSurrender ? 1 : 0

        return partialDict
    }, { "grub": 0, "herald": 0, "baron": 0, "dragon": 0, "elder": 0, "tower": 0, "inhib": 0, "nexus": 0 })


    return (
        <div className='centeredColumn'>

            <h2 className='emphasize'>Let's see how you did in your lane this year</h2>

            <h2 style={{ textAlign: "center" }}>This year you rocked a variety of roles,<br /> but it's undeniable that<br /><span className='emphasize' style={{ fontSize: "40px" }}>{roleArr[0].label.toUpperCase()}</span><br />was your domain!</h2>


            <div id='PositionBreakdownContainer'>
                <RoleGraph positions={Object.keys(roleDicts).map(k => roleDicts[k].games)} wins={Object.keys(roleDicts).map(k => roleDicts[k].wins)}></RoleGraph>

                <span>
                    <p style={{ margin: "5px", fontSize: "20px" }}>You played as:</p>

                    {roleArr.map((role, idx) => {
                        const Tag = `h${idx + 1}`
                        return <Tag className='roleHeader'>{role.label} for {role.games} games ({role.winRate}% WR)</Tag>
                    })}
                </span>

            </div>


            <h2 className='emphasize'>This year you vanquished an army of creeps!</h2>


            <div className='splitColumn'>
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
                    <h4 className='tableLabel'>Your Games With The Best CS</h4>

                </div>


                <div>
                    <h2 style={{ textAlign: "right" }}>You hit new highs with<br />your CS this year, killing <br /><span className='emphasize'>{totalCreeps.toLocaleString()} Minions</span> and <br /><span className='emphasize'>{totalCamps.toLocaleString()} Jungle Monsters</span> </h2>
                    <h4 style={{ textAlign: "right" }}>(Averaging {Math.floor((totalCamps + totalCreeps) / matchData.length * 10) / 10} CS per game)</h4>
                </div>

            </div>

            <h2 className='emphasize'>However, you may have also hit new lows...</h2>

            <div className='splitColumn'>
                <div>
                    <h2>There {under50 === 1 ? "was" : "were"} <span className='emphasize'>{under50} {under50 === 1 ? "game" : "games"}</span><br /> where you had less than 100 CS.</h2>
                    <h4>This excludes games under 15 minutes,<br /> and games where you played support.</h4>
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
                    <h4 className='tableLabel'>Your Games With The Worst CS</h4>

                </div>
            </div>



            <PingSection puuid={puuid} matchData={matchData} />

            <h2 className='emphasize'>You and your teammates conquered objectives left and right</h2>

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