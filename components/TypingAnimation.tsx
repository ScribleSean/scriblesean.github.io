"use client";

import { useEffect, useState } from "react";

const PREFIX = "I'm a developer who builds ";
const SUFFIX = " projects.";
const WORDS = [
  "TypeScript",
  "React",
  "Next.js",
  "full-stack",
  "Python",
  "AI/ML",
  "Node.js",
];

const TYPING_MS = 55;
const PAUSE_END_MS = 2200;
const PAUSE_BETWEEN_MS = 400;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function TypingAnimation() {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loop() {
      const word = WORDS[wordIndex % WORDS.length];

      setDisplay("");
      for (let i = 1; i <= word.length; i++) {
        if (cancelled) return;
        await sleep(TYPING_MS);
        if (cancelled) return;
        setDisplay(word.slice(0, i));
      }

      await sleep(PAUSE_END_MS);
      if (cancelled) return;

      for (let i = word.length - 1; i >= 0; i--) {
        if (cancelled) return;
        await sleep(TYPING_MS / 2);
        if (cancelled) return;
        setDisplay(word.slice(0, i));
      }

      await sleep(PAUSE_BETWEEN_MS);
      if (cancelled) return;
      setWordIndex((w) => (w + 1) % WORDS.length);
    }

    loop();

    return () => {
      cancelled = true;
    };
  }, [wordIndex]);

  return (
    <p className="mx-auto max-w-2xl text-center text-sm text-zinc-400 md:text-base">
      <span className="text-zinc-500">{PREFIX}</span>
      <span className="text-[var(--accent)]">{display}</span>
      <span className="inline-block w-2 animate-pulse text-[var(--accent)]">▍</span>
      <span className="text-zinc-500">{SUFFIX}</span>
    </p>
  );
}
