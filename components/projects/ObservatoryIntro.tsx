"use client";

import localFont from "next/font/local";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  BEATS, DATA, TILES, TOTAL, beatAt, cameraAt, clamp, countUp, deskZoom, ease, easeInOutCubic, formatDollars, formatMinutes,
  historySegments, palette, parseTime,
} from "@/lib/observatory-intro";
import type { ProjectImage } from "@/data/featured-projects";
import styles from "./ObservatoryIntro.module.css";

const interTight = localFont({ src: "./fonts/InterTight.woff2", weight: "400 650", display: "swap", preload: false });
// preload is off so only pages that draw the intro fetch the font, not every project page.

const FORMATS = {
  wide: { w: 1920, h: 1080, band: 200, zoomShift: [-460, 190] },
  tall: { w: 1080, h: 1350, band: 250, zoomShift: [70, 0] },
} as const;

const toVars = (p: Record<string, string>) => Object.fromEntries(Object.entries(p).map(([k, v]) => [`--${k}`, v])) as CSSProperties;
type Format = keyof typeof FORMATS;

// The dashboard with both computers, which matches that beat's caption.
const REDUCED_MOTION_T = 23.4;
// Cap each step so a tab that was hidden resumes where it left off.
const MAX_FRAME_STEP_S = 0.1;

const isInView = (entry: IntersectionObserverEntry) => {
  const fillsViewport = entry.rootBounds ? entry.intersectionRect.height >= 0.6 * entry.rootBounds.height : false;
  return entry.isIntersecting && (entry.intersectionRatio >= 0.5 || fillsViewport);
};

const fade = (t: number, start: number, dur = 0.6, rise = 8): CSSProperties => {
  const p = ease(t, start, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * rise}px)` };
};

function Telescope({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 10 11-6 3 5-11 6z" />
      <path d="m16 3 4 7M5.8 12 3 13.5M12 13v3m-5 5 5-5 5 5m-5-5v6" />
    </svg>
  );
}

function Caption({ t }: { t: number }) {
  const i = beatAt(t);
  const beat = BEATS[i];
  const inAt = beat.start + (i === 0 ? 0.5 : 0.15);
  const last = i === BEATS.length - 1;
  const out = last ? 1 : 1 - ease(t, beat.start + beat.length - 0.35, 0.3);
  const style = fade(t, inAt);
  return (
    <p className={styles.caption} style={{ ...style, opacity: Number(style.opacity) * out }}>
      {beat.caption}
    </p>
  );
}

function MenuBar({ t, shift }: { t: number; shift: readonly [number, number] }) {
  const open = ease(t, 3.1, 0.5);
  const z = deskZoom(t);
  const p = (z - 1) / 1.8;
  let row = 0;
  const rowStyle = () => fade(t, 3.35 + 0.06 * row++, 0.4, 6);
  const press = ease(t, 6.2, 0.15) * (1 - ease(t, 6.5, 0.2));
  return (
    <div className={styles.desk} style={{ transform: `translate(${shift[0] * p}px, ${shift[1] * p}px) scale(${z})` }}>
      <div className={styles.menubar}>
        <span className={styles.clock}>Thu 10:23 AM</span>
        <span className={styles.item} style={fade(t, 0.5, 0.6, 0)}>
          <Telescope size={30} />
          {DATA.limits[0].left}%
        </span>
        <svg className={styles.glyph} viewBox="0 0 30 20" aria-hidden="true"><path d="M15 17.5 11.4 13a5.6 5.6 0 0 1 7.2 0zM7.6 9.4a11.6 11.6 0 0 1 14.8 0l-2.2 2.7a8.2 8.2 0 0 0-10.4 0zM3.8 5.4a17.4 17.4 0 0 1 22.4 0L24 8a14 14 0 0 0-18 0z" /></svg>
        <svg className={styles.glyph} viewBox="0 0 34 20" aria-hidden="true"><rect x="1.5" y="3" width="27" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="4.5" y="6" width="17" height="8" rx="1.5" /><path d="M31 8v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </div>
      {t >= 3 && (
        <div className={styles.menu} style={{ opacity: open, transform: `translateY(${(open - 1) * 12}px)` }}>
          <p className={styles.menuTitle} style={rowStyle()}><Telescope size={30} />Observatory</p>
          <div className={styles.menuCard}>
            {DATA.limits.map((l, k) => {
              const [name, span] = l.label.split(/ (?=\S+$)/);
              return (
                <div key={l.label} className={styles.menuLimit} style={rowStyle()}>
                  <span className={styles.rowLine}><span><i className={styles[l.series]} /><b>{name}</b> {span}</span><b>{l.left}%</b></span>
                  <span className={styles.track}><span className={styles[l.series]} style={{ width: `${l.left * ease(t, 3.5 + 0.08 * k, 0.6)}%` }} /></span>
                </div>
              );
            })}
          </div>
          <div className={styles.menuCard} style={rowStyle()}>
            <p className={styles.row}><b>Studio Mac</b><span>3h 53m · {DATA.tokens.one} · $61</span></p>
          </div>
          <div className={styles.menuActions} style={rowStyle()}>
            <span className={styles.menuButton} style={{ transform: `scale(${1 - 0.03 * press})`, filter: `brightness(${1 - 0.08 * press})` }}>Open dashboard</span>
            <span className={styles.menuRound}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" /></svg></span>
            <span className={styles.menuRound}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" /></svg></span>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryChart({ t, series, seed, name, span }: { t: number; series: "claude" | "codex"; seed: number; name: string; span: string }) {
  const id = useId();
  const reveal = easeInOutCubic((t - 19.7) / 1.1);
  return (
    <div className={styles.chart}>
      <p className={styles.chartHead}><i className={styles[series]} /><b>{name}</b> {span}</p>
      <svg viewBox="0 0 860 236" preserveAspectRatio="none">
        <defs><clipPath id={id}><rect x="0" y="-10" width={60 + 800 * reveal} height="220" /></clipPath></defs>
        {[0, 100, 196].map((y, k) => (
          <g key={y}>
            <text x="0" y={y + (k === 0 ? 12 : k === 2 ? 0 : 6)} className={styles.axis}>{["100%", "50%", "0%"][k]}</text>
            <line x1="60" x2="860" y1={y} y2={y} className={styles.grid} />
          </g>
        ))}
        {["Thu 10 AM", "Sun 10 PM", "Thu 10 AM"].map((label, k) => (
          <text key={k} x={60 + k * 400} y="232" className={styles.axis} textAnchor={(["start", "middle", "end"] as const)[k]}>{label}</text>
        ))}
        <g clipPath={`url(#${id})`} transform="translate(60 0)">
          {historySegments(seed).map(([x1, y1, x2, y2]) => (
            <line key={x1} x1={x1} y1={y1} x2={x2} y2={y2} className={styles[`${series}Line`]} />
          ))}
        </g>
      </svg>
    </div>
  );
}

const TILE_STARTS = [7, 11.5, 15.5, 19.5];

function Dashboard({ t, vw, vh }: { t: number; vw: number; vh: number }) {
  const cam = cameraAt(t, vw, vh);
  // Portrait pulls back only to the Cost tile and the computer chips, so everything else steps out instead of peeking in.
  const offFrame = vh > vw ? 1 - ease(t, 19.5, 0.5) : 1;
  // Each tile fades in when the camera reaches it, steps back while the next one has focus, and returns on the pull back.
  const tileOpacity = (i: number) => {
    const shownAt = ease(t, TILE_STARTS[i] - 0.1, 0.5);
    const dimmed = 0.6 * ease(t, TILE_STARTS[i + 1], 0.4) * (1 - ease(t, 19.5, 0.6));
    return shownAt * (1 - dimmed) * (i < 2 ? offFrame : 1);
  };
  const tileStyle = (i: number): CSSProperties => ({
    left: TILES[i].x, top: TILES[i].y, width: TILES[i].w, height: TILES[i].h, opacity: tileOpacity(i),
  });
  const two = ease(t, 21.4, 0.4);
  const starts = [7.4, 11.9, 15.9];
  const shown = (i: number) => (t >= starts[i] ? 1 : 0);
  const row = (i: number, k: number) => fade(t, starts[i] + 0.4 + 0.08 * k, 0.5, 10);
  const swap = (a: React.ReactNode, b: React.ReactNode) => (
    <span className={styles.swap}>
      <span style={{ opacity: 1 - two }}>{a}</span>
      <span style={{ opacity: two }}>{b}</span>
    </span>
  );

  const limit = Math.round(countUp(t, 8, 0, DATA.limits[0].left));
  const screen = countUp(t, 12.5, 0, DATA.screen.one) + countUp(t, 22, 0, DATA.screen.two - DATA.screen.one);
  const cost = countUp(t, 16.5, 0, DATA.cost.one) + countUp(t, 22, 0, DATA.cost.two - DATA.cost.one);

  return (
    <div className={styles.world} style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})` }}>
      <header className={styles.header}>
        <span className={styles.brand}><Telescope size={46} />Observatory</span>
        <span className={styles.chips}>
          <span className={styles.chip}>Studio Mac</span>
          {t >= 21 && <span className={styles.chip} style={{ opacity: ease(t, 21, 0.5), transform: `translateX(${(1 - ease(t, 21, 0.5)) * 16}px)` }}>Test PC</span>}
        </span>
      </header>

      <section className={styles.tile} style={tileStyle(0)}>
        <p className={styles.label}>Limits</p>
        <p className={styles.hero} style={{ opacity: shown(0) }}>{limit}%</p>
        <p className={styles.sub} style={{ opacity: shown(0) }}>lowest left: Claude Code 5-hour</p>
        <div className={styles.rows}>
          {DATA.limits.map((l, k) => (
            <div key={l.label} className={styles.limitRow} style={row(0, k)}>
              <span className={styles.rowLine}><span><i className={styles[l.series]} />{l.label}</span><span>{l.left}%</span></span>
              <span className={styles.track}><span className={styles[l.series]} style={{ width: `${l.left * ease(t, 7.6 + 0.08 * k, 0.5)}%` }} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.tile} style={tileStyle(1)}>
        <p className={styles.label}>Screen time today</p>
        <p className={styles.hero} style={{ opacity: shown(1) }}>{formatMinutes(screen)}</p>
        <p className={styles.sub} style={{ opacity: shown(1) }}>{swap("largest app categories", "sum, not deduplicated")}</p>
        <div className={styles.rows}>
          {swap(
            DATA.screen.rows.map((r, k) => <p key={r.label} className={styles.row} style={row(1, k)}><span>{r.label}</span><span>{formatMinutes(r.minutes)}</span></p>),
            [["Studio Mac", DATA.screen.one], ["Test PC", DATA.screen.two - DATA.screen.one]].map(([name, m]) => <p key={name} className={styles.row}><span>{name}</span><span>{formatMinutes(Number(m))}</span></p>),
          )}
        </div>
        <p className={styles.foot} style={{ opacity: shown(1) }}>as of 10:23 AM</p>
      </section>

      <section className={styles.tile} style={tileStyle(2)}>
        <p className={styles.label}>Cost today</p>
        <p className={styles.hero} style={{ opacity: shown(2) }}>{formatDollars(cost)}</p>
        <p className={styles.sub} style={{ opacity: shown(2) }}>{swap(DATA.tokens.one, `${DATA.tokens.two}, sum, not deduplicated`)}</p>
        <div className={styles.rows}>
          {swap(
            DATA.cost.rows.map((r, k) => <p key={r.label} className={styles.row} style={row(2, k)}><span><i className={styles[r.series]} />{r.label}</span><span>{formatDollars(r.value)}</span></p>),
            [["Studio Mac", DATA.cost.one], ["Test PC", DATA.cost.two - DATA.cost.one]].map(([name, v]) => <p key={name} className={styles.row}><span>{name}</span><span>{formatDollars(Number(v))}</span></p>),
          )}
        </div>
        <p className={styles.foot} style={fade(t, 16.6, 0.5, 0)}>API-equivalent estimate, not a bill</p>
      </section>

      <nav className={styles.tabs} style={{ opacity: offFrame }} aria-hidden="true"><span>Limits</span><span>Activity</span><span>Tokens</span><span>Sources</span></nav>
      <div className={styles.charts} style={{ opacity: offFrame }}>
        <HistoryChart t={t} series="claude" seed={7} name="Claude Code" span="5-hour" />
        <HistoryChart t={t} series="codex" seed={31} name="Codex" span="5-hour" />
      </div>
    </div>
  );
}

function EndCard({ t }: { t: number }) {
  return (
    <div className={styles.end}>
      <p className={styles.endName} style={fade(t, 24.2)}><Telescope size={96} />Observatory</p>
      <pre className={styles.code} style={fade(t, 24.5)}>
        <code>git clone <span className={styles.wrapPoint}>{"\\\n"}</span>https://github.com/ScribleSean/observatory.git{"\n"}cd observatory && npm run setup</code>
      </pre>
    </div>
  );
}

export default function ObservatoryIntro({ full = false, poster }: { full?: boolean; poster?: ProjectImage }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const outer = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const fromStill = useRef(false);
  const time = useRef(0);
  const [dark, setDark] = useState(false);

  const seek = useCallback((value: number) => { time.current = value; setT(value); }, []);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Light or dark follows the page, so the frame never glares on a dark page.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => setDark(scheme.matches);
    onScheme();
    scheme.addEventListener("change", onScheme);

    const linked = parseTime(new URLSearchParams(window.location.search).get("t"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (linked !== null || motion.matches) {
      seek(linked ?? REDUCED_MOTION_T);
      fromStill.current = linked === null;
      userPaused.current = true;
    }

    const onMotion = (e: MediaQueryListEvent) => {
      if (!e.matches) return;
      userPaused.current = true;
      fromStill.current = true;
      setPlaying(false);
      seek(REDUCED_MOTION_T);
    };
    motion.addEventListener("change", onMotion);

    const io = new IntersectionObserver(([entry]) => {
      if (!isInView(entry)) setPlaying(false);
      else if (!userPaused.current && time.current < TOTAL) setPlaying(true);
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); motion.removeEventListener("change", onMotion); scheme.removeEventListener("change", onScheme); };
  }, [seek]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      const next = Math.min(TOTAL, time.current + Math.min(MAX_FRAME_STEP_S, (now - last) / 1000));
      last = now;
      seek(next);
      if (next >= TOTAL) setPlaying(false);
      else id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [playing, seek]);

  const toggle = () => {
    if (playing) { userPaused.current = true; setPlaying(false); return; }
    userPaused.current = false;
    if (time.current >= TOTAL || fromStill.current) seek(0);
    fromStill.current = false;
    setPlaying(true);
  };

  const format: Format = box && box.h > box.w ? "tall" : "wide";
  const { w, h, band, zoomShift } = FORMATS[format];
  const scale = box ? Math.min(box.w / w, full ? box.h / h : Infinity) : 0;
  const vars = toVars(palette(dark));
  const done = t >= TOTAL;
  const sceneFade = 1 - ease(t, 24, 0.4);
  const scene = (
    <>
      <div className={styles.band} style={{ height: band }}><Caption t={t} /></div>
      <div className={styles.view} style={{ top: band, height: h - band }}>
        {t < 7 && <MenuBar t={t} shift={zoomShift} />}
        {t >= 7 && t < 24.4 && <div className={styles.fill} style={{ opacity: sceneFade }}><Dashboard t={t} vw={w} vh={h - band} /></div>}
        {t >= 24 && <EndCard t={t} />}
      </div>
    </>
  );

  const figure = (
    <figure
      ref={outer}
      className={`${styles.outer} ${full ? styles.full : ""} ${format === "tall" ? styles.tall : ""} ${interTight.className}`}
      style={vars}
      aria-label="Observatory intro, 27 seconds, with fictional data"
    >
      {!box && poster && (
        <picture className={styles.poster}>
          {poster.darkSrc && <source media="(prefers-color-scheme: dark)" srcSet={poster.darkSrc} />}
          <img src={poster.src} alt="" width={poster.width} height={poster.height} decoding="async" />
        </picture>
      )}
      <div className={styles.stage} style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})`, opacity: box ? 1 : 0, "--inverse-stage-scale": scale ? 1 / scale : 1 } as CSSProperties} aria-hidden="true">
        {scene}
      </div>
      <ol className={styles.srOnly}>{BEATS.map((b) => <li key={b.start}>{b.caption} {b.textAlternative}</li>)}</ol>
      <span className={styles.progress} style={{ width: `${clamp(t / TOTAL) * 100}%` }} />
      <button type="button" className={styles.control} onClick={toggle} aria-label={playing ? "Pause" : done ? "Replay" : "Play"}>
        {playing
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.5" height="14" rx="1" /><rect x="14" y="5" width="3.5" height="14" rx="1" /></svg>
          : done
            ? <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>}
      </button>
    </figure>
  );
  return full ? figure : <div className={styles.frame}>{figure}</div>;
}
