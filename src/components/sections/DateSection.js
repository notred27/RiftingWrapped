import { Suspense, lazy} from 'react';
import { useStatsResources } from "./../../resources/UserResourceContext.js";

const CalanderGraph = lazy(() =>  import('./../graphs/CalanderGraph.js'));

export default function DateSection() {
    const {date} = useStatsResources();
    const monthlyStats = date.read();

    const dates = Array(12).fill(0);
    let totalGames = 0;
    let totalUniqueDays = 0;

    for (let entry of monthlyStats) {
        const month = entry._id.month - 1;
        dates[month] = entry.uniqueDays;

        totalGames += entry.totalMatches;
        totalUniqueDays += entry.uniqueDays;
    }

    return (
        <div style={{ textAlign: "center" }}>

            <h2>
                This year, you visited the Rift in <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalGames} games of League</span><br />
                spread across <br />
                <span className='emphasize' style={{fontSize:"40px"}}>{totalUniqueDays} different days!</span>
            </h2>

            <h3>
                With this dedication, you were hitting the Rift at least once in every{" "}
                <span className="emphasize">
                    {(Math.floor(3650 / totalUniqueDays) / 10).toFixed(1)} days
                </span>.
            </h3>

            <Suspense fallback={<div style={{width:"50vw", height:"200px"}}></div>}>
                <CalanderGraph dates={dates} />
            </Suspense>
        </div>
    );
}
