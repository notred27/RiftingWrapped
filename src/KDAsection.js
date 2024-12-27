
import TableEntry from './TableEntry.js';
import KDAgraph from './graphs/KDAgraph.js'

export default function KDAsection({ puuid, matchData }) {

    if(matchData.length <= 0){
        return(
            <div>Not ready yet</div>
        )
    }

    // Filter out early surrendered games (before 20min)
    matchData = matchData.filter((match) => match.info.gameDuration >= 960)

    // Sort by highest KDA
    const sortedKDA = matchData.sort((a, b) => {
        const ta = a.metadata.participants.indexOf(puuid)
        const tb = b.metadata.participants.indexOf(puuid)

        const pa = a.info.participants[ta].challenges
        const pb = b.info.participants[tb].challenges

        return (pa.kda) - (pb.kda)
    })




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

    // const kdaHist = [<Hist data={kills} numBins={8}></Hist>, <Hist data={deaths} numBins={8}></Hist>, <h4>Kills</h4>, <h4>Deaths</h4>]
    

    let killsUnderTurrets = 0
    let killSprees = 0
    let totalKills = 0
    let totalDeaths = 0
    let positiveGames = 0
    let wins = 0
    let negativeWins = 0
    let timeSpentDead = 0
    for(let i =0; i < matchData.length; i++) {
        const targetPlayer = matchData[i].metadata.participants.indexOf(puuid)
        totalDeaths += matchData[i].info.participants[targetPlayer].deaths
        timeSpentDead += matchData[i].info.participants[targetPlayer].totalTimeSpentDead



        totalKills += matchData[i].info.participants[targetPlayer].kills
        killSprees += matchData[i].info.participants[targetPlayer].killingSprees
        killsUnderTurrets += matchData[i].info.participants[targetPlayer].challenges.killsNearEnemyTurret

        if(matchData[i].info.participants[targetPlayer].kills + matchData[i].info.participants[targetPlayer].assists > matchData[i].info.participants[targetPlayer].deaths ){
            positiveGames += 1

            if(matchData[i].info.participants[targetPlayer].win){
                wins += 1
            }
        } else if (matchData[i].info.participants[targetPlayer].win) {
            negativeWins += 1
        }

        
    }

        const bestKDA = sortedKDA[sortedKDA.length - 1].info.participants[sortedKDA[sortedKDA.length - 1].metadata.participants.indexOf(puuid)].challenges.kda

        const worstKDA = sortedKDA[0].info.participants[sortedKDA[0].metadata.participants.indexOf(puuid)].challenges.kda

        // const tb = b.metadata.participants.indexOf(puuid)

        // const pa = a.info.participants[ta]
        // const pb = b.info.participants[tb]

        // return ((pb.kills + pb.assists) / pb.deaths) - ((pa.kills + pa.assists) / pa.deaths)



    return (
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:"10px"}}>
      <h2 style={{fontWeight:"800"}}>Lets take a look at some of your highlights</h2>


            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
                <div>
                    <div className='tableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                    </div>

                    {killList}
                    <h4 style={{textAlign:"center", fontWeight:"bolder"}}>Your Games With The Most Kills</h4>

                </div>


                <div>
                    <h2>You killed <span className='emphasize'>{totalKills.toLocaleString()}</span> champs,<br/> averaging <span className='emphasize'>{Math.floor(totalKills / matchData.length * 100) / 100}</span> kills per game!</h2>
                    <h3>These stats are a result of <span className='emphasize'>{killSprees}</span> killing <br/>sprees, 
                    and the <span className='emphasize'>{killsUnderTurrets}</span> enemies <br/>
                    you killed under their own turrets.</h3>
                </div>
            </div>

            <h2>Of the <span className='emphasize'>{positiveGames}</span> games where you went positive, you won <span className='emphasize'>{Math.floor(wins / positiveGames * 10000) / 100}%</span> of the time.</h2>
            {/* <h2>**Successful / Unsuccessful carry**</h2> */}
            <br/>

            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw" }}>
                <div>
                    
                    <h2>However, you were killed<br/><span className='emphasize'>{totalDeaths.toLocaleString()}</span> times by other<br/> players this year.</h2>
                    
                    {Math.round(timeSpentDead / 60) < 300 ? 
                        <h3>Due to this, you spent <span className='emphasize'>{Math.round(timeSpentDead / 60)}</span> minutes<br/> dead and waiting to respawn.</h3>
                        :
                        <h3>Due to this, you spent <span className='emphasize'>{Math.round(timeSpentDead / 360)/10} hours</span><br/> dead and waiting to respawn.</h3>                
                    }

                    
                </div>


                <div>
                    <div className='tableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                    </div>
                    {deathList}
                    <h4 style={{textAlign:"center", fontWeight:"bolder"}}>Your Games With The Most Deaths</h4>
                </div>
            </div>

            <h2>Of the <span className='emphasize'>{matchData.length - positiveGames}</span> games that you went negative, you won <span className='emphasize'>{Math.floor(negativeWins / (matchData.length - positiveGames) * 10000) / 100}%</span> of the time.</h2>


            {/* <h2>Lets see a breakdown of your kills versus deaths over the last year:</h2> */}

            {/* <br/> */}

            <div style={{display:"flex", flexDirection:"row"}}>
                <div style={{height:"300px", width:"50vw"}}>
                    <KDAgraph kills={kills} deaths={deaths}></KDAgraph>
                </div>

                <div>
                    <h3>Your best KDA was <span className='emphasize'>{Math.round(bestKDA *100)/100}</span></h3>
                    <div className='tableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                    </div>
                    <TableEntry puuid={puuid} match={sortedKDA[sortedKDA.length - 1]}></TableEntry>

                    <br/>

                    <h3>Your worst KDA was <span className='emphasize'>{Math.round(worstKDA *100)/100}</span></h3>
                    <div className='tableHeader'>
                        <p>Date</p>
                        <p>Lane</p>
                        <p>Champ</p>
                        <p>KDA</p>
                        <p>Outcome</p>
                        <p>Duration</p>
                    </div>
                    <TableEntry puuid={puuid} match={sortedKDA[0]}></TableEntry>
                </div>
                
            
            </div>
            
        </div>
    )
}