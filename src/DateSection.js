import CalanderGraph from "./graphs/CalanderGraph";

export default function DateSection({puuid, matchData}) {
    if(matchData.length <= 0){
        return(
            <div>Not ready yet</div>
        )
    }

    const dateSets = Array.from({ length: 12 }, () => new Set());

    for(let i = 0; i < matchData.length; i++) {
        const date = new Date(matchData[i].info.gameCreation)
        dateSets[date.getMonth()].add(date.getDate())
    }

    const dates = dateSets.map(s => s.size)

    return (
        <div >
            <h1 className='emphasize'>Let's dive in to your performance this year.</h1>

            <h4 style={{textAlign:"left", fontWeight:"bolder", margin:"0px"}}>Breakdown of Games by Date</h4>
            <CalanderGraph dates ={dates}></CalanderGraph>

            <h2 style={{textAlign:"center"}}>This year, you visited the Rift in <br/><span style={{ fontSize: "40px", fontWeight: "800" }}>{matchData.length} games of League</span><br/> spread across <br/> <span style={{ fontSize: "30px", fontWeight: "800" }}>{dates.reduce((partial, x) => {return partial + x}, 0)} different days!</span></h2>
       
       
            <h4 style={{textAlign:"center"}}>With this dedication, you were hitting the Rift every <span className="emphasize">1 in {Math.floor(3650 / dates.reduce((partial, x) => {return partial + x}, 0)) / 10} days</span>.</h4>
       
       
        
        </div>
    )
}