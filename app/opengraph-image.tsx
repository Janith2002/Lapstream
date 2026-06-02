import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lapstream — Unofficial Motorsport Dashboard";
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
          background:
            "radial-gradient(circle at 25% 20%, #2a0a16 0%, #0a0a0f 45%), radial-gradient(circle at 85% 80%, #042a30 0%, transparent 50%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "#ff2d55",
              transform: "rotate(45deg)",
              borderRadius: 8,
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            Lapstream
          </div>
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            marginTop: 30,
            background: "linear-gradient(90deg,#ffffff,#ff2d55,#00e5ff)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Every race. Every region.
        </div>
        <div style={{ fontSize: 34, color: "#8b8b9e", marginTop: 24 }}>
          Free, unofficial motorsport dashboard — calendar, standings, results &
          3D circuit globe.
        </div>
      </div>
    ),
    size,
  );
}
