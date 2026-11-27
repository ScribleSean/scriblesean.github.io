import ExperienceRoot from "@/components/scene/ExperienceRoot";
import type { Metadata, Viewport } from "next";
import { sceneViewport } from "@/lib/site";
import { JsonLd, homeDescription, pageMetadata, websiteJsonLd } from "@/lib/seo";

export const viewport: Viewport = sceneViewport;
export const metadata: Metadata = pageMetadata({ path: "/", description: homeDescription });

export default function Home() {
  return <><JsonLd data={websiteJsonLd} /><ExperienceRoot /></>;
}
