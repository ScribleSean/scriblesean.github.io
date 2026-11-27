import type { Metadata } from "next";
import FeaturedGrid from "@/components/projects/FeaturedGrid";
import { ProjectsShell } from "@/components/projects/ProjectPage";
import styles from "@/components/projects/ProjectPage.module.css";
import { featured } from "@/data/featured-projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/projects/", title: "Projects", description: `Projects by Sean Arackal. ${featured.intro}` });

export default function ProjectsPage() {
  return (
    <ProjectsShell>
      <main>
        <section className={styles.intro}>
          <div className={`${styles.wrap} ${styles.introInner}`}>
            <p className={styles.eyebrow}><span className={styles.indicator} />Projects</p>
            <div className={styles.title}><h1>{featured.heading}</h1></div>
            <p className={styles.lead}>{featured.intro}</p>
          </div>
        </section>
        <div className={`${styles.wrap} ${styles.overviewGrid}`}>
          <FeaturedGrid headingLevel={2} />
        </div>
      </main>
    </ProjectsShell>
  );
}
