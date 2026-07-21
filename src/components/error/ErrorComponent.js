export default function ErrorComponent({ error }) {
  const message = error?.message || "Unknown error";

  let status = 500;
  if (message.includes("404")) status = 404;

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>{status === 404 ? "404 – Not Found" : "500 – Server Error"}</h1>
      <p>{message}</p>
    </div>
  );
}
