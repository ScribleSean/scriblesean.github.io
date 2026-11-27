import styles from "./AssembleName.module.css";

// The page's one orchestrated moment: the name's letters rise into place on load.
// Screen readers get the plain name; the letters are decoration.
export default function AssembleName({ text }: { text: string }) {
  return (
    <span className={styles.name}>
      <span className={styles.srOnly}>{text}</span>
      <span aria-hidden="true">
        {[...text].map((letter, i) => (
          <span key={i} className={styles.letter} style={{ "--i": i } as React.CSSProperties}>{letter === " " ? " " : letter}</span>
        ))}
      </span>
    </span>
  );
}
