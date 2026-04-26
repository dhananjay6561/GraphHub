import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GraphHub — Visualize any GitHub repo as a knowledge graph";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0c0e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <svg width="64" height="28" viewBox="0 0 64 28" fill="none">
            <line x1="12" y1="14" x2="28" y2="14" stroke="#8aab96" strokeWidth="2" />
            <line x1="36" y1="14" x2="52" y2="14" stroke="#8aab96" strokeWidth="2" />
            <circle cx="12" cy="14" r="6" fill="#8aab96" />
            <circle cx="32" cy="14" r="4.5" fill="#8aab96" />
            <circle cx="54" cy="14" r="3" fill="#8aab96" />
          </svg>
          <div style={{ display: "flex", fontSize: "48px", color: "#f0efe9", letterSpacing: "-1px" }}>
            <span style={{ fontWeight: 400 }}>graph</span>
            <span style={{ fontWeight: 700 }}>hub</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: "22px", color: "#6b6a65", textAlign: "center", maxWidth: "680px", lineHeight: "1.5" }}>
          Visualize any GitHub repo as an interactive knowledge graph
        </div>

        {/* Language chips */}
        <div style={{ display: "flex", gap: "12px", marginTop: "52px" }}>
          {["JavaScript", "TypeScript", "Python", "Go"].map((lang) => (
            <div
              key={lang}
              style={{
                background: "#111114",
                border: "1px solid #24242a",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#a09f9a",
                fontSize: "15px",
              }}
            >
              {lang}
            </div>
          ))}
        </div>

        {/* URL hint */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "14px",
            color: "#636360",
            fontFamily: "monospace",
          }}
        >
          graphhub.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
