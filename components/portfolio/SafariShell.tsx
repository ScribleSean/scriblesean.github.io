"use client";

import type { ReactNode } from "react";
import styles from "./SafariShell.module.css";

type SafariShellProps = {
  children: ReactNode;
  onBack: () => void;
  onContact: () => void;
  onFiles: () => void;
  title?: string;
};

export default function SafariShell({
  children,
  onBack,
  onContact,
  onFiles,
  title = "Sean Arackal",
}: SafariShellProps) {
  return (
    <section className={styles.shell} aria-label="Safari portfolio view">
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Back to desk">‹</button>
        <div className={styles.address} aria-label={`Viewing ${title}`}>
          <span className={styles.lock} aria-hidden="true">▣</span>
          <span>{title}</span>
        </div>
        <span className={styles.more} aria-hidden="true">•••</span>
      </header>
      <div className={styles.page}>{children}</div>
      <nav className={styles.bottomBar} aria-label="Safari actions">
        <button type="button" onClick={onBack}><span aria-hidden="true">‹</span><small>Desk</small></button>
        <button type="button" onClick={onFiles}><span aria-hidden="true">▱</span><small>Files</small></button>
        <button type="button" onClick={onContact}><span aria-hidden="true">●</span><small>Contact</small></button>
      </nav>
    </section>
  );
}
