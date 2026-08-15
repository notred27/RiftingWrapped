import { useStatsResources } from '../../resources/UserResourceContext.js';

import TableEntry from './../common/TableEntry.js';
import StatCard from '../layout/StatCard.js';
import StatGrid from '../layout/StatGrid.js';

import './LaneSection.css';


export default function CsSlide({ puuid }) {
    const { cs } = useStatsResources();
    const csArr = cs.read();

    return (
        <StatCard
            eyebrow={"You stayed busy, with an average of"}
            title={`${(Math.floor((csArr.stats[0].totalMinions + csArr.stats[0].totalJungleMinions) / csArr.stats[0].numGames * 10) / 10).toLocaleString()} CS `}
            subtitle={"per game"}
        >

            <StatGrid items={[
                { label: "Minions Killed", value: `${csArr.stats[0].totalMinions.toLocaleString()}` },
                { label: "Jungle Monsters Killed", value: `${csArr.stats[0].totalJungleMinions.toLocaleString()}` },

            ]} />

            <br />

            <div>
                <p className='tableLabel'>Your Games With The Highest CS</p>

                {csArr.bestCs.map((game, idx) => <TableEntry key={`Highest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}

            </div>

            <div >
                <h2>
                    Games under 100CS
                </h2>

                <p className='emphasize-lg'>{csArr.stats[0].lowCsGames.toLocaleString()} games</p>
                <p className='subtitle'>
                    * This excludes special game modes, and games that lasted less than 15 minutes.
                </p>
            </div>

            {/* <div>
                        {csArr.worstCs.map((game, idx) => <TableEntry key={`Lowest_CS_Entry_${idx}`} puuid={puuid} match={game} />)}
                        <p className='tableLabel'>Your Games With The Lowest CS</p>
                    </div> */}

        </StatCard>


    );
}
