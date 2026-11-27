import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ogImage } from "@/lib/site";

// A file name with an extension lets GitHub Pages serve it as image/png, which link previews need.
export const dynamic = "force-static";

export async function GET() {
  const scene = await readFile(path.join(process.cwd(), "public/scene/interactive-scene.jpg"));
  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", gap: 48, backgroundColor: "#edeae5", color: "#292d28", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: "-4px", lineHeight: 1 }}>Sean Arackal</div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 38, lineHeight: 1.25, color: "#292d28" }}>I build AI agents and the tools around them.</div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "#5b6056" }}>scriblesean.github.io</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>. */}
        <img src={`data:image/jpeg;base64,${scene.toString("base64")}`} alt="" width={480} height={270} style={{ borderRadius: 18, boxShadow: "0 18px 48px rgba(41,45,40,0.16)" }} />
      </div>
    ),
    { width: ogImage.width, height: ogImage.height },
  );
}
