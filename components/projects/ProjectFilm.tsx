"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectFilm as Film } from "@/data/featured-projects";
import styles from "./ProjectPage.module.css";

// The silent loop plays on its own unless the viewer asks for less motion; the button swaps in the full film.
export default function ProjectFilm({ film, name }: { film: Film; name: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (full) {
      element.focus();
      void element.play().catch(() => {});
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) element.pause();
      else void element.play().catch(() => {});
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [full]);

  return (
    <div className={styles.film}>
      {full ? (
        <video key="full" ref={video} src={film.src} poster={film.poster} width={film.width} height={film.height} controls playsInline preload="auto" aria-label={`${name} film. ${film.label}`} />
      ) : (
        <>
          <video key="loop" ref={video} src={film.loop} poster={film.poster} width={film.width} height={film.height} muted loop playsInline preload="metadata" aria-label={film.label} />
          <button type="button" className={styles.filmPlay} onClick={() => setFull(true)}>
            <span aria-hidden="true">▶</span>
            {film.sound ? "Play with sound" : "Play film"}
          </button>
        </>
      )}
    </div>
  );
}
