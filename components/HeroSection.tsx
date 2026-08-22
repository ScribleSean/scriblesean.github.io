"use client";

import { motion } from "framer-motion";

import { stats } from "@/data/stats";
import { transition } from "@/lib/motion";
import { site } from "@/lib/site";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[var(--background)] to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p
          className="mb-5 text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.heroSub, delay: 0.1 }}
        >
          {site.role} · {site.location}
        </motion.p>

        <motion.h1
          className="max-w-4xl font-serif text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.9] tracking-tight text-[var(--ink)] [text-shadow:0_10px_50px_rgba(12,9,8,0.65)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.heroChar, delay: 0.18 }}
        >
          {site.name.split(" ")[0]}
          <span className="italic text-[var(--accent-strong)]">
            {" "}
            {site.name.split(" ")[1]}
          </span>
        </motion.h1>

        <motion.p
          className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)] md:text-xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.heroSub, delay: 0.32 }}
        >
          {site.headline} {site.summary}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.heroSub, delay: 0.42 }}
        >
          <a
            href={`mailto:${site.email}`}
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm text-[var(--background)] transition hover:bg-white"
          >
            Get in touch
          </a>
          <a
            href={site.resume}
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Download résumé
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            LinkedIn
          </a>
        </motion.div>

        <motion.dl
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.enter, delay: 0.55 }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--background)]/80 px-5 py-5 backdrop-blur-md"
            >
              <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
                {stat.label}
              </dt>
              <dd className="mt-2 font-serif text-3xl text-[var(--accent-strong)] md:text-4xl">
                {stat.value}
              </dd>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {stat.detail}
              </p>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
