export const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Sean Arackal: AI, deep learning, and software engineering. An interactive portfolio built around a GameCube and CRT desktop.",
};

export const sceneViewport = { width: 1200, initialScale: undefined };

// How the desktop opens on touch phones after tapping the CRT.
// "crt": stays inside the 3D monitor (small on phones). "fullscreen": fills the phone at native size.
export type PhoneDesktop = "crt" | "fullscreen";
const phoneDesktopOverride = process.env.NEXT_PUBLIC_PHONE_DESKTOP;
export const phoneDesktop: PhoneDesktop = phoneDesktopOverride === "crt" || phoneDesktopOverride === "fullscreen" ? phoneDesktopOverride : "crt";
