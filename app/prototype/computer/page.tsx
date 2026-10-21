import type { Metadata } from "next";
import ExperienceRoot from "@/components/scene/ExperienceRoot";
import type { Viewport } from "next";
import { sceneViewport } from "@/lib/site";

// Keep the desktop composition on phones. Omitting initialScale lets the
// browser fit this layout to the device, while preserving pinch-to-zoom.
export const viewport: Viewport = sceneViewport;

export const metadata: Metadata = { title: "Computer prototype", robots: { index: false, follow: false } };
export default function ComputerPrototypePage() { return <ExperienceRoot prototype />; }
