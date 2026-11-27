import type { Metadata } from "next";
import { ProjectsShell } from "@/components/projects/ProjectPage";
import styles from "@/components/projects/ProjectPage.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/resume/", title: "Résumé", description: "Sean Arackal’s résumé: computer science at WPI, AI and web projects, and teaching and work history." });

const pdf = "/resume/sean-arackal-resume.pdf";

export default function ResumePage() {
  return (
    <ProjectsShell>
      <main className={`${styles.wrap} ${styles.resume}`}>
        <div className={styles.resumeHead}>
          <h1>Résumé</h1>
          <div className={styles.actions}>
            <a className={styles.primary} href={pdf} download>Download PDF</a>
            <a className={styles.secondary} href={pdf} target="_blank" rel="noreferrer">Open PDF ↗</a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is. */}
        <img className={styles.resumeSheet} src="/resume/sean-arackal-resume.png" alt="Sean Arackal's résumé. The PDF has the same content as searchable text." width={928} height={1200} />
      </main>
    </ProjectsShell>
  );
}
