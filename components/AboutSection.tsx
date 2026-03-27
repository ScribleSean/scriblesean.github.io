"use client";

import { motion } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 300 };

const OTHER = ["Java", "C++", "SQL", "Git", "Linux"];

export function AboutSection() {
  return (
    <section className="relative px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={spring}
        className="mx-auto max-w-3xl"
      >
        <h2 className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          About & other skills
        </h2>
        <p className="text-center leading-relaxed text-zinc-400">
          I&apos;m a developer who enjoys shipping useful software, learning new stacks, and
          polishing details. This bio is placeholder text — edit this section in{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[var(--accent)]">
            AboutSection.tsx
          </code>{" "}
          to tell your story.
        </p>
        <div className="mt-10">
          <p className="mb-3 text-center text-xs uppercase tracking-wider text-zinc-500">
            Also familiar with
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {OTHER.map((item) => (
              <li
                key={item}
                className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-sm text-zinc-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
