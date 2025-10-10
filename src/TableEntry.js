import top from './images/top.svg'
import mid from './images/mid.svg'
import bot from './images/bot.svg'
import sup from './images/sup.svg'
import jg from './images/jg.svg'

export default function TableEntry({ puuid, match }) {

    const stats = match.stats

    function monthInt2String(m) {
        switch (m) {
            case 0: return "Jan";
            case 1: return "Feb";
            case 2: return "Mar";
            case 3: return "Apr";
            case 4: return "May";
            case 5: return "Jun";
            case 6: return "Jul";
            case 7: return "Aug";
            case 8: return "Sep";
            case 9: return "Oct";
            case 10: return "Nov";
            case 11: return "Dec";
            default: return "";
        }
    }

    const QUEUE_ID_MAP = {
        400: "Normal Draft",
        420: "Ranked Solo",
        430: "Normal Blind",
        440: "Ranked Flex",
        450: "ARAM",
        480: "Swift Play",
        900: "URF",
        1020: "One for All",
        1700: "Arena",
        1900: "URF (Special)",
        2010: "Snow ARAM",
        2020: "Pick URF",
    }


    let img
    switch (stats.position) {
        case "TOP":
            img = <img loading='lazy' src={top} alt='top_icon' style= {{width:"24px", height:"24px"}} />
            break;

        case "BOTTOM":
            img = <img loading='lazy' src={bot} alt='bot_icon' style= {{width:"24px", height:"24px"}} />
            break;

        case "MIDDLE":
            img = <img loading='lazy' src={mid} alt='mid_icon' style= {{width:"24px", height:"24px"}} />
            break;

        case "UTILITY":
            img = <img loading='lazy' src={sup} alt='sup_icon' style= {{width:"24px", height:"24px"}} />
            break;

        case "JUNGLE":
            img = <img loading='lazy' src={jg} alt='jg_icon' style= {{width:"24px", height:"24px"}} />
            break;

        default:
            break;
    }

    const date = new Date(match.matchInfo.gameCreated)

    return (
        <div className="table-entry-container" onClick={() => window.open(`https://mobalytics.gg/lol/match/na/${match.stats.riotIdGameName}-${match.stats.riotIdTagline}/${match.stats.matchId.split("_")[1]}`, "_blank")} style={{ background: `${stats.win ? "linear-gradient(90deg, #18bd9b80 0%, rgba(49, 41, 85, 0.5) 100%)" : "linear-gradient(90deg, #c9678f80 0%, rgba(49, 41, 85, 0.5) 100%)"}`, borderRadius: "4px", marginBottom: "5px", cursor: "pointer" }}>


            <span style={{ color: "#e2e2e2ff", fontSize: "0.8rem", fontWeight: "600", marginLeft: "10px", paddingTop: "5px" }}>{QUEUE_ID_MAP[match.queueId]} ∙ {monthInt2String(date.getMonth())} {date.getDate()} ∙ {Math.floor(match.matchInfo.gameDuration / 60)} minutes</span>

            <div className='tableEntry' >

                <div className="champTableGrid" style={{ }}>

                    <img
                        loading='lazy'
                        src={`https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${stats.champion}.png`}
                        alt={stats.champion}
                        className='champion-icon'
                        style={{ width: "50px", height: "50px", borderRadius: "50%", border: `${stats.win ? "4px solid #18bd9b" : "4px solid #c9678f"}` }}
                    />

                    <span style={{ position: "absolute", bottom: "0px", right: "-10px", backgroundColor: "#0d1317", borderRadius: "25px" }}>{img}</span>
                </div>

                <div className="kdaGrid" style={{ textAlign: "center" }}>

                    <span style={{ fontWeight: "bold" }}>{stats.kills}<span style={{ color: "#bfc2e6ff" }}>&nbsp;/&nbsp;</span>{stats.deaths}<span style={{ color: "#bfc2e6ff" }}>&nbsp;/&nbsp;</span>{stats.assists}</span>

                    <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{match.stats.kda}<span style={{ color: "#bfc2e6ff" }}>&nbsp;KDA</span></span>

                </div>

                <div className="csGrid" style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: "bold" }}>{match.stats.cs + match.stats.jungleCs} CS</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{Math.floor(match.stats.cs / (match.matchInfo.gameDuration / 60) * 10) / 10}<span style={{ color: "#bfc2e6ff" }}>&nbsp;/min</span></span>
                </div>


                <div className="objectivesGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", justifyContent: "center", textAlign: "center", rowGap: "4px" }}>
                    <span>
                        <img loading='lazy' src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/dragons.svg" alt='dragon icon' style= {{width:"16px", height:"16px"}} />
                    </span>

                    <span>
                        <img loading='lazy' src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/baron-nashor.svg" alt='baron icon' style= {{width:"16px", height:"16px"}} />

                    </span>

                    <span>
                        <img loading='lazy' src="https://cdn.mobalytics.gg/assets/lol/images/ui/icons/towers.svg" alt='tower icon' style= {{width:"16px", height:"16px"}} />
                    </span>

                    <span>
                        <img loading='lazy' src="https://cdn.mobalytics.gg/assets/common/icons/lol-game-objectives/inhibitor.svg" alt='inhibitor icon' style= {{width:"16px", height:"16px"}} />
                    </span>

                    <span>{stats.epicMonsters.dragons}</span>
                    <span>{stats.epicMonsters.barons}</span>
                    <span>{stats.towers}</span>
                    <span>{stats.inhibitors}</span>


                </div>

                

            </div>


        </div>
    );
}