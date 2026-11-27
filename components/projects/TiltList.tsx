"use client";

import { useRef, type ReactNode } from "react";

// Cards lean a few degrees toward the cursor. Only with a mouse or trackpad, and never when less motion is asked for.
export default function TiltList({ className, children }: { className: string; children: ReactNode }) {
  const list = useRef<HTMLOListElement>(null);
  const allowed = () => window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  return (
    <ol ref={list} className={className}
      onPointerMove={(event) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
        if (!card || !allowed()) return;
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5;
        const y = (event.clientY - box.top) / box.height - .5;
        card.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
      }}
      onPointerOut={(event) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
        if (card && !card.contains(event.relatedTarget as Node | null)) { card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); }
      }}>
      {children}
    </ol>
  );
}
