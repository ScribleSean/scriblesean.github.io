// Timeline for the Observatory intro, from observatory/docs/INTRO-STORYBOARD.md.
// Every frame is a pure function of the time t in seconds, so any moment can be
// rendered, tested or linked with ?t=.

export const TOTAL = 27;

export type Beat = { start: number; length: number; caption: string; textAlternative: string };

export const BEATS: Beat[] = [
  { start: 0, length: 3, caption: "Your limits, at a glance.",
    textAlternative: "Close on the Mac menu bar: a telescope icon with 47%, the lowest limit left." },
  { start: 3, length: 4, caption: "Observatory runs in your menu bar.",
    textAlternative: "Its menu lists each Claude Code and Codex limit with reset times, and today's screen time, tokens and API-equivalent cost." },
  { start: 7, length: 4.5, caption: "Am I near my limits?",
    textAlternative: "The dashboard's Limits tile: 47% left on the Claude Code 5-hour window, 78% weekly, Codex 64% and 88%." },
  { start: 11.5, length: 4, caption: "Where did my time go?",
    textAlternative: "Screen time today: 3h 53m, mostly editors (2h 20m) and the browser (1h 33m)." },
  { start: 15.5, length: 4, caption: "What did it cost?",
    textAlternative: "Cost today: $60.70, an API-equivalent estimate, not a bill. Claude Code $43.78, Codex $16.92." },
  { start: 19.5, length: 4.5, caption: "One computer, or two.",
    textAlternative: "The view pulls back to the whole dashboard, with limit history below, and a second computer, Test PC, joins. Screen time: Studio Mac 3h 53m, Test PC 2h 30m, 6h 23m together. Cost: Studio Mac $60.70, Test PC $26.25, $86.95 together. Both sums are labeled not deduplicated. Limits are never added together." },
  { start: 24, length: 3, caption: "Local only. Open source.",
    textAlternative: "End card: git clone https://github.com/ScribleSean/observatory.git, then cd observatory and npm run setup." },
];

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const easeOutCubic = (p: number) => 1 - (1 - clamp(p)) ** 3;
export const easeInOutCubic = (p: number) => {
  const x = clamp(p);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};

export function ease(t: number, start: number, dur: number): number {
  if (dur <= 0) return t >= start ? 1 : 0;
  return easeOutCubic((t - start) / dur);
}

export function beatAt(t: number): number {
  const time = clamp(t, 0, TOTAL);
  for (let i = BEATS.length - 1; i >= 0; i--) if (time >= BEATS[i].start) return i;
  return 0;
}

export function countUp(t: number, landAt: number, from: number, to: number, dur = 0.6): number {
  return from + (to - from) * ease(t, landAt - dur, dur);
}

export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

export const formatDollars = (v: number) => `$${v.toFixed(2)}`;

// Fictional data. Project and computer names follow the storyboard notes.
export const DATA = {
  limits: [
    { label: "Claude Code 5-hour", left: 47, series: "claude" },
    { label: "Claude Code weekly", left: 78, series: "claude" },
    { label: "Codex 5-hour", left: 64, series: "codex" },
    { label: "Codex weekly", left: 88, series: "codex" },
  ],
  screen: { one: 233, two: 383, rows: [{ label: "Editors", minutes: 140 }, { label: "Browser", minutes: 93 }] },
  cost: {
    one: 60.7,
    two: 86.95,
    rows: [
      { label: "Claude Code", value: 43.78, series: "claude" },
      { label: "Codex", value: 16.92, series: "codex" },
    ],
  },
  tokens: { one: "30.4M tokens", two: "43.5M tokens" },
} as const;

export type Rect = { x: number; y: number; w: number; h: number };
export type Camera = { x: number; y: number; scale: number };

export const WORLD: Rect = { x: 0, y: 0, w: 1920, h: 1080 };
export const TILES: Rect[] = [
  { x: 60, y: 150, w: 590, h: 470 },
  { x: 665, y: 150, w: 590, h: 470 },
  { x: 1270, y: 150, w: 590, h: 470 },
];

export function fit(r: Rect, vw: number, vh: number, pad = 48): Camera {
  const scale = Math.min((vw - 2 * pad) / r.w, (vh - 2 * pad) / r.h);
  return { scale, x: vw / 2 - (r.x + r.w / 2) * scale, y: vh / 2 - (r.y + r.h / 2) * scale };
}

const mixCam = (a: Camera, b: Camera, p: number): Camera => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  scale: a.scale + (b.scale - a.scale) * p,
});

/** On a portrait frame the whole dashboard is too small to read, so the pull back only rises from the Cost tile
 * to take in the computer chips above it. */
export const TWO_COMPUTERS: Rect = { x: 1250, y: 30, w: 630, h: 600 };

export function cameraAt(t: number, vw: number, vh: number): Camera {
  const whole = vh > vw ? fit(TWO_COMPUTERS, vw, vh) : fit(WORLD, vw, vh, 24);
  const tile = TILES.map((r) => fit(r, vw, vh));
  const moves: { at: number; dur: number; to: Camera }[] = [
    { at: 7.0, dur: 0.9, to: tile[0] },
    { at: 11.5, dur: 0.6, to: tile[1] },
    { at: 15.5, dur: 0.6, to: tile[2] },
    { at: 19.5, dur: 0.7, to: whole },
  ];
  let cam = whole;
  for (const move of moves) {
    if (t < move.at) break;
    cam = mixCam(cam, move.to, easeInOutCubic((t - move.at) / move.dur));
  }
  return cam;
}

// Sage skin, light and dark (observatory/app/viewer/sage.json).
export const SAGE = {
  background: ["#EDEAE5", "#1C1D1B"],
  surface: ["#F4F1EC", "#272825"],
  text: ["#292D28", "#F0EEE8"],
  muted: ["#5B6056", "#B3B7AC"],
  strong: ["#364632", "#DCE6D2"],
  accent: ["#586F50", "#ADC29D"],
  track: ["#DADBD3", "#3B3E37"],
  claude: ["#B5633C", "#CB7550"],
  codex: ["#2E6E9E", "#4F95CF"],
} as const;

/** Beat 1 opens close on the menu bar item, then pulls back as the panel opens. */
export const deskZoom = (t: number) => 1 + 1.8 * (1 - easeInOutCubic((t - 2.4) / 1.0));

/** Seven days of limit history for one 5-hour series, as in the dashboard's chart. Each window falls from near
 * 100% and the line breaks at its reset. Working days hold two or three windows close together, nights are gaps.
 * Points are in a 0..800 by 0..196 box where y 0 is 100% left. Fixed, so every render is identical. */
export function historySegments(seed: number): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  let k = seed;
  const next = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  for (let day = 0; day < 7; day++) {
    let x = 8 + day * 112 + next() * 10;
    const windows = 1 + Math.floor(next() * 3);
    for (let i = 0; i < windows && x < 790; i++) {
      const w = 14 + next() * 16;
      out.push([x, next() * 4, Math.min(792, x + w), 18 + next() * (next() < 0.35 ? 80 : 40)]);
      x += w + 6 + next() * 8;
    }
  }
  return out;
}

/** The Sage skin in one appearance. The intro follows the page's light or dark appearance and never switches mid-play. */
export function palette(dark: boolean): Record<keyof typeof SAGE, string> {
  return Object.fromEntries(Object.entries(SAGE).map(([k, pair]) => [k, pair[dark ? 1 : 0]])) as Record<keyof typeof SAGE, string>;
}

export function parseTime(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const t = Number(value);
  return Number.isFinite(t) ? clamp(t, 0, TOTAL) : null;
}
