"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { contact, experience, projects } from "@/data/resume";
import OpenSourceContributions from "@/components/contributions/OpenSourceContributions";
import FeaturedGrid from "@/components/projects/FeaturedGrid";
import { featured } from "@/data/featured-projects";
import styles from "./PortfolioContent.module.css";

type PortfolioContentProps = { onContact?: () => void; embedded?: boolean };

const capabilities = [
  { title: "AI & perception", items: "Multimodal pipelines · Computer vision · Semantic search · PyTorch" },
  { title: "Product engineering", items: "TypeScript · React · Next.js · Python · PostgreSQL" },
  { title: "Systems & delivery", items: "Native desktop tools · Docker · AWS · Accessible interfaces" },
];

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
          <a href="#work">Currently working on</a><a href="#research">Past projects</a><a href="#experience">Professional experience</a>
          {onContact ? <button onClick={onContact} type="button">Contact ↗</button> : <a href="#contact">Contact ↗</a>}
        </nav>
      </header>
      <section className={`${styles.hero} ${styles.wrap}`}>
        <p className={styles.eyebrow}><span className={styles.indicator} /> SOFTWARE ENGINEER · WORCESTER, MA</p>
        <h1>Hi, I’m <em>Sean.</em></h1>
        <div className={styles.heroBottom}>
          <p>I build software, work with AI, and teach programming. Here’s what I’m working on now, projects I’ve built, and the places I’ve worked.</p>
          <div className={styles.heroActions}><a className={styles.primaryLink} href="#work">See what I’m working on <span>↓</span></a><a className={styles.quietLink} href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">View résumé ↗</a></div>
        </div>
        <div className={styles.heroFoot}><span>BASED IN WORCESTER, MA</span><span>PROJECTS & EXPERIENCE</span></div>
      </section>
    </div>

    <section className={`${styles.section} ${styles.wrap}`} id="work">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / NOW</p><h2>Currently working on</h2></div><p>Projects I’m still building<br />and improving.</p></div>
      <div className={styles.currentTimeline}><p className={styles.featuredIntro}>{featured.intro}</p>
      <FeaturedGrid newTab={embedded} />
      <p className={styles.featuredMore}><Link href="/projects/" {...(embedded ? { target: "_blank", rel: "noreferrer" } : {})}>See every project page ↗</Link></p>
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
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / PREVIOUS PROJECTS</p><h2>Past projects</h2></div><p>Projects I’ve worked on,<br />with dates and my contribution.</p></div>
      <div className={styles.researchList}>{projects.map((project) => <article className={styles.researchProject} key={project.name}>
        <span className={styles.projectIndex}>{project.period}</span>
        <div className={styles.researchMain}><p className={styles.meta}>{project.role}</p><h3>{project.name}</h3><p className={styles.projectSummary}>{project.portfolioSummary}</p>
          <details className={styles.projectDetails}><summary>What I worked on <span>+</span></summary><ul>{project.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul><div className={styles.buildDetail}>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></details>
          <p className={styles.meta}>{project.href ? <a href={project.href} target="_blank" rel="noreferrer">{project.linkLabel} ↗</a> : project.linkLabel}</p>
        </div>
      </article>)}</div>
    </section>

    <section className={styles.aboutBand} id="experience"><div className={`${styles.aboutGrid} ${styles.wrap}`}>
      <div className={styles.aboutIntro}><p className={styles.eyebrow}>03 / WORK HISTORY</p><h2>Professional experience</h2><p>I’ve taught programming online and in person, led summer camp teams, and helped students with computer science courses at WPI.</p><div className={styles.education} id="education"><strong>Worcester Polytechnic Institute</strong><span>Bachelor’s, Computer Science · 2026</span><a href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">Full résumé ↗</a></div></div>
      <div className={styles.background}><div className={styles.experienceTimeline}>{experience.map(job => <article className={styles.job} key={`${job.company}-${job.period}`}><span>{job.period}</span><h3>{job.role}</h3><p className={styles.jobCompany}>{job.company} · {job.location}</p><p>{job.details.replace(/^Supported/, "I supported").replace(/^Managed/, "I managed").replace(/^Led/, "I led").replace(/^Delivered/, "I delivered").replace(/^Taught/, "I taught")}</p></article>)}</div>
        <div id="skills" className={styles.capabilities}><p className={styles.smallHeading}>TOOLS I USE</p>{capabilities.map(group => <div key={group.title}><h3>{group.title}</h3><p>{group.items}</p></div>)}</div>
      </div>
    </div></section>

    <footer className={`${styles.contact} ${styles.wrap}`} id="contact"><p className={styles.eyebrow}>04 / CONTACT</p><div className={styles.contactTop}><h2>Want to <em>get in touch?</em></h2>{onContact ? <button type="button" className={styles.contactButton} onClick={onContact}>Send me a message ↗</button> : <a className={styles.contactButton} href={`mailto:${contact.email}`}>Send me a message ↗</a>}</div><div className={styles.contactMeta}><span>Sean Arackal</span><div><a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${contact.email}`}>Email ↗</a></div><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}
