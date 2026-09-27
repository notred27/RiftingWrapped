const SharePreviewCard = ({ username, hoursPlayed, champName, shareUrl, year = 2026, style }) => {
  return (
    <div style={{ ...styles.card, ...style }} aria-label={`${username}'s Rifting Wrapped ${year} profile`} aria-hidden="false" >
      <a
        href={shareUrl}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {champName && (
          <img
            loading='lazy'
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`}
            alt={`${champName} splash`}
            style={styles.image}
          />
        )}
        <div style={styles.content}>
          <h2 style={styles.title}>{username}'s Rifting Wrapped {year}</h2>
          <p style={styles.description}>
            {username} spent <strong>{hoursPlayed}</strong> {hoursPlayed === 1 ? 'hour' : 'hours'} on the Rift this year. Check out their top stats!
          </p>
        </div>
      </a>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid var(--border-subtle)",
    backgroundColor: "var(--second-bg-color)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    width: "100%",
    maxWidth: 440,
    margin: "0 auto",
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
    padding: "14px 16px",
    backgroundColor: "var(--second-bg-color)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fs-sm)",
    margin: "0 0 8px",
    color: "var(--text-color)",
    fontWeight: "bold",
  },
  description: {
    fontSize: "var(--fs-2xs)",
    margin: 0,
    color: "var(--text-muted-color)",
    lineHeight: 1.4,
  },
  note: {
    fontSize: 12,
    color: "var(--text-muted-color)",
  },
};


export default SharePreviewCard;
