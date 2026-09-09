"use client";

import { useState, type ReactNode } from "react";
import { PORTFOLIO_HOME, resolveBrowserAddress } from "@/lib/browser-navigation";
import styles from "./BrowserApp.module.css";

export default function BrowserApp({ portfolio }: { portfolio: ReactNode }) {
  const [history, setHistory] = useState([PORTFOLIO_HOME]);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState("scriblesean.github.io/portfolio/");
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const url = history[index];
  function display(value: string) { return value === PORTFOLIO_HOME ? "scriblesean.github.io/portfolio/" : value; }
  function navigate(value: string) {
    try {
      const next = resolveBrowserAddress(value);
      setHistory((items) => [...items.slice(0, index + 1), next]);
      setIndex(index + 1);
      setAddress(display(next));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Invalid address"); }
  }
  function go(step: number) {
    const next = index + step;
    if (next < 0 || next >= history.length) return;
    setIndex(next);
    setAddress(display(history[next]));
    setError("");
  }
  return <section className={styles.browser} aria-label="Web browser">
    <form className={styles.toolbar} onSubmit={(event) => { event.preventDefault(); navigate(address); }}>
      <button type="button" title="Back" aria-label="Browser back" disabled={index === 0} onClick={() => go(-1)}>‹</button>
      <button type="button" title="Forward" aria-label="Browser forward" disabled={index === history.length - 1} onClick={() => go(1)}>›</button>
      <button type="button" title="Reload" aria-label="Reload page" onClick={() => setReload((key) => key + 1)}>↻</button>
      <button type="button" title="Portfolio home" aria-label="Portfolio home" onClick={() => navigate(PORTFOLIO_HOME)}>⌂</button>
      <input aria-label="Search or enter website address" value={address} onChange={(event) => setAddress(event.target.value)} onFocus={(event) => event.target.select()} spellCheck={false} autoComplete="off" />
      <a className={styles.external} href={url} target="_blank" rel="noopener noreferrer" title="Open current page in a new tab" aria-label="Open current page in a new tab">↗</a>
    </form>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {url !== PORTFOLIO_HOME && <div className={styles.notice}>Some sites only open in a separate tab.<a href={url} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a></div>}
    <div className={styles.content} key={`${url}-${reload}`}>
      {url === PORTFOLIO_HOME ? portfolio : <iframe title="Browser webpage" src={url} referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" />}
    </div>
  </section>;
}
