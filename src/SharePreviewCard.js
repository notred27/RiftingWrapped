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
    backgroundColor:"#0f2331",
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    minWidth:"400px",
    display:"block",
    textAlign:"left"
  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
  },
  content: {
    padding: 12,
    backgroundColor: "#0f2331",
  },
  title: {
    fontSize: 18,
    margin: "0 0 8px",
    color:"white",
    fontWeight:"bold"
  },
  description: {
    fontSize: 14,
    margin: "0 0 6px",
    color: "white",
  },
  note: {
    fontSize: 12,
    color: "#929292ff",
  },
};

export default SharePreviewCard;
