"use client";

import { ResumeContent } from "@/components/files/FilesApp";

export default function ResumePage() {
  return <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px", background: "white", minHeight: "100dvh" }}>
    <a className="print-resume" href="/resume/sean-arackal-resume.pdf" download style={{ display: "inline-block", marginRight: 20, marginBottom: 24, color: "#354c34" }}>Download résumé PDF</a>
    <button className="print-resume" onClick={() => window.print()} style={{ padding: "9px 16px", marginBottom: 24, cursor: "pointer" }}>Print or save as PDF</button>
    <ResumeContent />
    <style>{"@media print { .print-resume { display: none; } }"}</style>
  </main>;
}
