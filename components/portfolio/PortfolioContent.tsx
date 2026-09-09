"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { contact, experience, projects } from "@/data/resume";
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
      <div className={styles.currentTimeline}><p className={styles.timelineDate}>September 2026 · Ongoing</p><div className={styles.buildGrid}>
        <article className={styles.buildCard}>
          <a className={`${styles.visualLink} ${styles.sceneVisual}`} href="https://scriblesean.github.io/workspace-observatory/" target="_blank" rel="noreferrer" aria-label="Explore the Workspace Observatory synthetic demo"><Image src="/scene/observatory-demo.png" alt="Workspace Observatory activity dashboard with fictional sample records" width="1280" height="720" loading="lazy" /><span>SYNTHETIC DEMO PREVIEW</span></a>
          <div className={styles.buildBody}>
            <div className={styles.buildMeta}><span>LOCAL DESKTOP APP</span><span className={styles.status}>Early preview</span></div>
            <h3>Workspace Observatory</h3><p>I made a tool that runs locally and shows my screen time, AI usage, and dictation stats in one place. I’m still adding features and improving how it works across my computers.</p>
            <div className={styles.buildDetail}><span>Native Mac app</span><span>Private by default</span><span>Open source</span></div>
            <div className={styles.buildLinks}><a href="https://scriblesean.github.io/workspace-observatory/" target="_blank" rel="noreferrer">Explore the synthetic demo ↗</a><a href="https://github.com/ScribleSean/workspace-observatory" target="_blank" rel="noreferrer">Source code ↗</a></div>
          </div>
        </article>
        <article className={styles.buildCard}>
          <Link className={`${styles.visualLink} ${styles.sceneVisual}`} href="/" aria-label="Explore the interactive GameCube portfolio"><Image src="/scene/interactive-scene.png" alt="The live 3D portfolio with a green GameCube, purple controller, CRT and Fox figurine" width="1280" height="720" loading="lazy" /><span>LIVE SITE PREVIEW</span></Link>
          <div className={styles.buildBody}>
            <div className={styles.buildMeta}><span>PERSONAL WEBSITE</span><span className={styles.status}>Live</span></div>
            <h3>Interactive portfolio</h3><p>I built this site around a 3D GameCube setup. Clicking the CRT opens a desktop where you can browse my projects and send me a message. I’m still working on the models and the interface.</p>
            <div className={styles.buildDetail}><span>Three.js</span><span>React</span><span>Next.js</span></div>
            <div className={styles.buildLinks}><Link href="/">Open the 3D site ↗</Link><a href="https://github.com/ScribleSean/scriblesean.github.io" target="_blank" rel="noreferrer">Source code ↗</a></div>
          </div>
        </article>
      </div>
      <article className={styles.serviceCard}>
        <div className={styles.serviceIdentity}><span className={styles.serviceMark} aria-hidden="true">s.</span><p className={styles.eyebrow}>WEBSITE REPAIRS</p><span className={styles.status}>Service</span></div>
        <div className={styles.serviceCopy}><h3>Website repair service</h3><p>I’m setting up a service to fix small website problems, like broken buttons, stuck forms, and mobile layouts. I agree on one issue, fix it, test it, and explain what changed.</p><a href="https://scriblesean.github.io/website-repairs/" target="_blank" rel="noreferrer">See the repair service ↗</a></div>
        <div className={styles.serviceProcess}><span>01 <strong>Reproduce the issue</strong></span><span>02 <strong>Repair & verify</strong></span><span>03 <strong>Hand over the fix</strong></span></div>
      </article>
      <article className={styles.longTermBuild}>
        <div><p className={styles.eyebrow}>LONG-TERM PROJECT</p><h3>Orbit</h3></div>
        <div><span className={styles.status}>Work in progress</span><p>I’m building a personal assistant for my Mac. It’s a longer-term project that I’m developing alongside my main builds.</p></div>
      </article></div>
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
