import type { Metadata } from "next";
import { ResumeContent } from "@/components/files/FilesApp";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  return <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px", background: "white", minHeight: "100dvh" }}>
    <a className="print-resume" href="/resume/sean-arackal-resume.pdf" download style={{ display: "inline-block", marginRight: 20, marginBottom: 24, color: "#354c34" }}>Download résumé PDF</a>
    <a className="print-resume" href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">Open printable PDF</a>
    <ResumeContent />
    <style>{"@media print { .print-resume { display: none; } }"}</style>
  </main>;
}
