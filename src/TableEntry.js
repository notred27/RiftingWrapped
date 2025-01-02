import top from './images/top.svg'
import mid from './images/mid.svg'
import bot from './images/bot.svg'
import sup from './images/sup.svg'
import jg from './images/jg.svg'
import './table.css'


export default function TableEntry({ puuid, match }) {
    const targetPlayer = match.metadata.participants.indexOf(puuid)
    const stats = match.info.participants[targetPlayer]

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
        }
    }


    let img
    switch (stats.individualPosition) {
        case "TOP":
            img = <img src={top} alt='top_icon' />
            break;

        case "BOTTOM":
            img = <img src={bot} alt='bot_icon' />
            break;

        case "MIDDLE":
            img = <img src={mid} alt='mid_icon' />
            break;

        case "UTILITY":
            img = <img src={sup} alt='sup_icon' />
            break;

        case "JUNGLE":
            img = <img src={jg} alt='jg_icon' />
            break;

        default:
            img = <p>{stats.teamPosition}</p>
    }

    const date = new Date(match.info.gameCreation)


    return (
        <div className='tableEntry'>

            <p>{monthInt2String(date.getMonth())} {date.getDate()}</p>

            <span>{img}</span>

            <p>{stats.championName}</p>

            <p className='kda_txt'>{stats.kills + " / " + stats.deaths + " / " + stats.assists}</p>

            {stats.win ? <span className='win_span'>Win</span> : <span className='loss_span'>Loss</span>}

            <p>{Math.floor(match.info.gameDuration / 60) + "m" + match.info.gameDuration % 60 + "s"}</p>

        </div>
    );
}