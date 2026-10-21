import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ogImage } from "@/lib/site";

// The social card is written to out/og.png at build time. A file name with an
// extension lets GitHub Pages serve it as image/png, which link previews need.
export const dynamic = "force-static";

export async function GET() {
  const scene = await readFile(path.join(process.cwd(), "public/scene/interactive-scene.jpg"));
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f1f0e9",
          color: "#262820",
          padding: "48px 60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#646d4e" }}>
          <span>SOFTWARE · RESEARCH · TEACHING</span>
          <span>scriblesean.github.io</span>
        </div>
        <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: "-6px", marginTop: 24 }}>
          Sean Arackal
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 465 }}>
            <div style={{ display: "flex", fontSize: 36, color: "#646d4e", marginBottom: 18 }}>AI. Deep learning.</div>
            <div style={{ display: "flex", fontSize: 36 }}>Software engineering.</div>
            <div style={{ display: "flex", marginTop: 36, fontSize: 23, color: "#64675d" }}>Step inside my portfolio</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>. */}
          <img src={`data:image/jpeg;base64,${scene.toString("base64")}`} alt="" width={560} height={315} style={{ borderRadius: 22 }} />
        </div>
        <div style={{ display: "flex", height: 2, backgroundColor: "#a2ad8b", width: "100%" }} />
      </div>
    ),
    { width: ogImage.width, height: ogImage.height },
  );
}
