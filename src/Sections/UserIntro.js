export default function UserIntro({ resource, year }) {
  const userInfo = resource.read();

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={`${userInfo.icon}`}
        alt="user icon"
        style={{ width: "200px", height:"200px", borderRadius:"8px" }}
      />
      <h1 className="emphasize" style={{ fontSize: "60px", margin: "2px" }}>
        {userInfo.displayName}#{userInfo.tag}
      </h1>
      <h2 style={{ marginTop: "4px", color: "#aaa" }}>Level {userInfo.level}</h2>

        <h1 className='emphasize'>Let's dive in to your League of Legend's performance in <span className='emphasize' style={{ fontSize: "40px" }}>{year}</span>!</h1>
    </div>
  );
}
