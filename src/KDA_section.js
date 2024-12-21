

import Hist from './Hist.js'
import TableEntry from './TableEntry.js';


export default function KDA_section({ puuid, matchData }) {

    // Sort by highest kills
    const highestKills = matchData.sort((a, b) => {
        const ta = a.metadata.participants.indexOf(puuid)
        const tb = b.metadata.participants.indexOf(puuid)

        return b.info.participants[tb].kills - a.info.participants[ta].kills
    })

    // Get 5 highest kill games
    const killList = []
    for (let i = 0; i < Math.min(5, highestKills.length); i++) {
        killList.push(<TableEntry puuid={puuid} match={highestKills[i]}></TableEntry>)

    }


    // Sort by highest deaths
    const highestDeaths = matchData.sort((a, b) => {
        const ta = a.metadata.participants.indexOf(puuid)
        const tb = b.metadata.participants.indexOf(puuid)

        return b.info.participants[tb].deaths - a.info.participants[ta].deaths
    })

    // Get 5 highest death games
    const deathList = []
    for (let i = 0; i < Math.min(5, highestDeaths.length); i++) {
        deathList.push(<TableEntry puuid={puuid} match={highestDeaths[i]}></TableEntry>)
    }

    // Create histograms for kills and deaths
    const kills = []
    const deaths = []
    for (let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
        kills.push(matchData[i].info.participants[targetPlayer].kills)
        deaths.push(matchData[i].info.participants[targetPlayer].deaths)

    }

    const kdaHist = [<Hist data={kills} numBins={8}></Hist>, <Hist data={deaths} numBins={8}></Hist>, <h4>Kills</h4>, <h4>Deaths</h4>]
    


    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
                <div>
                    <h3>Most Kills</h3>
                    {killList}
                </div>


                <div>
                    <h3>Most Deaths</h3>
                    {deathList}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", justifyItems: "center", columnGap: "100px" }}>
                {kdaHist}

            </div>
            
        </div>
    )
}