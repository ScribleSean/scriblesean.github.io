"use client";

import { contact, experience, projects, skills } from "@/data/resume";
import styles from "./PortfolioContent.module.css";

type PortfolioContentProps = {
  onContact?: () => void;
};

const nav = ["work", "experience", "education", "skills"];

export default function PortfolioContent({ onContact }: PortfolioContentProps) {
  return (
    <main className={styles.portfolio}>
      <header className={`${styles.siteHeader} ${styles.wrap}`}>
        <a className={styles.wordmark} href="#top" aria-label="Sean Arackal, home">SA</a>
        <nav className={styles.navigation} aria-label="Portfolio navigation">
          {nav.map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
          {onContact ? (
            <button type="button" onClick={onContact}>contact</button>
          ) : (
            <a href="#contact">contact</a>
          )}
        </nav>
      </header>

      <section className={`${styles.hero} ${styles.wrap}`} id="top">
        <p className={styles.eyebrow}>Computer Science · AI Engineering · Worcester, MA</p>
        <h1>Sean<br />Arackal</h1>
        <div className={styles.heroBottom}>
          <p className={styles.lede}>I build AI systems, research tools, and accessible software with measurable outcomes.</p>
          <a className={styles.arrowLink} href="#work">View selected work <span>↓</span></a>
        </div>
      </section>

      <section className={`${styles.section} ${styles.wrap}`} id="work">
        <div className={styles.sectionHeading}><span>01</span><h2>Selected work</h2></div>
        <div className={styles.projects}>
          {projects.map((project, index) => (
            <article className={styles.project} key={project.name}>
              <div className={styles.projectIndex}>0{index + 1}</div>
              <div className={styles.projectMain}>
                <div className={styles.projectTitle}>
                  <h3>{project.name}</h3>
                  <a href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>↗</a>
                </div>
                <p className={styles.meta}>{project.role} · {project.period} · {project.location}</p>
                <p className={styles.summary}>{project.summary}</p>
                <ul className={styles.outcomes}>{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
                <ul className={styles.tags}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.wrap}`} id="experience">
        <div className={styles.sectionHeading}><span>02</span><h2>Experience</h2></div>
        <div className={styles.experienceList}>
          {experience.map((job) => (
            <article className={styles.job} key={`${job.company}-${job.period}`}>
              <p className={styles.jobPeriod}>{job.period}</p>
              <div><h3>{job.role}</h3><p className={styles.company}>{job.company} · {job.location}</p></div>
              <p>{job.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.wrap} ${styles.education}`} id="education">
        <div className={styles.sectionHeading}><span>03</span><h2>Education</h2></div>
        <div className={styles.educationGrid}>
          <div><h3>Worcester Polytechnic Institute</h3><p>Bachelor&apos;s, Computer Science</p></div>
          <div><p>Aug 2022 - May 2026</p><p>GPA: 3.53</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.wrap}`} id="skills">
        <div className={styles.sectionHeading}><span>04</span><h2>Skills</h2></div>
        <ul className={styles.skillList}>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        <p className={styles.languages}><strong>Languages</strong> Bengali, Hindi</p>
      </section>

      <footer className={`${styles.section} ${styles.contact} ${styles.wrap}`} id="contact">
        <div className={styles.sectionHeading}><span>05</span><h2>Contact</h2></div>
        <p className={styles.contactLine}>Let&apos;s build something useful.</p>
        {onContact ? (
          <button type="button" className={styles.email} onClick={onContact}>Start a message ↗</button>
        ) : (
          <a className={styles.email} href={`mailto:${contact.email}`}>{contact.email} ↗</a>
        )}
        <div className={styles.contactMeta}>
          <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
          <span>{contact.location}</span>
        </div>
      </footer>
    </main>
  );
}
