import { useStatsResources } from "./../../resources/UserResourceContext.js";


import StatCard from "../layout/StatCard.js";
import StatGrid from "../layout/StatGrid.js";

import FFGraph from "../graphs/FFGraph.js";

import './styles.css'

export default function FFSection() {
    const { forfeit } = useStatsResources();
    const ffData = forfeit.read()[0];

    const avgFullGameDuration = ffData["totalNonSurrenderTime"] / (ffData["numGames"] - ffData["numSurrenders"]);
    const estimatedFullDuration = avgFullGameDuration * (ffData["numSurrenders"]);
    const secondsSaved = estimatedFullDuration - ffData["totalSurrenderTime"];
    const hoursSaved = Math.floor(secondsSaved / 36) / 100;
    const youFFd = ffData["numSurrenders"] - ffData["numSurrendersWon"];
    const enemiesFFd = ffData["numSurrendersWon"];
 

    return (
        <StatCard
            eyebrow="You ended some games early, but refused to end others"
        >

            <FFGraph youFFd={youFFd} enemiesFFd={enemiesFFd} />
            <StatGrid
                items={[
                    // { label: "You FF'd", value: `${ffData["numSurrenders"] - ffData["numSurrendersWon"]} games` },
                    // { label: "Enemies FF's", value: `${ffData["numSurrendersWon"]} games` },
                    { label: "FF-15'd", value: `${ffData["gamesEndingBefore16"]} games` },
                    { label: "Time Saved From Surrenders", value: `${hoursSaved} hrs` },


                ]}
            />

        </StatCard>
    );
}
