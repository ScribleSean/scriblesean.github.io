"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { contact, education, projects, resumeExperience } from "@/data/resume";
import OpenSourceContributions from "@/components/contributions/OpenSourceContributions";
import FeaturedGrid from "@/components/projects/FeaturedGrid";
import styles from "./PortfolioContent.module.css";

type PortfolioContentProps = { onContact?: () => void; embedded?: boolean };

const capabilities = [
  { title: "AI", items: "Agent tooling · Multimodal pipelines · Computer vision · Semantic search · PyTorch" },
  { title: "Web", items: "TypeScript · React · Next.js · Python · PostgreSQL" },
  { title: "Desktop", items: "Swift · AppKit · Node.js · Docker" },
];
const resumeHref = "/resume/sean-arackal-resume.pdf";

export default function PortfolioContent({ onContact, embedded = false }: PortfolioContentProps) {
  function navigateSection(event: MouseEvent<HTMLElement>) {
    if (!embedded || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const section = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[id]")).find((element) => element.id === link.hash.slice(1));
    if (!section) return;
    event.preventDefault();
    let viewport = event.currentTarget.parentElement;
    while (viewport && !/(auto|scroll)/.test(getComputedStyle(viewport).overflowY)) viewport = viewport.parentElement;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const scale = bounds.height / viewport.offsetHeight || 1;
    viewport.scrollTop += (section.getBoundingClientRect().top - bounds.top) / scale;
  }
  return <main className={styles.portfolio} onClick={navigateSection}>
    <div className={styles.intro} id="top">
      <header className={`${styles.siteHeader} ${styles.wrap}`}>
        <a className={styles.wordmark} href="#top" aria-label="Sean Arackal, home"><span>Sean Arackal</span></a>
        <nav className={styles.navigation} aria-label="Portfolio navigation">
          <a href="#work">Projects</a><a href="#research">Research</a><a href="#experience">Experience</a>
          {onContact ? <button onClick={onContact} type="button">Contact ↗</button> : <a href="#contact">Contact</a>}
        </nav>
      </header>
      <section className={`${styles.hero} ${styles.wrap}`}>
        <p className={styles.eyebrow}><span className={styles.indicator} /> WORCESTER, MA · OPEN TO AI ROLES</p>
        <h1>I build <em>AI agents</em> and the tools around them.</h1>
        <div className={styles.heroBottom}>
          <p>Recent work: a Mac assistant that acts on typed or spoken requests, a menu bar app that tracks Claude Code and Codex limits, and video analysis for research recordings. I studied computer science at WPI and taught programming for three years.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryLink} href={resumeHref} target="_blank" rel="noreferrer">Résumé <span>↗</span></a>
            <p className={styles.heroLinks}>{onContact ? <button onClick={onContact} type="button">Message</button> : <a href={`mailto:${contact.email}`}>Email</a>}<a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></p>
          </div>
        </div>
      </section>
    </div>

    <section className={`${styles.section} ${styles.wrap}`} id="work">
      <div className={styles.sectionHeading}><h2>Projects</h2></div>
      <div className={styles.currentTimeline}>
      <FeaturedGrid newTab={embedded} teasers={false} />
      <article className={styles.freelanceNote}>
        <span>This site</span><h3>{embedded ? "Interactive portfolio" : <Link href="/">Interactive portfolio ↗</Link>}</h3><p>A 3D GameCube desk with a desktop inside the CRT. <a href="https://github.com/ScribleSean/scriblesean.github.io" target="_blank" rel="noreferrer">Source ↗</a></p>
      </article>
      <article className={styles.freelanceNote}>
        <span>Freelance</span><h3><a href="https://scriblesean.github.io/website-repairs/" target="_blank" rel="noreferrer">Website repairs ↗</a></h3><p>Small fixes for existing websites.</p>
      </article>
      <OpenSourceContributions />
      </div>
    </section>

    <section className={`${styles.section} ${styles.wrap}`} id="research">
      <div className={styles.sectionHeading}><h2>Research and coursework</h2></div>
      <div className={styles.researchList}>{projects.map((project) => <article className={styles.researchProject} key={project.name}>
        <span className={styles.projectIndex}>{project.period}</span>
        <div className={styles.researchMain}><p className={styles.meta}>{project.role}</p><h3>{project.name}</h3><p className={styles.projectSummary}>{project.portfolioSummary}</p>
          <details className={styles.projectDetails}><summary>What I worked on <span>+</span></summary><ul>{project.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul><div className={styles.buildDetail}>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></details>
          <p className={styles.projectLink}>{project.href ? <a href={project.href} target="_blank" rel="noreferrer">{project.linkLabel} ↗</a> : project.linkLabel}</p>
        </div>
      </article>)}</div>
    </section>

    <section className={styles.aboutBand} id="experience"><div className={`${styles.aboutGrid} ${styles.wrap}`}>
      <div className={styles.aboutIntro}><h2>Experience</h2><div className={styles.education} id="education"><strong>{education.institution}</strong><span>BS, Computer Science · {education.honors} · 2026</span><a href={resumeHref} target="_blank" rel="noreferrer">Full résumé ↗</a></div><div id="skills" className={styles.capabilities}><p className={styles.smallHeading}>SKILLS</p>{capabilities.map(group => <div key={group.title}><h3>{group.title}</h3><p>{group.items}</p></div>)}</div></div>
      <div className={styles.background}><div className={styles.experienceTimeline}>{resumeExperience.map(job => <article className={styles.job} key={`${job.company}-${job.period}`}><span>{job.period}</span><h3>{job.role}</h3><p className={styles.jobCompany}>{job.company} · {job.location}</p><p>{job.details.replace(/^Supported/, "I supported").replace(/^Taught/, "I taught")}</p>{"progression" in job && <p>{job.progression}</p>}</article>)}</div>
      </div>
    </div></section>

    <footer className={`${styles.contact} ${styles.wrap}`} id="contact"><div className={styles.contactTop}><h2><a href={`mailto:${contact.email}`}>{contact.email}</a></h2>{onContact ? <button type="button" className={styles.contactButton} onClick={onContact}>Send me a message ↗</button> : <a className={styles.contactButton} href={resumeHref} target="_blank" rel="noreferrer">Résumé ↗</a>}</div><div className={styles.contactMeta}><span>Sean Arackal</span><div><a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}
