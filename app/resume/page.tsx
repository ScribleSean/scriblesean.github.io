"use client";

import { ResumeContent } from "@/components/files/FilesApp";

export default function ResumePage() {
  return <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px", background: "white", minHeight: "100dvh" }}>
    <button className="print-resume" onClick={() => window.print()} style={{ padding: "9px 16px", marginBottom: 24, cursor: "pointer" }}>Print or save as PDF</button>
    <ResumeContent />
    <style>{"@media print { .print-resume { display: none; } }"}</style>
  </main>;
}
