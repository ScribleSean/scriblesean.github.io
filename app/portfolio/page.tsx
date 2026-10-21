import type { Metadata } from "next";
import PortfolioContent from "@/components/portfolio/PortfolioContent";

export const metadata: Metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return <PortfolioContent />;
}
