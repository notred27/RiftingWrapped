export default function StatDisplayError({ error }) {
    const message = error?.message || "Unknown error";

    let status = 500;
    if (message.includes("404")) status = 404;

    return (
        <div className="fade-in" style={{ textAlign: "center", padding: "40px" }}>
            <h1>{status === 404 ? "404 – User Not Found" : "500 – Internal Server Error"}</h1>

            <p>
                It looks like you haven't played any matches this year...
                <br />
                Head back to the rift so you can check out your stats!
            </p>
        </div>
    );
}
