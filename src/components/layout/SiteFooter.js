import { Link } from 'react-router-dom';



export default function SiteFooter() {

    return (
        <footer style={{
            backgroundColor: "#1d1d1f",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
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

                <Link className="site-header__title" to={"/"}>
                    <img src='/favicon-32x32.png' alt='Rifting Wrapped logo' style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#fff" }}>
                        Rifting Wrapped
                    </span>
                </Link>

                {[["https://ko-fi.com/notred27", "Support Us!"], ["/privacy", "Privacy Policy"], ["/terms", "Terms of Service"], ["/faq", "FAQ"]].map(([to, label]) => (
                    <Link key={to} to={to} className="footer-link" style={{ color: "#a0b4c8", textDecoration: "none", fontSize: "0.88rem", fontWeight: "600", margin: "4px" }}>
                        {label}
                    </Link>
                ))}
            </div>

            <p style={{
                maxWidth: "1200px",
                marginTop: "4px",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: " rgba(0,0,0,0.25)",
                color: "#9fb7d8",
                fontSize: "0.88rem",
                lineHeight: "1.5",
                textAlign: "left",
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