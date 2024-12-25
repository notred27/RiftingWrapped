
import RoleGraph from './RoleGraph.js';
import RoleWinrateGraph from './RoleWinrateGraph.js';


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


    console.log(roles.indexOf(Math.max(...roles)))
    

    return (
        <div>

            <h2 style={{ textAlign: "center" }}>This year you rocked a variety of roles,<br /> but it's undeniable that<br /><span style={{ fontSize: "40px", fontWeight: "800" }}>{combined[0].label.toUpperCase()}</span><br />was your domain!</h2>

            <div style={{ width: "90vw", height: "300px" , display: "flex", flexDirection: "row", justifyContent: "center", alignItems:"center", gap: "50px" }}>

                    <RoleGraph positions={roles} wins = {roleWins}></RoleGraph>

                <span>
                    <h1 className='roleHeader'>{combined[0].label}: {combined[0].numGames} games ({Math.round(combined[0].numWins / combined[0].numGames * 100)}% WR)</h1>
                    <h2 className='roleHeader'>{combined[1].label}: {combined[1].numGames} games ({Math.round(combined[1].numWins / combined[1].numGames * 100)}% WR)</h2>
                    <h3 className='roleHeader'>{combined[2].label}: {combined[2].numGames} games ({Math.round(combined[2].numWins / combined[2].numGames * 100)}% WR)</h3>
                    <h4 className='roleHeader'>{combined[3].label}: {combined[3].numGames} games ({Math.round(combined[3].numWins / combined[3].numGames * 100)}% WR)</h4>
                    <h5 className='roleHeader'>{combined[4].label}: {combined[4].numGames} games ({Math.round(combined[4].numWins / combined[4].numGames * 100)}% WR)</h5>
                </span>


            </div>


{/* 
            <span style={{height:"300px"}}>
                <RoleWinrateGraph wins={roleWins} allGames={roles}></RoleWinrateGraph>
            </span> */}



        </div>


    )
}