import type { Metadata } from "next";
import PhotosApp from "@/components/photos/PhotosApp";

export const metadata: Metadata = { title: "Photo box prototype", robots: { index: false, follow: false } };
export default function PhotoPrototypePage() { return <><a href="/prototype/" style={{ display: "block", padding: "14px 25px", background: "#22241f", color: "#f6f0e3", font: "12px Arial" }}>← Back to prototype</a><PhotosApp /></>; }
