import styles from "./OpenSourceContributions.module.css";

const contributions = [
  {
    name: "tscircuit/image-utils",
    url: "https://github.com/tscircuit/image-utils/pull/41",
    summary: "A proposed fix for PNG comparison thresholds, with regression tests and documentation.",
  },
];

export default function OpenSourceContributions() {
  return <section className={styles.contributions} aria-label="Open-source contributions">
    <h3>Open-source contributions</h3>
    <p className={styles.intro}>Codex-assisted work, reviewed by me.</p>
    <ul>{contributions.map(contribution => <li key={contribution.url}>
      <div className={styles.title}><a href={contribution.url} target="_blank" rel="noreferrer">{contribution.name} ↗</a><span>Pull request submitted</span></div>
      <p>{contribution.summary}</p>
    </li>)}</ul>
  </section>;
}
