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

function ObservatoryGraphic() {
  return <div className={styles.observatoryGraphic} aria-label="System overview: activity, AI usage and dictation feed one local workspace view" role="img">
    <div className={styles.graphicHeader}><span>OBSERVATORY</span><span>LOCAL FIRST</span></div>
    <svg viewBox="0 0 500 190" aria-hidden="true">
      <defs><pattern id="observatory-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".13" /></pattern></defs>
      <rect width="500" height="190" fill="url(#observatory-grid)" />
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity=".45"><path d="M75 42H170Q195 42 195 70V95H250M75 95H250M75 148H170Q195 148 195 120V95M250 95H420"/><circle cx="282" cy="95" r="49"/><circle cx="282" cy="95" r="65" strokeDasharray="2 7"/></g>
      <g fill="currentColor"><circle cx="75" cy="42" r="4"/><circle cx="75" cy="95" r="4"/><circle cx="75" cy="148" r="4"/><circle cx="420" cy="95" r="4"/></g>
      <g transform="translate(250 66)" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 15 41-13 9 24-41 13zM17 35 10 15M45 2l5-2 10 25-6 1M30 35v16m0-9-16 17m16-17 17 17"/></g>
    </svg>
    <div className={styles.signalLabels}><span>Activity</span><span>AI usage</span><span>Dictation</span><span>One clear view ↗</span></div>
  </div>;
}

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
        <a className={styles.wordmark} href="#top" aria-label="Sean Arackal, home"><span className={styles.monogram}>sa.</span><span>Sean Arackal</span></a>
        <nav className={styles.navigation} aria-label="Portfolio navigation">
          <a href="#work">Builds</a><a href="#research">Research</a><a href="#about">About</a>
          {onContact ? <button onClick={onContact} type="button">Contact ↗</button> : <a href="#contact">Contact ↗</a>}
        </nav>
      </header>
      <section className={`${styles.hero} ${styles.wrap}`}>
        <p className={styles.eyebrow}><span className={styles.indicator} /> AI ENGINEERING / SOFTWARE / HUMAN INTERFACES</p>
        <h1>Making complex<br />systems <em>useful.</em></h1>
        <div className={styles.heroBottom}>
          <p>I’m Sean, a software engineer building AI systems and thoughtful tools. My work spans multimodal research, accessible interfaces, and the software I want to use every day.</p>
          <div className={styles.heroActions}><a className={styles.primaryLink} href="#work">Explore my builds <span>↓</span></a><a className={styles.quietLink} href="/resume/" target="_blank" rel="noreferrer">View résumé ↗</a></div>
        </div>
        <div className={styles.heroFoot}><span>BASED IN WORCESTER, MA</span><span>RESEARCH → PROTOTYPE → PRODUCT</span></div>
      </section>
    </div>

    <section className={`${styles.section} ${styles.wrap}`} id="work">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / IN THE WORKSHOP</p><h2>Current builds.</h2></div><p>Tools I’m building, using,<br />and continuing to refine.</p></div>
      <div className={styles.buildGrid}>
        <article className={`${styles.buildCard} ${styles.featuredBuild}`}>
          <a className={styles.visualLink} href="https://scriblesean.github.io/workspace-observatory/" target="_blank" rel="noreferrer" aria-label="Explore the Workspace Observatory demo"><ObservatoryGraphic /></a>
          <div className={styles.buildBody}>
            <div className={styles.buildMeta}><span>01 / DEVELOPER TOOLS</span><span className={styles.status}>Early preview</span></div>
            <h3>Workspace Observatory</h3><p>A clearer picture of the tools behind the work. A local workspace monitor bringing screen time, AI usage, and dictation into one view.</p>
            <div className={styles.buildDetail}><span>Native Mac app</span><span>Private by default</span><span>Open source</span></div>
            <div className={styles.buildLinks}><a href="https://scriblesean.github.io/workspace-observatory/" target="_blank" rel="noreferrer">Explore demo ↗</a><a href="https://github.com/ScribleSean/workspace-observatory" target="_blank" rel="noreferrer">Source code ↗</a></div>
          </div>
        </article>
        <article className={styles.buildCard}>
          <Link className={`${styles.visualLink} ${styles.sceneVisual}`} href="/" aria-label="Explore the interactive GameCube portfolio"><Image src="/scene/mobile-setup.webp" alt="GameCube, controller and CRT arranged on a minimal desk" width="960" height="640" loading="lazy" /><span>ORIGINAL SCENE CONCEPT</span></Link>
          <div className={styles.buildBody}>
            <div className={styles.buildMeta}><span>02 / CREATIVE DEVELOPMENT</span><span className={styles.status}>Live</span></div>
            <h3>A portfolio you can step into.</h3><p>An interactive corner of the web. Explore a 3D desk, enter the CRT, and find a working desktop with apps, projects, and a way to say hello.</p>
            <div className={styles.buildDetail}><span>Three.js</span><span>React</span><span>Next.js</span></div>
            <div className={styles.buildLinks}><Link href="/">Enter the experience ↗</Link><a href="https://github.com/ScribleSean/scriblesean.github.io" target="_blank" rel="noreferrer">Source code ↗</a></div>
          </div>
        </article>
      </div>
      <article className={styles.serviceCard}>
        <div className={styles.serviceIdentity}><span className={styles.serviceMark} aria-hidden="true">s.</span><p className={styles.eyebrow}>03 / WEBSITE REPAIRS</p><span className={styles.status}>Service</span></div>
        <div className={styles.serviceCopy}><h3>Small fixes.<br />A working website.</h3><p>A focused frontend repair service for broken buttons, stuck forms, and layouts that don’t work on mobile. One agreed issue, a tested patch, and a clear handoff.</p><a href="https://scriblesean.github.io/website-repairs/" target="_blank" rel="noreferrer">Explore website repairs ↗</a></div>
        <div className={styles.serviceProcess}><span>01 <strong>Reproduce the issue</strong></span><span>02 <strong>Repair & verify</strong></span><span>03 <strong>Hand over the fix</strong></span></div>
      </article>
    </section>

    <section className={`${styles.section} ${styles.wrap}`} id="research">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / SELECTED WORK</p><h2>Applied to real problems.</h2></div><p>Research, accessibility,<br />and full-stack engineering.</p></div>
      <div className={styles.researchList}>{projects.map((project, index) => <article className={styles.researchProject} key={project.name}>
        <span className={styles.projectIndex}>0{index + 1}</span>
        <div className={styles.researchMain}><p className={styles.meta}>{project.role} / {project.period}</p><h3>{project.name}</h3><p className={styles.projectSummary}>{project.summary}</p>
          <details className={styles.projectDetails}><summary>Details & outcomes <span>+</span></summary><ul>{project.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul><div className={styles.buildDetail}>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></details>
        </div><a className={styles.projectArrow} href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>↗</a>
      </article>)}</div>
    </section>

    <section className={styles.aboutBand} id="about"><div className={`${styles.aboutGrid} ${styles.wrap}`}>
      <div className={styles.aboutIntro}><p className={styles.eyebrow}>03 / BACKGROUND</p><h2>Curiosity,<br />with follow-through.</h2><p>I’m interested in what happens between a promising idea and a tool people can actually use. That has taken me from video analysis to assistive technology, teaching, and building for my own workflow.</p><div className={styles.education} id="education"><strong>Worcester Polytechnic Institute</strong><span>Bachelor’s, Computer Science · 2026</span><a href="/resume/" target="_blank" rel="noreferrer">Full résumé ↗</a></div></div>
      <div className={styles.background}><div id="experience"><p className={styles.smallHeading}>EXPERIENCE</p>{experience.slice(0, 2).map(job => <div className={styles.job} key={job.company}><span>{job.period}</span><h3>{job.company}</h3><p>{job.role}</p></div>)}<p className={styles.earlierExperience}>Previously: online and on-site instructor at iD Tech, 2023–2024.</p></div>
        <div id="skills" className={styles.capabilities}><p className={styles.smallHeading}>TOOLS & PRACTICE</p>{capabilities.map(group => <div key={group.title}><h3>{group.title}</h3><p>{group.items}</p></div>)}</div>
      </div>
    </div></section>

    <footer className={`${styles.contact} ${styles.wrap}`} id="contact"><p className={styles.eyebrow}>04 / LET’S CONNECT</p><div className={styles.contactTop}><h2>Have something<br /><em>worth building?</em></h2>{onContact ? <button type="button" className={styles.contactButton} onClick={onContact}>Start a conversation ↗</button> : <a className={styles.contactButton} href={`mailto:${contact.email}`}>Start a conversation ↗</a>}</div><div className={styles.contactMeta}><span>Sean Arackal</span><div><a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${contact.email}`}>Email ↗</a></div><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}
