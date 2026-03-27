import { ImageResponse } from "next/og";

/** Required when using `output: "export"` (static HTML export). */
export const dynamic = "force-static";

export const alt = "Sean Arackal";

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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 500,
            color: "#00ff88",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            letterSpacing: "-0.02em",
            textAlign: "center",
            paddingLeft: 48,
            paddingRight: 48,
          }}
        >
          {"{ Sean Arackal }"}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#a1a1aa",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          Portfolio
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
