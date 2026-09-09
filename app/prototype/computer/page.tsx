import type { Metadata } from "next";
import ExperienceRoot from "@/components/scene/ExperienceRoot";

export const metadata: Metadata = { title: "Computer prototype", robots: { index: false, follow: false } };
export default function ComputerPrototypePage() { return <ExperienceRoot prototype />; }
