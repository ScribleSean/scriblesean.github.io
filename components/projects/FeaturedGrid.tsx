import { featuredProjects, projectHref, type FeaturedProject } from "@/data/featured-projects";
import ProjectMark from "./ProjectMark";
import styles from "./FeaturedGrid.module.css";

function poster(project: FeaturedProject) {
  return project.card ?? project.film?.poster ?? project.hero?.light;
}

// headingLevel follows the page: h3 under the portfolio's Projects heading, h2 on /projects.
export default function FeaturedGrid({ newTab = false, teasers = true, headingLevel = 3 }: { newTab?: boolean; teasers?: boolean; headingLevel?: 2 | 3 }) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  const target = newTab ? { target: "_blank", rel: "noreferrer" } : {};
  const projects = teasers ? featuredProjects : featuredProjects.filter((project) => !project.teaser);
  return (
    <div className={styles.wrap}><ol className={styles.grid}>
      {projects.map((project) => {
        const image = poster(project);
        return (
          <li key={project.slug} className={`${styles.card} ${project.teaser ? styles.teaser : ""}`}>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is.
              <img className={styles.poster} src={image} alt="" width={16} height={9} loading="lazy" decoding="async" />
            )}
            <div className={styles.body}>
            <div className={styles.top}>
              <ProjectMark project={project} size={30} />
              <Title>
                {project.teaser ? (
                  project.name
                ) : (
                  <a className={styles.cardLink} href={projectHref(project.slug)} {...target}>
                    {project.name}
                  </a>
                )}
              </Title>
              <span className={styles.status}>{project.status}</span>
            </div>
            <p className={styles.summary}>{project.tagline ?? project.summary}</p>
            {project.kind && (
              <p className={styles.meta}>
                <span>{project.kind}</span>
                <span className={styles.links}>
                  {project.links?.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>
                  ))}
                </span>
              </p>
            )}
            </div>
          </li>
        );
      })}
    </ol></div>
  );
}
