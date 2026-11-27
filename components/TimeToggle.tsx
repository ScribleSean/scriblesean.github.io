"use client";

import { useSyncExternalStore } from "react";
import { currentPhase, readMode, setMode, subscribeTime, timeModes, type Phase, type TimeMode } from "@/lib/time-of-day";
import styles from "./TimeToggle.module.css";

const names: Record<Phase, string> = { day: "Day", golden: "Golden hour", night: "Night" };

function Icon({ phase }: { phase: Phase }) {
  if (phase === "night") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13.6 12.9A6 6 0 0 1 7.1 4.4a6.4 6.4 0 1 0 6.5 8.5Z" /></svg>;
  if (phase === "golden") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 13a5.5 5.5 0 0 1 11 0Z" /><path d="M2.5 15.5h15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

// One button: Auto follows the visitor's clock; each press pins the next phase, then back to Auto.
export default function TimeToggle({ className = "" }: { className?: string }) {
  const snapshot = useSyncExternalStore(subscribeTime, () => `${readMode()}:${currentPhase()}`, () => "auto:day");
  const [mode, phase] = snapshot.split(":") as [TimeMode, Phase];
  const next = timeModes[(timeModes.indexOf(mode) + 1) % timeModes.length];
  const label = mode === "auto" ? "Auto" : names[phase];
  return (
    <button type="button" className={`${styles.toggle} ${className}`} onClick={() => setMode(next)}
      aria-label={`Time of day: ${mode === "auto" ? `following your clock, ${names[phase].toLowerCase()}` : names[phase]}. Switch to ${next === "auto" ? "your clock" : names[next]}`}>
      <Icon phase={phase} /><span>{label}</span>
    </button>
  );
}
