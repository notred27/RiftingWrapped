const SharePreviewCard = ({ username, hoursPlayed, champName, shareUrl, style }) => {
  return (
    <div style={{ ...styles.card, ...style }} aria-label={`${username}'s Rifting Wrapped 2025 profile`} aria-hidden="false" >
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
          <h2 style={styles.title}>Rifting Wrapped - {username}'s 2025 Stats</h2>
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
    border: "1px solid #0f2331",
    backgroundColor: "#0f2331",
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
    backgroundColor: "#0f2331",
  },
  title: {
    fontSize: 16,
    margin: "0 0 8px",
    color: "white",
    fontWeight: "bold",
  },
  description: {
    fontSize: 13,
    margin: "0 0 6px",
    color: "white",
    lineHeight: 1.4,
  },
  note: {
    fontSize: 12,
    color: "#929292ff",
  },
};


export default SharePreviewCard;
