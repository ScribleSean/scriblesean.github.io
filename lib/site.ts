export const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Sean Arackal: I build AI agents and the tools around them. A screenshot of the 3D GameCube and CRT desk.",
};

// The home page uses the device width like every other page (the 3D camera fits itself to the screen shape), with the room color for the browser bar.
export const sceneViewport = { width: "device-width", initialScale: 1, themeColor: "#e7dece" };

// How the desktop opens on touch phones after tapping the CRT.
// "crt": stays inside the 3D monitor (small on phones). "fullscreen": fills the phone at native size.
export type PhoneDesktop = "crt" | "fullscreen";
const phoneDesktopOverride = process.env.NEXT_PUBLIC_PHONE_DESKTOP;
export const phoneDesktop: PhoneDesktop = phoneDesktopOverride === "crt" || phoneDesktopOverride === "fullscreen" ? phoneDesktopOverride : "crt";
