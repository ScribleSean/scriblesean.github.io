import styles from "./OpenSourceContributions.module.css";

const contributions = [
  {
    name: "tscircuit/image-utils",
    url: "https://github.com/tscircuit/image-utils/pull/41",
    summary: "A proposed fix for PNG comparison thresholds, with regression tests and documentation.",
  },
  {
    name: "color-js/color.js",
    url: "https://github.com/color-js/color.js/pull/767",
    summary: "A proposed parser fix to reject unexpected punctuation in color functions, with regression tests.",
  },
];

export default function OpenSourceContributions() {
  return <article className={styles.contributions} aria-label="Open-source contributions">
    <p className={styles.label}>Open source pull requests</p>
    <ul>{contributions.map(contribution => <li key={contribution.url}>
      <div className={styles.title}><a href={contribution.url} target="_blank" rel="noreferrer">{contribution.name} ↗</a></div>
      <p>{contribution.summary}</p>
    </li>)}</ul>
  </article>;
}
