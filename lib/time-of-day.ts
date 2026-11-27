// The site follows the visitor's local clock: daylight, golden hour, then night.
// Pages are light by day and at golden hour and dark at night; the 3D room relights to match.
// A visitor can pin a phase with the toggle; "auto" follows the clock again.

export type Phase = "day" | "golden" | "night";
export type TimeMode = "auto" | Phase;

export const TIME_KEY = "sean-time-of-day";
const CHANGE_EVENT = "sean-time-change";
export const timeModes: TimeMode[] = ["auto", "day", "golden", "night"];

// Fixed hours, not sunrise tables: the site never asks where the visitor is.
export function phaseAt(date: Date): Phase {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 20 || hour < 6) return "night";
  if (hour >= 17 || hour < 7.5) return "golden";
  return "day";
}

export const themeOf = (phase: Phase) => (phase === "night" ? "dark" : "light");

export function readMode(): TimeMode {
  try {
    const saved = window.localStorage.getItem(TIME_KEY);
    if (saved && (timeModes as string[]).includes(saved)) return saved as TimeMode;
  } catch { /* Browser storage is optional. */ }
  return "auto";
}

export function currentPhase(mode: TimeMode = readMode(), now = new Date()): Phase {
  return mode === "auto" ? phaseAt(now) : mode;
}

export function setMode(mode: TimeMode) {
  try {
    if (mode === "auto") window.localStorage.removeItem(TIME_KEY);
    else window.localStorage.setItem(TIME_KEY, mode);
  } catch { /* Keep it for this page only. */ }
  applyPhase(currentPhase(mode));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function applyPhase(phase: Phase) {
  const root = document.documentElement;
  root.dataset.phase = phase;
  root.dataset.theme = themeOf(phase);
}

// Re-checks the clock each minute so an open page moves into the next phase.
export function subscribeTime(callback: () => void) {
  const tick = () => { applyPhase(currentPhase()); callback(); };
  const timer = window.setInterval(tick, 60_000);
  const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === TIME_KEY) tick(); };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

// Runs in <head> before the first paint, so a night visit never flashes the light theme.
// Kept in sync with phaseAt and readMode above (tests/time-of-day.test.ts checks both agree).
export const phaseScript = `(function(){try{var m=null;try{m=localStorage.getItem(${JSON.stringify(TIME_KEY)})}catch(e){}var d=new Date(),h=d.getHours()+d.getMinutes()/60,p=(m==="day"||m==="golden"||m==="night")?m:(h>=20||h<6)?"night":(h>=17||h<7.5)?"golden":"day";var r=document.documentElement;r.dataset.phase=p;r.dataset.theme=p==="night"?"dark":"light"}catch(e){}})();`;
