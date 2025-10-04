export default function UserIntroFallback({ year }) {
  return (
    <div style={{ textAlign: "center", opacity: "0.1" }}>
      <div
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "#0f2331ff",
          margin: "0 auto",
          borderRadius: "8px",
        }}
      />

      <h1
        className="emphasize"
        style={{
          fontSize: "clamp(20px, 5vw, 36px)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "95vw",
          margin: "6px 0 2px",
        }}
      >
        ME#NA1
      </h1>

      <h2 style={{ marginTop: "4px", color: "#aaa", fontSize: "clamp(14px, 3vw, 20px)" }}>
        Level 100
      </h2>

      <h1
        className="emphasize"
        style={{
          fontSize: "clamp(24px, 5vw, 40px)",
          marginTop: "12px",
          lineHeight: 1.2,
        }}
      >
        Let's dive into your League of Legends performance in{" "}
        <span
          className="emphasize"
          style={{ fontSize: "clamp(20px, 4vw, 36px)" }}
        >
          {year}
        </span>
        !
      </h1>
    </div>
  );
}
