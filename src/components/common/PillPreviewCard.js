export default function PillPreviewCard({ username, icon, hoursPlayed, champName, shareUrl, style }) {
    return (
        <div style={{ height: "160px", position: "relative", overflow: "hidden", borderRadius: "4px", margin: "10px" }} aria-label={`${username}'s Rifting Wrapped 2025 profile`} aria-hidden="false" >
            <a
                href={shareUrl}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <img
                    loading='lazy'
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`}
                    alt={`${champName} splash`}
                    style={{ height: "150px", transform: "translateY(-10%)" }}
                />
                <div style={{ position: "absolute", bottom: "0", left: "0", width: "100%", height: "50px", backgroundColor: "#0f2331", boxShadow: "2px -2px 2px 2px #0f2331" }}>
                    <p style={{ padding: "10px", margin: "0px", fontSize: "12px", textAlign: "left" }}><strong>

                        <img
                            src={icon}
                            alt="user-icon"
                            style={{ width: "14px", float: "left", marginRight: "4px", borderRadius: "2px" }}
                        />

                        {username} </strong>spent <strong>{hoursPlayed}</strong> hours on the Rift this year.</p>
                </div>
            </a>
        </div>
    );
};

// const styles = {
//   card: {
//     border: "1px solid #0f2331",
//     background: "url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Warwick_0.jpg)",
//     borderRadius: 8,
//     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//     overflow: "hidden",
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//     cursor: "pointer",
//     transition: "transform 0.2s ease",
//     width: "100%",
//     maxWidth: 400,
//     minWidth: 320,
//     margin: "12px auto",
//     display: "block",
//     textAlign: "left",
//   },
//   image: {
//     width: "100%",
//     height: "auto",
//     aspectRatio: "16/9",
//     objectFit: "cover",
//   },
//   content: {
//     padding: 12,
//     backgroundColor: "#0f2331",
//   },
//   title: {
//     fontSize: 16,
//     margin: "0 0 8px",
//     color: "white",
//     // fontWeight: "bold",
//   },
//   description: {
//     fontSize: 13,
//     margin: "0 0 6px",
//     color: "white",
//     lineHeight: 1.4,
//   },
//   note: {
//     fontSize: 12,
//     color: "#929292ff",
//   },
// };
