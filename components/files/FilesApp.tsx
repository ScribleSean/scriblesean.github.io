"use client";

import { contact, experience, projects, skills } from "@/data/resume";
import { useState } from "react";
import styles from "./FilesApp.module.css";

type FilesAppProps = {
  resumeUrl?: string;
};

type Folder = "home" | "projects" | "resume";

export default function FilesApp({ resumeUrl }: FilesAppProps) {
  const [folder, setFolder] = useState<Folder>("home");
  const [projectName, setProjectName] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.name === projectName);

  const openFolder = (nextFolder: Folder) => {
    setProjectName(null);
    setFolder(nextFolder);
  };

  const openProject = (name: string) => {
    setProjectName(name);
    setFolder("projects");
  };

  return (
    <section className={styles.filesApp} aria-label="Files">
      <header className={styles.header}>
        <div>
          <p className={styles.appName}>Files</p>
          <nav className={styles.breadcrumbs} aria-label="Files location">
            <button type="button" onClick={() => openFolder("home")}>Home</button>
            {folder !== "home" && <><span>/</span><button type="button" onClick={() => openFolder(folder)}>{folder === "projects" ? "Projects" : "Resume"}</button></>}
            {selectedProject && <><span>/</span><span>{selectedProject.name}</span></>}
          </nav>
        </div>
        {resumeUrl ? (
          <a className={styles.resumeAction} href={resumeUrl} download>Download resume</a>
        ) : (
          <button className={styles.resumeAction} type="button" onClick={() => openFolder("resume")}>Print resume</button>
        )}
      </header>

      <div className={styles.content}>
        {folder === "home" && <HomeView onOpenFolder={openFolder} />}
        {folder === "projects" && !selectedProject && <ProjectsView onOpenProject={openProject} />}
        {selectedProject && <ProjectView project={selectedProject} onBack={() => setProjectName(null)} />}
        {folder === "resume" && <ResumeView resumeUrl={resumeUrl} />}
      </div>
    </section>
  );
}

function HomeView({ onOpenFolder }: { onOpenFolder: (folder: Folder) => void }) {
  return (
    <div className={styles.grid}>
      <button type="button" className={styles.fileCard} onClick={() => onOpenFolder("projects")}>
        <span className={styles.folderIcon} aria-hidden="true">▰</span>
        <strong>Projects</strong>
        <small>{projects.length} project folders</small>
      </button>
      <button type="button" className={styles.fileCard} onClick={() => onOpenFolder("resume")}>
        <span className={styles.documentIcon} aria-hidden="true">▤</span>
        <strong>Sean Arackal</strong>
        <small>Printable resume</small>
      </button>
    </div>
  );
}

function ProjectsView({ onOpenProject }: { onOpenProject: (name: string) => void }) {
  return (
    <div className={styles.projectList}>
      <p className={styles.listIntro}>Open a project folder for the project summary, outcomes, and its available link.</p>
      {projects.map((project) => (
        <button type="button" className={styles.projectRow} onClick={() => onOpenProject(project.name)} key={project.name}>
          <span className={styles.folderIcon} aria-hidden="true">▰</span>
          <span><strong>{project.name}</strong><small>{project.role} · {project.period}</small></span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  );
}

function ProjectView({
  project,
  onBack,
}: {
  project: (typeof projects)[number];
  onBack: () => void;
}) {
  return (
    <article className={styles.projectDetail}>
      <button type="button" className={styles.back} onClick={onBack}>‹ All projects</button>
      <p className={styles.kicker}>{project.role} · {project.period} · {project.location}</p>
      <h1>{project.name}</h1>
      <p className={styles.summary}>{project.summary}</p>
      <h2>Highlights</h2>
      <ul>{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      <div className={styles.tags}>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <a className={styles.openLink} href={project.href} target="_blank" rel="noreferrer">Open available project link ↗</a>
    </article>
  );
}

function ResumeView({ resumeUrl }: { resumeUrl?: string }) {
  return (
    <article className={styles.resume}>
      <div className={styles.resumeHeader}>
        <div><p className={styles.kicker}>Printable resume</p><h1>Sean Arackal</h1></div>
        {resumeUrl ? (
          <a className={styles.resumeAction} href={resumeUrl} download>Download resume</a>
        ) : (
          <button className={styles.resumeAction} type="button" onClick={() => window.print()}>Print resume</button>
        )}
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
