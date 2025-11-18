export default function UserError({ error }) {
    const message = error?.message || "Unknown error";

    let status = 500;
    if (message.includes("404")) status = 404;

    return (
        <div className="fade-in" style={{ textAlign: "center", padding: "40px" }}>
            <h1>{status === 404 ? "404 – User Not Found" : "500 – Internal Server Error"}</h1>

            {status === 404 ?
                <p>
                    This user could not be found. Please ensure that you entered a valid puuid.
                    <br />
                    If this error persists, please manually re-enter the user's information on our home page.
                </p>
            :
                <p>Something went wrong. Please try again later.</p>
            }
        </div>
    );
}
