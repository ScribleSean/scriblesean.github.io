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
const external = { target: "_blank", rel: "noreferrer" } as const;

export default function PortfolioContent({ onContact, embedded = false }: PortfolioContentProps) {
  // Inside the desktop browser window the page scrolls in a scaled box, so hash links scroll that box by hand.
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

  const contactAction = onContact
    ? <button type="button" onClick={onContact}>Message</button>
    : <a href={`mailto:${contact.email}`}>Email</a>;

  return <main className={`${styles.portfolio} ${embedded ? "ledger-light" : ""}`} onClick={navigateSection}>
    <header className={styles.siteHeader} id="top">
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a className={styles.wordmark} href="#top">Sean Arackal</a>
        <nav className={styles.navigation} aria-label="Portfolio sections">
          <a href="#work">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#research">Research</a>
          <a href={resumeHref} {...external}>Résumé</a>
        </nav>
      </div>
    </header>

    <section className={`${styles.hero} ${styles.wrap}`} aria-labelledby="name">
      <p className={styles.status}><span className={styles.dot} aria-hidden="true" />Open to AI roles · Worcester, MA</p>
      <h1 id="name">Sean Arackal</h1>
      <p className={styles.lede}>I build AI agents and the tools around them.</p>
      <p className={styles.bio}>Recent work: a Mac assistant that acts on typed or spoken requests, a menu bar app that tracks Claude Code and Codex limits, and video analysis for research recordings. I studied computer science at WPI and taught programming for three years.</p>
      <div className={styles.actions}>
        <a className={styles.primary} href={resumeHref} {...external}>Résumé</a>
        {onContact
          ? <button type="button" className={styles.secondary} onClick={onContact}>Message me</button>
          : <a className={styles.secondary} href={`mailto:${contact.email}`}>Email me</a>}
        <span className={styles.profiles}>
          <a href={contact.github} {...external}>GitHub ↗</a>
          <a href={contact.linkedin} {...external}>LinkedIn ↗</a>
        </span>
      </div>
    </section>

    <section className={`${styles.section} ${styles.wrap}`} id="work" aria-labelledby="work-heading">
      <h2 id="work-heading" className={styles.sectionTitle}>Projects</h2>
      <FeaturedGrid newTab={embedded} teasers={false} />
      <div className={styles.also}>
        <article>
          <p className={styles.label}>This site</p>
          <h3>{embedded ? "Interactive portfolio" : <Link href="/">Interactive portfolio</Link>}</h3>
          <p>A 3D GameCube desk with a desktop inside the CRT. <a href="https://github.com/ScribleSean/scriblesean.github.io" {...external}>Source ↗</a></p>
        </article>
        <article>
          <p className={styles.label}>Freelance</p>
          <h3><a href="https://scriblesean.github.io/website-repairs/" {...external}>Website repairs ↗</a></h3>
          <p>Small fixes for existing websites.</p>
        </article>
        <OpenSourceContributions />
      </div>
    </section>

    <section className={`${styles.section} ${styles.wrap}`} id="experience" aria-labelledby="experience-heading">
      <h2 id="experience-heading" className={styles.sectionTitle}>Experience</h2>
      <div className={styles.experience}>
        <div className={styles.ledger}>
          {resumeExperience.map((job) => <article className={styles.row} key={`${job.company}-${job.period}`}>
            <p className={styles.period}>{job.period}</p>
            <div>
              <h3>{job.role}</h3>
              <p className={styles.org}>{job.company} · {job.location}</p>
              <p>{job.details.replace(/^Supported/, "I supported").replace(/^Taught/, "I taught")}</p>
              {"progression" in job && <p className={styles.note}>{job.progression}</p>}
            </div>
          </article>)}
        </div>
        <aside className={styles.side}>
          <div className={styles.panel} id="education">
            <p className={styles.label}>Education</p>
            <h3>{education.institution}</h3>
            <p>BS, Computer Science · {education.honors} · 2026</p>
          </div>
          <div className={styles.panel} id="skills">
            <p className={styles.label}>Skills</p>
            <dl className={styles.skills}>{capabilities.map((group) => <div key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl>
          </div>
        </aside>
      </div>
    </section>

    <section className={`${styles.section} ${styles.wrap}`} id="research" aria-labelledby="research-heading">
      <h2 id="research-heading" className={styles.sectionTitle}>Research and coursework</h2>
      <div className={styles.ledger}>{projects.map((project) => <article className={styles.row} key={project.name}>
        <p className={styles.period}>{project.period}</p>
        <div>
          <p className={styles.label}>{project.role}</p>
          <h3>{project.name}</h3>
          <p>{project.portfolioSummary}</p>
          <details className={styles.details}>
            <summary>What I worked on</summary>
            <ul>{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
            <p className={styles.tags}>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
          </details>
          {project.href ? <a className={styles.inlineLink} href={project.href} {...external}>{project.linkLabel} ↗</a> : <p className={styles.note}>{project.linkLabel}</p>}
        </div>
      </article>)}</div>
    </section>

    <footer className={`${styles.contact} ${styles.wrap}`} id="contact">
      <div className={styles.contactCard}>
        <div>
          <p className={styles.label}>Contact</p>
          <h2><a href={`mailto:${contact.email}`}>{contact.email}</a></h2>
        </div>
        <div className={styles.contactActions}>
          {onContact && <button type="button" className={styles.primary} onClick={onContact}>Send a message</button>}
          <a className={onContact ? styles.secondary : styles.primary} href={resumeHref} {...external}>Résumé</a>
        </div>
      </div>
      <div className={styles.footerMeta}>
        <span>Sean Arackal</span>
        <span className={styles.footerLinks}>{contactAction}<a href={contact.github} {...external}>GitHub ↗</a><a href={contact.linkedin} {...external}>LinkedIn ↗</a></span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  </main>;
}
