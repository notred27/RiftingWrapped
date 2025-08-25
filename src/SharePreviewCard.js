const SharePreviewCard = ({ username, hoursPlayed, champName, shareUrl }) => {
  return (
    <div style={styles.card}>
      <a
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
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
    border: "1px solid #ddd",
    borderRadius: 8,
    width: 500,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    cursor: "pointer",
    transition: "transform 0.2s ease",

  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
  },
  content: {
    padding: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    margin: "0 0 8px",
    color:"black",
    fontWeight:"bold"
  },
  description: {
    fontSize: 14,
    margin: "0 0 6px",
    color: "#333",
  },
  note: {
    fontSize: 12,
    color: "#666",
  },
};

export default SharePreviewCard;
