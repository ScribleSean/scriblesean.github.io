import type { FeaturedProject } from "@/data/featured-projects";
import styles from "./ProjectMark.module.css";

export default function ProjectMark({ project, size = 56 }: { project: FeaturedProject; size?: number }) {
  if (project.icon) {
    // eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is.
    return <img className={`${styles.icon} ${project.iconFullBleed ? styles.fullBleed : ""}`} src={project.icon} alt="" width={size} height={size} />;
  }
  if (project.mark === "refractor") {
    // Observatory's app icon, the Refractor: a telescope on a tripod pointed at a star, its tube 62% full.
    // The shapes are appIconSvg(64) from Observatory's lib/glance-icon.mjs; the tile and ink follow the color scheme.
    return (
      <span className={styles.refractor} style={{ width: size, height: size }} aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14.4" className={styles.refractorTile} />
          <g className={styles.refractorInk}>
            <line x1="17.556" y1="38.667" x2="39.778" y2="27.556" strokeWidth="8.889" opacity="0.28" />
            <line x1="17.556" y1="38.667" x2="31.333" y2="31.778" strokeWidth="8.889" />
            <line x1="14.222" y1="40.333" x2="18.389" y2="38.25" strokeWidth="4.444" />
            <line x1="28.667" y1="38.667" x2="23.111" y2="49.778" strokeWidth="3.333" strokeLinecap="round" />
            <line x1="28.667" y1="38.667" x2="34.222" y2="49.778" strokeWidth="3.333" strokeLinecap="round" />
            <circle cx="45.333" cy="20.889" r="4.444" stroke="none" />
          </g>
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
