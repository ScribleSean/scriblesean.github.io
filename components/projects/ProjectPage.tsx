import Link from "next/link";
import { featured, featuredProjects, getProject, projectHref, projectPages, type FeaturedProject, type ProjectImage } from "@/data/featured-projects";
import ProjectMark from "./ProjectMark";
import styles from "./ProjectPage.module.css";

const updated = new Date(`${featured.checkedThrough}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** Light image with an optional dark variant that follows the system appearance. */
function Shot({ image, priority = false }: { image: ProjectImage; priority?: boolean }) {
  return (
    <picture className={styles.shot}>
      {image.darkSrc && <source media="(prefers-color-scheme: dark)" srcSet={image.darkSrc} />}
      <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading={priority ? "eager" : "lazy"} decoding="async" />
    </picture>
  );
}

export function ProjectsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <div className={`${styles.barInner} ${styles.wrap}`}>
          <Link className={styles.wordmark} href="/portfolio/">Sean Arackal</Link>
          <nav aria-label="Projects navigation">
            <Link href="/projects/">Projects</Link>
            <Link href="/portfolio/">Portfolio</Link>
            <Link href="/">3D site ↗</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className={`${styles.footer} ${styles.wrap}`}>
        <span>Updated {updated}</span>
        <Link href="/portfolio/#contact">Get in touch ↗</Link>
      </footer>
    </div>
  );
}

export default function ProjectPage({ project }: { project: FeaturedProject }) {
  const index = projectPages.findIndex((item) => item.slug === project.slug);
  const previous = projectPages[(index - 1 + projectPages.length) % projectPages.length];
  const next = projectPages[(index + 1) % projectPages.length];
  const teaser = featuredProjects.find((item) => item.teaser);

  return (
    <ProjectsShell>
      <main>
        <section className={`${styles.intro} ${project.hero || project.heroPlaceholder ? "" : styles.introNoHero}`}>
          <div className={`${styles.wrap} ${styles.introInner}`}>
            <p className={styles.eyebrow}>
              <span className={styles.indicator} />
              {[project.verb, project.kind].filter(Boolean).join(" · ")}
            </p>
            <div className={styles.title}>
              <ProjectMark project={project} size={76} />
              <h1>{project.name}</h1>
            </div>
            <p className={styles.tagline}>{project.tagline}</p>
            <div className={styles.introFoot}>
              <p>{project.summary}</p>
              <div className={styles.actions}>
                <span className={styles.status}>{project.status}</span>
                {project.links?.map((link, i) => (
                  <a key={link.href} className={i === 0 ? styles.primary : styles.secondary} href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {project.hero && (
          <div className={`${styles.wrap} ${styles.heroShot}`}>
            <Shot priority image={{ src: project.hero.light, darkSrc: project.hero.dark, width: project.hero.width, height: project.hero.height, alt: project.hero.alt }} />
          </div>
        )}

        {!project.hero && project.heroPlaceholder && (
          <div className={`${styles.wrap} ${styles.heroShot}`}>
            <div className={styles.placeholder}>
              <ProjectMark project={project} size={64} />
              <p>{project.heroPlaceholder}</p>
            </div>
          </div>
        )}

        <div className={`${styles.wrap} ${styles.body} ${project.hero || project.heroPlaceholder ? "" : styles.bodyNoHero}`}>
          <div className={styles.sections}>
            {project.sections?.map((section, i) => (
              <section key={section.title}>
                <p className={styles.sectionIndex}>{String(i + 1).padStart(2, "0")}</p>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </div>
          <aside className={styles.aside}>
            {project.highlights && (
              <div>
                <h2 className={styles.asideHeading}>Details</h2>
                <ul className={styles.highlights}>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            {project.stack && (
              <div>
                <h2 className={styles.asideHeading}>Built with</h2>
                <p className={styles.stack}>{project.stack.map((item) => <span key={item}>{item}</span>)}</p>
              </div>
            )}
            {!project.links?.length && <p className={styles.privateNote}>The source is private for now.</p>}
          </aside>
        </div>

        {project.gallery && project.gallery.length > 0 && (
          <div className={`${styles.wrap} ${styles.gallery}`}>
            {project.gallery.map((image) => (
              <figure key={image.src}>
                <Shot image={image} />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        {project.connects && project.connects.length > 0 && (
          <section className={`${styles.wrap} ${styles.connects}`} aria-labelledby="connects-heading">
            <h2 id="connects-heading" className={styles.asideHeading}>Works alongside</h2>
            <ul>
              {project.connects.map((link) => {
                const other = getProject(link.slug);
                if (!other) return null;
                return (
                  <li key={link.slug}>
                    <Link href={projectHref(other.slug)}>
                      <ProjectMark project={other} size={40} />
                      <span className={styles.connectText}><strong>{other.name}</strong><span>{link.text}</span></span>
                      <span className={styles.arrow} aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <nav className={`${styles.wrap} ${styles.pager}`} aria-label="More projects">
          <Link href={projectHref(previous.slug)}><span>Previous</span>{previous.name}</Link>
          <Link href="/projects/" className={styles.pagerAll}>All projects{teaser ? " · one more coming" : ""}</Link>
          <Link href={projectHref(next.slug)}><span>Next</span>{next.name}</Link>
        </nav>
      </main>
    </ProjectsShell>
  );
}
