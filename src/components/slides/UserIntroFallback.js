export default function UserIntroFallback({ year }) {
    return (
        <div style={{ textAlign: "center", opacity: "0.1", paddingTop: "30px" }}>
            <div
                style={{
                    width: "200px",
                    height: "200px",
                    backgroundColor: "var(--second-bg-color)",
                    margin: "0 auto",
                    borderRadius: "8px",
                }}
            />

            <h1

                className="emphasize loading-text"
                style={{
                    fontSize: "var(--fs-display-md)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: "6px 0 2px",
                }}
            >
                USER#TAG
            </h1>

            <div style={{ width: "100%", justifyContent: "center", display: "flex" }}>
                <p className="loading-text" style={{ maxWidth: "80%" }}>
                    Loading your League of Legends performance in&nbsp;<span className="emphasize" >{year}</span>
                </p>
            </div>

        </div>
    );
}
