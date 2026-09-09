import type { Metadata } from "next";
import PrototypePortfolio from "@/components/prototype/PrototypePortfolio";

export const metadata: Metadata = { title: "Design prototype", robots: { index: false, follow: false } };
export default function PrototypePage() { return <PrototypePortfolio />; }
