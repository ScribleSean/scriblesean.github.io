import { featuredProjects, projectHref } from "@/data/featured-projects";
import ProjectMark from "./ProjectMark";
import styles from "./FeaturedGrid.module.css";

/**
 * The featured projects as a row of cards. Inside the 3D desktop the links
 * open in a new tab so the visitor does not leave the scene.
 */
export default function FeaturedGrid({ newTab = false }: { newTab?: boolean }) {
  const target = newTab ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <div className={styles.wrap}><ol className={styles.grid}>
      {featuredProjects.map((project) => (
        <li key={project.slug} className={`${styles.card} ${project.teaser ? styles.teaser : ""}`}>
          <div className={styles.top}>
            <ProjectMark project={project} size={48} />
            <span className={styles.verb}>{project.verb}</span>
          </div>
          <h3>
            {project.teaser ? (
              project.name
            ) : (
              <a className={styles.cardLink} href={projectHref(project.slug)} {...target}>
                {project.name}
              </a>
            )}
          </h3>
          <p className={styles.summary}>{project.tagline ?? project.summary}</p>
          <p className={styles.meta}>
            <span>{project.kind ?? "In private"}</span>
            <span className={styles.status}>{project.status}</span>
          </p>
        </li>
      ))}
    </ol></div>
  );
}
