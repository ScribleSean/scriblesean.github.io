import type { Metadata } from "next";
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { JsonLd, pageMetadata, profileJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/",
  title: "Portfolio",
  description: "Sean Arackal builds AI agents and the tools around them. Projects, work history, research and résumé. Computer science, WPI.",
});

export default function PortfolioPage() {
  return <><JsonLd data={profileJsonLd} /><PortfolioContent /></>;
}
