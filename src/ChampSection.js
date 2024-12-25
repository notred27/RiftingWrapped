import HorizontalBarChart from './horizontal.js'


export default function ChampSection({puuid, matchData}) {
    if(matchData.length <= 0){
        return(
            <div>Not ready yet</div>
        )
    }


    const champDict = {}
    const champMinutes = {}

    for(let i = 0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
        const champName = matchData[i].info.participants[targetPlayer].championName

        if(Object.keys(champDict).includes(champName)) {
            champDict[champName] += 1
            champMinutes[champName] += matchData[i].info.gameDuration
        } else {
            champDict[champName] = 1
            champMinutes[champName] = matchData[i].info.gameDuration

        }
    }


    const champNames = Object.keys(champDict).reverse()
    const champVals = Object.values(champDict).sort((a,b) => b- a).slice(0,Math.min(10, champNames.length))

    const sortedNames = []
    for(let i = 0 ; i <= champVals.length; i++) {
        for(let j = 0; j < champNames.length; j++) {
            if(champVals[i] === champDict[champNames[j]]) {
                sortedNames.push(champNames[j])
                champNames.splice(j,1)
                j = champNames.length;
            }
        }
    }


    const topChamp = sortedNames[0]
    const numMinutes = Math.floor(champMinutes[topChamp] / 60)


    return (
        <div style={{display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"space-evenly"}}>
            <div>
                <h2 style={{fontWeight:"300", textAlign:"left", marginBottom:"5px"}}>Throughout the year,<br/><span style={{fontWeight:"800", fontSize:"30px"}}>{topChamp.toUpperCase()}</span><br/>was your go-to champ<br/>on the rift.</h2>
                
                {numMinutes <= 60 ?
                <h4 style={{marginTop:"5px", fontSize:"small", fontWeight:"200"}}>You played as {topChamp} for <span style={{fontWeight:"bold"}}>{numMinutes}</span> minutes <br/> (accounting for <span className='emphasize'>{Math.round(champVals[0] / matchData.length * 100)}%</span> of your games)!</h4>
                :
                <h4 style={{marginTop:"5px", fontSize:"small", fontWeight:"200"}}>You played as {topChamp} for roughly <span style={{fontWeight:"bold"}}>{Math.round(numMinutes / 60)}</span> hours <br/> (accounting for <span className='emphasize'>{Math.round(champVals[0] / matchData.length * 100)}%</span> of your games)!</h4>

            }

            </div>

            <div style={{width:"400px", marginLeft:"50px", marginTop:"30px"}}>
            <HorizontalBarChart champs = {sortedNames} values = {champVals}></HorizontalBarChart>

            </div>

        </div>
    )
}