"use client";

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fcfaf6", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1714" }}>Something went wrong</h1>
          <p style={{ color: "#857a70", marginTop: "0.5rem" }}>{error.message || "An unexpected error occurred."}</p>
          <button onClick={reset} style={{ marginTop: "1rem", background: "#df520c", color: "#fff", border: 0, borderRadius: "0.75rem", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
