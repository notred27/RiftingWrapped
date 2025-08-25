export default function UserIntroFallback({ year }) {
  return (
    <div style={{ textAlign: "center", opacity: "0.1"}}>
      <div
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "#0f2331ff",
          margin: "0 auto",
          borderRadius: "8px"
        }}
      />
      
      <h1 className="emphasize" style={{ fontSize: "60px", margin: "2px" }}>
        ME#NA1
      </h1>
      
      <h2 style={{ marginTop: "4px", color: "#aaa" }}>
        Level 100
      </h2>

      <h1 className="emphasize">
        Let's dive into your League of Legends performance in{" "}
        <span className="emphasize" style={{ fontSize: "40px" }}>
          {year}
        </span>!
      </h1>
    </div>
  );
}
