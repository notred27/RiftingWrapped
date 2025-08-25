
export default function FFSection({ resource, puuid }) {
    const ffData = resource.read()[0];

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
                    fontSize: "40px",
                    overflow: "hidden",
                    display: "inline-block",
                    width: isLast ? "0.5em" : "auto",
                    clipPath: isLast ? "inset(0 30% 0 0)" : "none",
                }}
            >&nbsp;</i>);

        if ((i + 1) % 10 === 0) {
            icons.push(<br />)
        }
    }


    return (
        <div className='centeredColumn' >

            <div id='SurrenderGrid'>

                <h2>This year, your team forfeited <br /><span className='emphasize' style={{ color: "#d62525ff" }}>{ffData["numSurrenders"] - ffData["numSurrendersWon"]} times</span>.</h2>

                <h2>Opponents forfeited against you <br /><span className='emphasize' style={{ color: "#008e25" }}>{ffData["numSurrendersWon"]} times</span>.</h2>

                <h2><span className='emphasize' style={{ color: "#9c9c9cff" }}>{ffData["gamesEndingBefore16"]} of these games</span><br />ended before 16 minutes!</h2>
            </div>

            <br />

            <h2 style={{ textAlign: "center" }}>{icons} <br /><br />It's estimated that you saved at least<br /> <span className='emphasize' style={{ fontSize: "40px" }}>{hoursSaved} hours of playtime</span><br /> from these early surrenders.</h2>
        </div>
    )
}