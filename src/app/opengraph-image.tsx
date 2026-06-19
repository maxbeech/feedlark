import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Feedlark: free customer feedback boards, roadmap and changelog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fcfaf6 0%, #ffffff 55%)",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#df520c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 34, fontWeight: 700 }}>
            F
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1c1714" }}>Feedlark</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 62, fontWeight: 700, color: "#1c1714", marginTop: 40, lineHeight: 1.08, maxWidth: 1040 }}>
          <span>A roadmap your customers can&nbsp;</span>
          <span style={{ color: "#df520c" }}>watch you ship</span>
        </div>
        <div style={{ display: "flex", fontSize: 29, color: "#4a423c", marginTop: 28, fontFamily: "sans-serif" }}>
          Feedback boards, public roadmap and changelog. Unlimited users, no growth tax.
        </div>
      </div>
    ),
    { ...size },
  );
}
