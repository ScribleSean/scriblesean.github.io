"use client";

import { projects } from "@/data/resume";
import { useState } from "react";
import styles from "./FilesApp.module.css";

type Location = "home" | "projects" | "resume";

export default function FilesApp() {
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
        <a className={styles.action} href="/resume/sean-arackal-resume.pdf" download>Download resume</a>
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

        <main data-desktop-scroll className={styles.mainPanel}>
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
          <span><strong>Projects</strong><small>{projects.length} project folders</small></span>
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
      {project.href ? <a className={styles.openLink} href={project.href} target="_blank" rel="noreferrer">{project.linkLabel} ↗</a> : <p>{project.linkLabel}</p>}
    </article>
  );
}

export function ResumeContent() {
  return (
    <article aria-label="Sean Arackal resume">
      <p style={{ marginBottom: 16 }}>
        <a href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">Open resume PDF to read, search, or print ↗</a>
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/resume/sean-arackal-resume.png" alt="Sean Arackal resume. Open the PDF above for accessible text." style={{ display: "block", width: "100%", height: "auto" }} />
    </article>
  );
}
