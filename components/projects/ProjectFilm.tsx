"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ProjectFilm as Film } from "@/data/featured-projects";
import { loopBlur, loopFocus, loopKey, loopPlays, loopToggle, type LoopHold } from "@/lib/film-loop";
import styles from "./ProjectPage.module.css";

// The silent loop plays on its own unless the viewer asks for less motion or pauses it: the corner button
// or Space and Enter on the loop toggle it, and keyboard focus pauses it until focus leaves.
// The other button swaps in the full film.
export default function ProjectFilm({ film, name }: { film: Film; name: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [full, setFull] = useState(false);
  const [held, setHeld] = useState<LoopHold>(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hint = useId();
  const playing = loopPlays({ reducedMotion, held });

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (full) {
      element.focus();
      void element.play().catch(() => {});
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(reduce.matches);
    const changed = () => {
      sync();
      setHeld((current) => current === "choice" ? false : current);
    };
    sync();
    reduce.addEventListener("change", changed);
    return () => reduce.removeEventListener("change", changed);
  }, [full]);

  useEffect(() => {
    const element = video.current;
    if (!element || full) return;
    if (playing) void element.play().catch(() => {});
    else element.pause();
  }, [full, playing]);

  return (
    <div className={styles.film}>
      {full ? (
        <video key="full" ref={video} src={film.src} poster={film.poster} width={film.width} height={film.height} controls playsInline preload="auto" aria-label={`${name} film. ${film.label}`} />
      ) : (
        <>
          <video key="loop" ref={video} src={film.loop} poster={film.poster} width={film.width} height={film.height} muted loop playsInline preload="metadata" aria-label={film.label}
            tabIndex={0}
            aria-describedby={hint}
            onFocus={(event) => { if (focusVisible(event.currentTarget)) setHeld(loopFocus); }}
            onBlur={() => setHeld(loopBlur)}
            onKeyDown={(event) => {
              const next = loopKey(event.key, held, reducedMotion, event.repeat);
              if (next === undefined) return;
              event.preventDefault();
              setHeld(next);
            }}
          />
          <span id={hint} className={styles.srOnly}>Space or Enter pauses or plays</span>
          <span role="status" className={styles.srOnly}>{held && !playing ? "Paused" : ""}</span>
          <button type="button" className={styles.filmPlay} onClick={() => setFull(true)}>
            <span aria-hidden="true">▶</span>
            {film.sound ? "Play with sound" : "Play film"}
          </button>
          <button type="button" className={styles.filmPause} aria-label="Pause film loop" aria-pressed={!playing}
            onClick={() => setHeld((current) => loopToggle(current, reducedMotion))}>
            <svg aria-hidden="true" viewBox="0 0 16 16"><path d={playing ? "M4 2h3v12H4zm5 0h3v12H9z" : "M4 2.5 13 8l-9 5.5z"} /></svg>
          </button>
        </>
      )}
    </div>
  );
}

function focusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false; // Older Safari has no :focus-visible; mouse clicks must not pause the loop.
  }
}
