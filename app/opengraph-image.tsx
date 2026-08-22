import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "Sean Arackal — AI Software Engineer";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0c0908",
          backgroundImage:
            "radial-gradient(circle at 78% 28%, rgba(232,161,90,0.35), transparent 42%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#e8a15a",
          }}
        >
          AI Software Engineer
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              color: "#f4ece2",
              lineHeight: 0.95,
              fontFamily: "Georgia, ui-serif, serif",
            }}
          >
            Sean Arackal
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#b7aaa0",
              maxWidth: 820,
            }}
          >
            I build the systems that make models useful.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
