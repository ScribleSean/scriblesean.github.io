"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { getMotionPreference, subscribeMotion } from "@/lib/browser-preferences";
import { contact, education, projects } from "@/data/resume";
import styles from "./PrototypePortfolio.module.css";

const words = ["Software engineering.", "Computer vision.", "Creative projects."];
const milestones = [
  { year: "2022", title: "Started at WPI", kind: "EDUCATION", detail: "Began studying computer science at Worcester Polytechnic Institute.", side: "The start of four years of learning, teaching, and building." },
  { year: "2023", title: "Started teaching programming", kind: "WORK · iD TECH", detail: "Taught on-site programming courses in Amherst, then individual online lessons tailored to each student's goals.", side: "On-site instructor, June to August. Online instructor, August to December." },
  { year: "2024", title: "From teaching to supporting teams", kind: "WORK · iD TECH + WPI", detail: "Became a lead instructor at iD Tech and a Peer Learning Assistant at WPI, helping students in labs and office hours.", side: "Course project: back-end development on a hospital kiosk, with indoor navigation and service requests." },
  { year: "2025", title: "Research beyond the classroom", kind: "EDUCATION + WORK", detail: "Worked with a WPI and Chulalongkorn team on digital education at Sri Sangwan School in Thailand. Returned to iD Tech as a lead instructor in Waltham.", side: "Began ReVIEW, my individual capstone exploring AI-assisted review of research recordings." },
  { year: "2026", title: "Graduated. Kept building.", kind: "EDUCATION", detail: `${education.degree}, ${education.institution}. Graduated in May with distinction. Completed ReVIEW and a team exercise-form classification project.`, side: "Independent builds: Workspace Observatory, this interactive portfolio, and website repairs. Orbit is a longer-term personal assistant project." },
];

export default function PrototypePortfolio({ embedded = false, onContact, onPhotos }: { embedded?: boolean; onContact?: () => void; onPhotos?: () => void }) {
  const reduced = useSyncExternalStore(subscribeMotion, getMotionPreference, () => true);
  const [word, setWord] = useState(0);
  const [year, setYear] = useState("2026");
  const root = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setWord(value => (value + 1) % words.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduced]);
  useEffect(() => {
    if (embedded || reduced || !window.matchMedia("(pointer:fine)").matches) return;
    const element = cursor.current;
    const surface = root.current;
    if (!element || !surface) return;
    const hide = () => { element.style.opacity = "0"; delete surface.dataset.customCursor; };
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!surface.contains(target) || target.closest("input,textarea,iframe,[contenteditable=true]") || window.innerWidth <= 760) { hide(); return; }
      element.style.opacity = "1";
      surface.dataset.customCursor = "true";
      element.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      element.dataset.active = target.closest("a,button,summary") ? "true" : "false";
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => { hide(); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", hide); window.removeEventListener("blur", hide); };
  }, [embedded, reduced]);
  function navigate(event: MouseEvent<HTMLElement>) {
    if (!embedded || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
    if (anchor?.getAttribute("href") === "/prototype/photos/" && onPhotos) { event.preventDefault(); onPhotos(); return; }
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = link && Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[id]")).find(item => item.id === link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    let viewport = event.currentTarget.parentElement;
    while (viewport && !/(auto|scroll)/.test(getComputedStyle(viewport).overflowY)) viewport = viewport.parentElement;
    if (viewport) viewport.scrollTop += (target.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / (viewport.getBoundingClientRect().height / viewport.offsetHeight || 1);
  }
  const active = milestones.find(item => item.year === year)!;
  return <main ref={root} className={`${styles.page} ${embedded ? styles.embedded : ""} ${reduced ? styles.reduced : ""}`} onClick={navigate}>
    <div ref={cursor} className={styles.cursor} aria-hidden="true"><span>↗</span></div>
    <header className={styles.header}><a href="#top" className={styles.monogram} aria-label="Sean Arackal, top">sa.</a><nav aria-label="Prototype navigation"><a href="#work">Work</a><a href="#path">My path</a><a href="/prototype/photos/">Photo box ↗</a></nav><a href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a></header>
    <section id="top" className={styles.hero}>
      <div className={styles.heroEyebrow}><span>WORCESTER, MASSACHUSETTS</span><span className={styles.preview}>DESIGN PROTOTYPE / 01</span></div>
      <h1>Sean <em>Arackal</em><span className={styles.asterisk} aria-hidden="true">✳</span></h1>
      <div className={styles.disciplines}><span>AI.</span><span>Deep learning.</span><span className={styles.morph} aria-label="Software engineering, computer vision, creative projects"><AnimatePresence mode="wait" initial={false}><motion.span aria-hidden="true" key={word} initial={{ opacity: 0, y: 9, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -9, filter: "blur(4px)" }} transition={{ duration: reduced ? 0 : .16 }}>{words[word]}</motion.span></AnimatePresence></span></div>
      <div className={styles.heroBottom}><p>I build software, work with AI,<br />and teach programming.</p><a className={styles.roundLink} href="#work">Explore my work <span>↓</span></a><a className={styles.computerLink} href="/prototype/computer/"><Image src="/scene/mobile-setup.webp" alt="Open the interactive computer" width={150} height={100} /><span>Or, look around my desk ↗</span></a></div>
    </section>
    <section id="work" className={styles.section}>
      <div className={styles.sectionTitle}><div><span className={styles.eyebrow}>01 / IN PROGRESS</span><h2>On my desk.</h2></div><p>Things I’m building<br />and figuring out.</p></div>
      <div className={styles.widgets}>
        <article className={`${styles.widget} ${styles.observatory}`}><div className={styles.widgetMeta}><span>LOCAL DESKTOP APP</span><span>Early preview ↗</span></div><h3>Workspace<br /><em>Observatory</em></h3><p>Screen time, AI usage, and dictation stats in one place. Built to run locally.</p><a href="https://scriblesean.github.io/workspace-observatory/" target="_blank" rel="noreferrer" className={styles.screenLink}><Image src="/scene/observatory-demo.png" alt="Workspace Observatory with fictional sample data" width={1280} height={720} /><span>Explore the synthetic demo ↗</span></a></article>
        <article className={`${styles.widget} ${styles.play}`}><div className={styles.widgetMeta}><span>PERSONAL WEBSITE</span><span>Live ↗</span></div><h3>A desktop.<br /><em>A whole portfolio.</em></h3><p>A GameCube, a CRT, and a desktop you can explore.</p><a href="/prototype/computer/" className={styles.sceneLink}><Image src="/scene/interactive-scene.png" alt="Interactive portfolio computer scene" width={1280} height={720} /><span>Step inside ↗</span></a></article>
        <article className={`${styles.widget} ${styles.repair}`}><div className={styles.widgetMeta}><span>WEBSITE REPAIRS</span><span>Service</span></div><h3>Small issue.<br /><em>Focused fix.</em></h3><p>I’m setting up a service for broken buttons, stuck forms, and mobile layouts.</p><a href="https://scriblesean.github.io/website-repairs/" target="_blank" rel="noreferrer">See the service ↗</a></article>
        <article className={`${styles.widget} ${styles.orbit}`}><span className={styles.orbitMark} aria-hidden="true">◎</span><div className={styles.widgetMeta}><span>LONG-TERM BUILD</span><span>In progress</span></div><h3>Orbit</h3><p>A personal assistant for my Mac. Something I’m developing alongside the other builds.</p></article>
      </div>
    </section>
    <section className={styles.section} id="research"><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>02 / SELECTED PROJECTS</span><h2>Some earlier work.</h2></div><p>Research, experiments,<br />and team projects.</p></div><div className={styles.projectGrid}>{projects.map((project, index) => <article className={styles.project} key={project.name}><div className={styles.projectTop}><span>0{index + 1}</span><span>{project.period}</span></div><p className={styles.eyebrow}>{project.role}</p><h3>{project.name}</h3><p>{project.portfolioSummary}</p><details><summary>My contribution <span>+</span></summary><ul>{project.outcomes.map(item => <li key={item}>{item}</li>)}</ul><div className={styles.tags}>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></details>{project.href && <a href={project.href} target="_blank" rel="noreferrer">{project.linkLabel} ↗</a>}</article>)}</div></section>
    <section id="path" className={`${styles.section} ${styles.path}`}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>03 / EDUCATION & WORK</span><h2>A path, still unfolding.</h2></div><p>The main milestones.<br />A little of what happened alongside.</p></div><div className={styles.timeline}><div className={styles.years} aria-label="Choose a timeline year">{milestones.map(item => <button type="button" key={item.year} onClick={() => setYear(item.year)} aria-pressed={year === item.year} aria-controls="milestone">{item.year}<span /></button>)}</div><div id="milestone" className={styles.milestone} aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.div key={year} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : .15 }}><div className={styles.milestoneMeta}><span>{active.kind}</span><strong>{active.year}</strong></div><h3>{active.title}</h3><p>{active.detail}</p><aside><span>{year === "2026" ? "PERSONAL / INDEPENDENT BUILDS" : "ALONG THE WAY"}</span><p>{active.side}</p>{year === "2026" && <a href="#work">See what I’m building ↑</a>}</aside></motion.div></AnimatePresence></div></div></section>
    <section className={styles.photoTeaser}><div><span className={styles.eyebrow}>THE OTHER SIDE OF THE DESK</span><h2>A few things<br /><em>kept around.</em></h2><p>A photo box inside the computer.<br />Starting with snapshots of my projects.</p><a href="/prototype/photos/">Open the photo box ↗</a></div><a href="/prototype/photos/" className={styles.photoStack} aria-label="Explore the photo collage"><Image src="/scene/interactive-scene.png" alt="Portfolio project screenshot in a photo print" width={640} height={400} /><Image src="/scene/observatory-demo.png" alt="Workspace Observatory synthetic demo in a photo print" width={640} height={400} /><span>bits & pieces ✳</span></a></section>
    <footer id="contact" className={styles.footer}><span className={styles.eyebrow}>HAVE SOMETHING IN MIND?</span><h2>Let’s talk<span>↗</span></h2>{onContact ? <button type="button" onClick={onContact}>Send me a message</button> : <a href={`mailto:${contact.email}`}>{contact.email}</a>}<div><span>Sean Arackal · 2026</span><nav aria-label="Social links"><a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="/portfolio/">Current portfolio ↗</a></nav></div></footer>
  </main>;
}
