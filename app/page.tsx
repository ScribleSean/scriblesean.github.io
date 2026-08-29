import { contact, experience, projects, skills } from "@/data/resume";

const nav = ["work", "experience", "education", "skills", "contact"];

export default function Home() {
  return (
    <main>
      <header className="site-header wrap">
        <a className="wordmark" href="#top" aria-label="Sean Arackal, home">SA</a>
        <nav aria-label="Main navigation">
          {nav.map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
        </nav>
      </header>

      <section className="hero wrap" id="top">
        <p className="eyebrow">Computer Science · AI Engineering · Worcester, MA</p>
        <h1>Sean<br />Arackal</h1>
        <div className="hero-bottom">
          <p className="lede">I build AI systems, research tools, and accessible software with measurable outcomes.</p>
          <a className="arrow-link" href="#work">View selected work <span>↓</span></a>
        </div>
      </section>

      <section className="section wrap" id="work">
        <div className="section-heading"><span>01</span><h2>Selected work</h2></div>
        <div className="projects">
          {projects.map((project, index) => (
            <article className="project" key={project.name}>
              <div className="project-index">0{index + 1}</div>
              <div className="project-main">
                <div className="project-title">
                  <h3>{project.name}</h3>
                  <a href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>↗</a>
                </div>
                <p className="meta">{project.role} · {project.period} · {project.location}</p>
                <p className="summary">{project.summary}</p>
                <ul className="outcomes">{project.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
                <ul className="tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap" id="experience">
        <div className="section-heading"><span>02</span><h2>Experience</h2></div>
        <div className="experience-list">
          {experience.map((job) => (
            <article className="job" key={`${job.company}-${job.period}`}>
              <p className="job-period">{job.period}</p>
              <div><h3>{job.role}</h3><p className="company">{job.company} · {job.location}</p></div>
              <p>{job.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap education" id="education">
        <div className="section-heading"><span>03</span><h2>Education</h2></div>
        <div className="education-grid">
          <div><h3>Worcester Polytechnic Institute</h3><p>Bachelor&apos;s, Computer Science</p></div>
          <div><p>Aug 2022 - May 2026</p><p>GPA: 3.53</p></div>
        </div>
      </section>

      <section className="section wrap" id="skills">
        <div className="section-heading"><span>04</span><h2>Skills</h2></div>
        <ul className="skill-list">{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        <p className="languages"><strong>Languages</strong> Bengali, Hindi</p>
      </section>

      <footer className="section contact wrap" id="contact">
        <div className="section-heading"><span>05</span><h2>Contact</h2></div>
        <p className="contact-line">Let&apos;s build something useful.</p>
        <a className="email" href={`mailto:${contact.email}`}>{contact.email} ↗</a>
        <div className="contact-meta">
          <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
          <span>{contact.location}</span>
        </div>
      </footer>
    </main>
  );
}

