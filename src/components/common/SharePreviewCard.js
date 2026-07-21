const SharePreviewCard = ({ username, hoursPlayed, champName, shareUrl, style }) => {
  return (
    <div style={{ ...styles.card, ...style }} aria-label={`${username}'s Rifting Wrapped 2026 profile`} aria-hidden="false" >
      <a
        href={shareUrl}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
          loading='lazy'
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`}
          alt={`${champName} splash`}
          style={styles.image}
        />
        <div style={styles.content}>
          <h2 style={styles.title}>{username}'s Rifting Wrapped 2025</h2>
          <p style={styles.description}>
            {username} spent <strong>{hoursPlayed}</strong> hours on the Rift this year. Check out their top stats!
          </p>
        </div>
      </a>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid var(--second-bg-color)",
    backgroundColor: "var(--second-bg-color)",
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    width: "100%",
    maxWidth: 400,
    minWidth: 320,
    margin: "12px auto",
    display: "block",
    textAlign: "left",
  },
  image: {
    width: "100%",
    height: "auto",
    aspectRatio: "16/9",
    objectFit: "cover",
  },
  content: {
    padding: 12,
    backgroundColor: "var(--second-bg-color)",
  },
  title: {
    fontSize: 16,
    margin: "0 0 8px",
    color: "var(--text-color)",
    fontWeight: "bold",
  },
  description: {
    fontSize: 13,
    margin: "0 0 6px",
    color: "var(--text-color)",
    lineHeight: 1.4,
  },
  note: {
    fontSize: 12,
    color: "var(--text-muted-color)",
  },
};


export default SharePreviewCard;
