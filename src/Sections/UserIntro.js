export default function UserIntro({ resource, year }) {
  const userInfo = resource.read();

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      <img
        src={`${userInfo.icon}`}
        alt="user icon"
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "8px",
          maxWidth: "40vw",
        }}
      />
      <h1
        className="emphasize"
        style={{
          fontSize: "clamp(20px, 5vw, 36px)",
          margin: "6px 0 2px",
          whiteSpace: "nowrap",
        }}
      >
        {userInfo.displayName}#{userInfo.tag}
      </h1>
      <h2 style={{ marginTop: "4px", color: "#aaa", fontSize: "18px" }}>
        Level {userInfo.level}
      </h2>

      <h1
        className="emphasize"
        style={{
          fontSize: "22px",
          marginTop: "10px",
          lineHeight: "1.3",
        }}
      >
        Let's dive in to your League of Legends performance in{" "}
        <span className="emphasize" style={{ fontSize: "28px" }}>
          {year}
        </span>
        !
      </h1>
    </div>
  );
}
