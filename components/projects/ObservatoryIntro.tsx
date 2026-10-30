"use client";

import localFont from "next/font/local";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BEATS, DATA, TILES, TOTAL, beatAt, cameraAt, clamp, countUp, ease, formatDollars, formatMinutes, paletteAt, parseTime,
} from "@/lib/observatory-intro";
import styles from "./ObservatoryIntro.module.css";

const interTight = localFont({ src: "./fonts/InterTight.ttf", weight: "100 900", display: "swap", preload: false });
// preload is off so only pages that draw the intro fetch the font, not every project page.

// Logical canvas sizes from the storyboard: 1920 by 1080, or 1080 by 1350 on narrow screens.
const FORMATS = {
  wide: { w: 1920, h: 1080, band: 200 },
  tall: { w: 1080, h: 1350, band: 250 },
} as const;
type Format = keyof typeof FORMATS;

// Reduced motion shows one still frame: the whole dashboard in light mode.
const STILL = 20.25;

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

function MenuBar({ t }: { t: number }) {
  const open = ease(t, 3.1, 0.5);
  const rows = DATA.limits.map((l) => [`${l.label}: ${l.left}% left`, l.label.includes("weekly") ? "Resets in 4d 21h" : "Resets in 2h 43m"]);
  let row = 0;
  const rowStyle = () => fade(t, 3.35 + 0.06 * row++, 0.4, 6);
  return (
    <div className={styles.desk}>
      <div className={styles.menubar}>
        <span className={styles.clock}>Thu 10:23 AM</span>
        <span className={styles.item} style={fade(t, 0.5, 0.6, 0)}>
          <Telescope size={30} />
          47%
        </span>
        <span className={styles.glyph} />
        <span className={styles.glyph} />
      </div>
      {t >= 3 && (
        <div className={styles.menu} style={{ opacity: open, transform: `translateY(${(open - 1) * 12}px)` }}>
          <p className={styles.menuHead} style={rowStyle()}>Limits</p>
          {rows.map(([a, b]) => <p key={a} style={rowStyle()}>{a} · {b}</p>)}
          <hr style={rowStyle()} />
          <p className={styles.menuHead} style={rowStyle()}>Today</p>
          <p style={rowStyle()}>Studio Mac: 3h 53m screen · {DATA.tokens.one} · $61 API-equivalent</p>
          <hr style={rowStyle()} />
          <p style={rowStyle()}>Open dashboard <kbd>⌘D</kbd></p>
        </div>
      )}
    </div>
  );
}

function Dashboard({ t, vw, vh }: { t: number; vw: number; vh: number }) {
  const cam = cameraAt(t, vw, vh);
  const beat = beatAt(t);
  const focus = beat >= 2 && beat <= 4 ? beat - 2 : -1;
  const tileStyle = (i: number): CSSProperties => ({
    left: TILES[i].x, top: TILES[i].y, width: TILES[i].w, height: TILES[i].h,
    opacity: focus === -1 || focus === i ? 1 : 0.45,
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

      <nav className={styles.tabs} aria-hidden="true"><span>Limits</span><span>Activity</span><span>Tokens</span><span>Sources</span></nav>
      <div className={styles.charts}>
        {(["claude", "codex"] as const).map((series) => (
          <div key={series} className={styles.chart}>
            <svg viewBox="0 0 800 200" preserveAspectRatio="none">
              <path className={styles[`${series}Line`]} d={series === "claude"
                ? "M0 30 L90 150 M110 20 L210 160 M230 25 L330 140 M350 20 L450 170 M470 30 L560 150 M580 20 L680 155 M700 25 L800 120"
                : "M0 20 L120 70 M140 20 L260 80 M280 20 L400 65 M420 20 L540 90 M560 20 L680 70 M700 20 L800 60"} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndCard({ t }: { t: number }) {
  return (
    <div className={styles.end}>
      <p className={styles.endName} style={fade(t, 24.2)}><Telescope size={96} />Observatory</p>
      <pre className={styles.code} style={fade(t, 24.5)}>
        <code>git clone https://github.com/ScribleSean/observatory.git{"\n"}cd observatory && npm run setup</code>
      </pre>
    </div>
  );
}

export default function ObservatoryIntro({ full = false }: { full?: boolean }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const outer = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const fromStill = useRef(false);
  const time = useRef(0);

  const seek = useCallback((value: number) => { time.current = value; setT(value); }, []);

  // Size, format and first frame.
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const linked = parseTime(new URLSearchParams(window.location.search).get("t"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (linked !== null || motion.matches) {
      seek(linked ?? STILL);
      fromStill.current = linked === null;
      userPaused.current = true;
    }

    // Reduced motion turned on mid-play: stop on the still frame.
    const onMotion = (e: MediaQueryListEvent) => {
      if (!e.matches) return;
      userPaused.current = true;
      fromStill.current = true;
      setPlaying(false);
      seek(STILL);
    };
    motion.addEventListener("change", onMotion);

    // In view means half visible, or filling most of a short viewport.
    const io = new IntersectionObserver(([entry]) => {
      const fills = entry.rootBounds ? entry.intersectionRect.height >= 0.6 * entry.rootBounds.height : false;
      const seen = entry.isIntersecting && (entry.intersectionRatio >= 0.5 || fills);
      if (!seen) setPlaying(false);
      else if (!userPaused.current && time.current < TOTAL) setPlaying(true);
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); motion.removeEventListener("change", onMotion); };
  }, [seek]);

  // Frame loop.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      // Cap each step so a tab that was hidden resumes where it left off.
      const next = Math.min(TOTAL, time.current + Math.min(0.1, (now - last) / 1000));
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

  // The frame's shape comes from CSS (a container query), so follow the measured box.
  const format: Format = box && box.h > box.w ? "tall" : "wide";
  const { w, h, band } = FORMATS[format];
  const scale = box ? Math.min(box.w / w, full ? box.h / h : Infinity) : 0;
  const palette = paletteAt(t);
  const vars = Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--${k}`, v])) as CSSProperties;
  const done = t >= TOTAL;
  const sceneFade = 1 - ease(t, 24, 0.4);

  const figure = (
    <figure
      ref={outer}
      className={`${styles.outer} ${full ? styles.full : ""} ${format === "tall" ? styles.tall : ""} ${interTight.className}`}
      style={vars}
      aria-label="Observatory intro, 27 seconds, with fictional data"
    >
      <div className={styles.stage} style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})`, opacity: box ? 1 : 0 }} aria-hidden="true">
        <div className={styles.band} style={{ height: band }}><Caption t={t} /></div>
        <div className={styles.view} style={{ top: band, height: h - band }}>
          {t < 7 && <MenuBar t={t} />}
          {t >= 7 && t < 24.4 && <div className={styles.fill} style={{ opacity: sceneFade }}><Dashboard t={t} vw={w} vh={h - band} /></div>}
          {t >= 24 && <EndCard t={t} />}
        </div>
      </div>
      <ol className={styles.srOnly}>{BEATS.map((b) => <li key={b.start}>{b.caption} {b.says}</li>)}</ol>
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
  // The frame is a size container so CSS picks 16:9 or 4:5 before any script runs.
  return full ? figure : <div className={styles.frame}>{figure}</div>;
}
