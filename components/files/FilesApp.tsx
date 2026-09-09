"use client";

import { contact, experience, projects, skills } from "@/data/resume";
import { useState } from "react";
import styles from "./FilesApp.module.css";

type FilesAppProps = {
  resumeUrl?: string;
};

type Location = "home" | "projects" | "resume";

export default function FilesApp({ resumeUrl }: FilesAppProps) {
  const [location, setLocation] = useState<Location>("projects");
  const [selectedProjectName, setSelectedProjectName] = useState(projects[0]?.name ?? "");
  const selectedProject = projects.find((project) => project.name === selectedProjectName) ?? projects[0];

  const selectLocation = (nextLocation: Location) => {
    setLocation(nextLocation);
    if (nextLocation === "projects" && !selectedProjectName) setSelectedProjectName(projects[0]?.name ?? "");
  };

  return (
    <section className={styles.filesApp} aria-label="Files">
      <header className={styles.topBar}>
        <div className={styles.titleGroup}>
          <p className={styles.appName}>Files</p>
          <p className={styles.path}>Home / {location === "home" ? "Portfolio" : location === "projects" ? "Portfolio / Projects" : "Portfolio / Resume"}</p>
        </div>
        {resumeUrl ? (
          <a className={styles.action} href={resumeUrl} download>Download resume</a>
        ) : (
          <a className={styles.action} href="/resume" target="_blank" rel="noreferrer">Print resume</a>
        )}
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Folders">
          <p className={styles.sidebarLabel}>Portfolio</p>
          <button className={location === "home" ? styles.active : undefined} type="button" onClick={() => selectLocation("home")}>
            <span aria-hidden="true">⌂</span> Home
          </button>
          <button className={location === "projects" ? styles.active : undefined} type="button" onClick={() => selectLocation("projects")}>
            <span aria-hidden="true">▰</span> Projects <small>{projects.length}</small>
          </button>
          <button className={location === "resume" ? styles.active : undefined} type="button" onClick={() => selectLocation("resume")}>
            <span aria-hidden="true">▤</span> Resume
          </button>
        </aside>

        <main className={styles.mainPanel}>
          {location === "home" && <HomeView onOpen={selectLocation} />}
          {location === "projects" && selectedProject && <ProjectsView project={selectedProject} onSelect={setSelectedProjectName} />}
          {location === "resume" && <ResumeContent />}
        </main>
      </div>
    </section>
  );
}

function HomeView({ onOpen }: { onOpen: (location: Location) => void }) {
  return (
    <section className={styles.folderOverview} aria-labelledby="portfolio-files-heading">
      <div className={styles.panelHeading}>
        <p>Home</p>
        <h1 id="portfolio-files-heading">Portfolio files</h1>
      </div>
      <div className={styles.overviewRows}>
        <button type="button" onClick={() => onOpen("projects")}>
          <span className={styles.folderIcon} aria-hidden="true">▰</span>
          <span><strong>Projects</strong><small>{projects.length} project folders with available links</small></span>
          <span aria-hidden="true">›</span>
        </button>
        <button type="button" onClick={() => onOpen("resume")}>
          <span className={styles.documentIcon} aria-hidden="true">▤</span>
          <span><strong>Sean Arackal</strong><small>Printable resume</small></span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}

function ProjectsView({
  project,
  onSelect,
}: {
  project: (typeof projects)[number];
  onSelect: (name: string) => void;
}) {
  return (
    <section className={styles.projectsBrowser} aria-labelledby="projects-heading">
      <div className={styles.panelHeading}>
        <p>Projects</p>
        <h1 id="projects-heading">Selected work</h1>
      </div>
      <div className={styles.projectSplit}>
        <div className={styles.projectRows} role="list" aria-label="Project folders">
          {projects.map((item) => {
            const isSelected = item.name === project.name;
            return (
              <button
                type="button"
                key={item.name}
                className={isSelected ? styles.selectedRow : undefined}
                onClick={() => onSelect(item.name)}
                aria-current={isSelected ? "true" : undefined}
              >
                <span className={styles.folderIcon} aria-hidden="true">▰</span>
                <span><strong>{item.name}</strong><small>{item.role} · {item.period}</small></span>
              </button>
            );
          })}
        </div>
        <ProjectDetail project={project} />
      </div>
    </section>
  );
}

function ProjectDetail({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className={styles.projectDetail} aria-live="polite">
      <p className={styles.kicker}>{project.role} · {project.period} · {project.location}</p>
      <h2>{project.name}</h2>
      <p className={styles.summary}>{project.summary}</p>
      <h3>Highlights</h3>
      <ul>{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      <div className={styles.tags}>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <a className={styles.openLink} href={project.href} target="_blank" rel="noreferrer">Open project link ↗</a>
    </article>
  );
}

export function ResumeContent() {
  return (
    <article className={styles.resume}>
      <div className={styles.resumeHeading}>
        <p className={styles.kicker}>Printable resume</p>
        <h1>Sean Arackal</h1>
      </div>
      <p className={styles.contactLine}>{contact.email} · {contact.phone} · {contact.location}</p>
      <p className={styles.contactLine}><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> · <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a></p>

      <ResumeSection title="Experience">
        {experience.map((job) => <div className={styles.resumeEntry} key={`${job.company}-${job.period}`}><p><strong>{job.role}</strong> · {job.company} · {job.location}</p><p>{job.period}</p><p>{job.details}</p></div>)}
      </ResumeSection>
      <ResumeSection title="Projects">
        {projects.map((project) => <div className={styles.resumeEntry} key={project.name}><p><strong>{project.name}</strong> · {project.role} · {project.period} · {project.location}</p><p>{project.summary}</p><ul>{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></div>)}
      </ResumeSection>
      <ResumeSection title="Education">
        <div className={styles.resumeEntry}><p><strong>Worcester Polytechnic Institute</strong> · Bachelor&apos;s, Computer Science</p><p>Aug 2022 - May 2026 · GPA: 3.53</p></div>
      </ResumeSection>
      <ResumeSection title="Skills">
        <p>{skills.join(" · ")}</p><p>Languages: Bengali, Hindi</p>
      </ResumeSection>
    </article>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className={styles.resumeSection}><h2>{title}</h2>{children}</section>;
}
