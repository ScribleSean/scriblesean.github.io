import ExperienceRoot from "@/components/scene/ExperienceRoot";
import type { Viewport } from "next";
import { sceneViewport } from "@/lib/site";

// Keep the desktop composition on phones. Omitting initialScale lets the
// browser fit this layout to the device, while preserving pinch-to-zoom.
export const viewport: Viewport = sceneViewport;

export default function Home() {
  return <ExperienceRoot />;
}
