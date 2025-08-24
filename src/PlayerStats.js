import { useParams } from 'react-router-dom';
import ChampSection from './Sections/ChampSection.js';
import DamageSection from './Sections/DamageSection.js';
import DateSection from './Sections/DateSection.js';
import FFSection from './Sections/FFSection.js';
import KDAsection from './Sections/KDAsection.js';
import LaneSection from './Sections/LaneSection.js';
import TotalTimeBreakdown from './Sections/TotalTimeBreakdown.js';


import '@fortawesome/fontawesome-free/css/all.min.css';


function PlayerStats() {
    const { puuid } = useParams();
    const year = "2025";

    return (
        <div className="centeredColumn" style={{ gap: "20px" }}>
            <DateSection puuid={puuid} year={year} />
            <FFSection puuid={puuid} year={year} />
            <ChampSection puuid={puuid} year={year} />
            <DamageSection puuid={puuid} year={year} />
            <KDAsection puuid={puuid} year={year} />
            <LaneSection puuid={puuid} year={year} />
            <TotalTimeBreakdown puuid={puuid} year={year} />

        <h6 id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</h6>

        </div>
    );
}

export default PlayerStats;
