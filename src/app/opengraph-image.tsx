import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Feedlark — free customer feedback boards, roadmap & changelog";
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
          background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 34, fontWeight: 800 }}>
            F
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#0f1729" }}>Feedlark</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 64, fontWeight: 800, color: "#0f1729", marginTop: 40, lineHeight: 1.1, maxWidth: 1000 }}>
          <span>Customer feedback that doesn&apos;t&nbsp;</span>
          <span style={{ color: "#ea580c" }}>tax your growth</span>
        </div>
        <div style={{ fontSize: 30, color: "#475569", marginTop: 28 }}>
          Free feedback boards, public roadmap & changelog. Unlimited users — no growth tax.
        </div>
      </div>
    ),
    { ...size },
  );
}
