import { useStatsResources } from "./../../resources/UserResourceContext.js";

export default function FFSection() {

    const {forfeit} = useStatsResources();
    console.log(forfeit.read())
    const ffData = forfeit.read()[0];
    

    const avgFullGameDuration = ffData["totalNonSurrenderTime"] / (ffData["numGames"] - ffData["numSurrenders"]);
    const estimatedFullDuration = avgFullGameDuration * (ffData["numSurrenders"]);
    const secondsSaved = estimatedFullDuration - ffData["totalSurrenderTime"];
    const hoursSaved = Math.floor(secondsSaved / 36) / 100;

    const icons = [];

    for (let i = 0; i < Math.floor(hoursSaved + 0.5); i++) {
        const isLast = i === Math.floor(hoursSaved + 0.5) - 1 && Math.floor(hoursSaved + 0.5) !== Math.floor(hoursSaved);
        icons.push(
            <i
                key={i}
                className="fa-solid fa-clock"
                style={{
                    color: "#ffffff",
                    fontSize: "clamp(20px, 5vw, 40px)",
                    display: "inline-block",
                    margin: "2px",
                    width: isLast ? "0.5em" : "auto",
                    clipPath: isLast ? "inset(0 30% 0 0)" : "none",
                }}
            ></i>
        );
    }

    return (
        <div className="centeredColumn" style={{ padding: "10px", gap: "20px" }}>
            <div
                id="SurrenderGrid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    width: "100%",
                    justifyItems: "center",
                    alignItems: "center",
                    textAlign: "center",
                    marginBottom: "20px",
                }}
            >
                <h2>
                    This year, your team forfeited <br />
                    <span className="emphasize" style={{ color: "#d62525ff" }}>
                        {ffData["numSurrenders"] - ffData["numSurrendersWon"]} times
                    </span>.
                </h2>

                <h2>
                    Opponents forfeited against you <br />
                    <span className="emphasize" style={{ color: "#008e25" }}>
                        {ffData["numSurrendersWon"]} times
                    </span>.
                </h2>

                <h2>
                    <span className="emphasize" style={{ color: "#9c9c9cff" }}>
                        {ffData["gamesEndingBefore16"]} of these games
                    </span>
                    <br />ended before 16 minutes!
                </h2>
            </div>

            <div style={{ textAlign: "center", wordWrap: "break-word" }}>
                {icons}
                <h2 style={{ marginTop: "20px", fontSize: "clamp(16px, 4vw, 20px)" }}>
                    It's estimated that you saved at least<br />
                    <span className="emphasize" style={{ fontSize: "clamp(24px, 5vw, 40px)" }}>
                        {hoursSaved} hours of playtime
                    </span>
                    <br />from these early surrenders.
                </h2>
            </div>
        </div>
    );
}
