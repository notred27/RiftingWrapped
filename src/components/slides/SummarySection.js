

export default function SummarySection({ puuid, year }) {

    let username = "MrWarwickWide#2725"


    return (
        <div style={{ height: "100vh", maxWidth: "450px", color: "#ECE9D7", fontFamily: 'Inter', textAlign: "center", background: "linear-gradient(180deg, rgba(15,25,35,0.92), rgba(0,0,0,0.85))" }}>

            <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                <img src="https://ddragon.leagueoflegends.com/cdn/15.20.1/img/profileicon/6812.png" style={{ height: "30px", borderRadius: "4px", marginRight: "5px" }} ></img>
                <p style={{ fontSize: "26px", fontWeight: "900", margin: "0px" }}>{username.split("#")[0].toUpperCase()}<span style={{ fontSize: "18px", fontWeight: "800", color: "#6C6C6C" }}>#{username.split("#")[1].toUpperCase()}</span></p>

            </div>

            <div
                style={{
                    width: "400px",
                    height: "200px",
                    overflow: "hidden",
                    margin: "0 10px",
                    position: "relative",
                    borderRadius: "4px"
                }}
            >
                <img
                    src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Warwick_0.jpg"
                    alt="Warwick"
                    style={{
                        width: "100%",
                        height: "240px",
                        objectFit: "cover",
                        transform: "translateY(-30px)"
                    }}
                />
            </div>

<div style={{ display: "flex", width: "100%", margin: "10px", justifyContent: "space-evenly" }}>
            <div style={{ textAlign: "left", width: "fit-content" }}>
                <p style={{ margin: "2px", fontWeight: "lighter" }}>Top Game Modes:</p>
                <ol style={{ margin: "4px", paddingLeft: "30px" }} >
                    <li style={{ fontSize: "20px", fontWeight: "800" }}>Swiftplay <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>205 games</span></li>
                    <li style={{ fontSize: "20px", fontWeight: "800" }}>Arena <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>93 games</span></li>
                    <li style={{ fontSize: "20px", fontWeight: "800" }}>Brawl <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>27 games</span></li>
                    <li style={{ fontSize: "20px", fontWeight: "800" }}>Ranked <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>5 games</span></li>

                </ol>
            </div>

                    <img style={{ height: "100px" }} src='/favicon-32x32.png' alt='rifting wrapped logo'></img>
            </div>

            <div style={{ display: "flex", width: "100%", margin: "10px", justifyContent: "space-evenly" }}>
                <div style={{ textAlign: "left" }}>
                    <p>
                        <span style={{ fontSize: "20px", fontWeight: "800" }}>2,223</span> <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>kills</span>

                    </p>
                    <img style={{ height: "100px" }} src='/favicon-32x32.png' alt='rifting wrapped logo'></img>

                </div>

                <div style={{ textAlign: "left" }}>
                    <p>
                        <span style={{ fontSize: "20px", fontWeight: "800" }}>3,342</span> <span style={{ fontSize: "14px", fontWeight: "400", color: "#6C6C6C" }}>deaths</span>

                    </p>
                    <img style={{ height: "100px" }} src='/favicon-32x32.png' alt='rifting wrapped logo'></img>

                </div>

            </div>

            <div style={{ display: "flex", width: "100%", margin: "10px", justifyContent: "space-evenly" }}>
                <div style={{ textAlign: "left" }}>
                    <p>Hours Played:</p>
                    <p style={{ fontSize: "20px", fontWeight: "800" }}>169 Hours</p>
                </div>

                <div style={{ textAlign: "left" }}>
                    <p>Most Used Ping:</p>
                    <p style={{ fontSize: "20px", fontWeight: "800" }}>On My Way</p>
                </div>

            </div>




            <p>Check me out on <img style={{ height: "20px" }} src='/favicon-32x32.png' alt='rifting wrapped logo'></img><span style={{ fontWeight: "bolder" }}>RIFTINGWRAPPED.COM</span></p>
        </div>
    )
}