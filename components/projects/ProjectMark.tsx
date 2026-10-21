import type { FeaturedProject } from "@/data/featured-projects";
import styles from "./ProjectMark.module.css";

/** The app icon, or a drawn mark for projects without one. */
export default function ProjectMark({ project, size = 56 }: { project: FeaturedProject; size?: number }) {
  if (project.icon) {
    // eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is.
    return <img className={`${styles.icon} ${project.iconFullBleed ? styles.fullBleed : ""}`} src={project.icon} alt="" width={size} height={size} />;
  }
  if (project.mark === "telescope") {
    return (
      <span className={`${styles.tile} ${styles.telescope}`} style={{ width: size, height: size }} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 10 11-6 3 5-11 6z" />
          <path d="m16 3 4 7M5.8 12 3 13.5M12 13v3m-5 5 5-5 5 5m-5-5v6" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${styles.tile} ${styles.blank}`} style={{ width: size, height: size }} aria-hidden="true">
      <span />
    </span>
  );
}
