import { Link } from 'react-router-dom';



export default function SiteFooter() {

    return (
        <footer style={{
            backgroundColor: "#1d1d1f",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            alignItems: "start",
            justifyContent: "space-between",
            gap: "24px",
            padding: "clamp(24px, 4vh, 48px) clamp(16px, 5vw, 64px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px"
            }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#fff" }}>
                        Rifting Wrapped 2026
                    </span>
                </span>

                {[["/", "Home"], ["/faq", "FAQ"], ["https://ko-fi.com/notred27", "Support Us"]].map(([to, label]) => (
                    <Link key={to} to={to} className="footer-link" style={{ color: "#a0b4c8", textDecoration: "none", fontSize: "0.88rem", fontWeight: "600" }}>
                        {label}
                    </Link>
                ))}
            </div>

            <p style={{
                fontSize: "0.78rem",
                color: "#7a8a99",
                lineHeight: "1.6",
                margin: "0",
                maxWidth: "1200px"
            }}>
                All data used in Rifting Wrapped comes from the public League of Legends
                matches a user has participated in. Rifting Wrapped isn't endorsed by Riot
                Games and doesn't reflect the views or opinions of Riot Games or anyone
                officially involved in producing or managing Riot Games properties. Riot Games,
                and all associated properties are trademarks or registered trademarks of
                Riot Games, Inc.
            </p>
        </footer>

    );
}