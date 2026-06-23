"use client";

import { motion } from "framer-motion";

import { experience } from "@/data/experience";
import { transition } from "@/lib/motion";

export function ExperienceSection() {
  return (
    <section id="experience" className="relative scroll-mt-8 px-6 py-24 md:scroll-mt-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition.enter}
        className="mx-auto max-w-3xl"
      >
        <h2 className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          Experience
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          Contract, part-time, and full-time roles across research software, teaching, and AI
          engineering.
        </p>

        <ol className="space-y-8 border-l border-zinc-800 pl-6">
          {experience.map((job) => (
            <li key={`${job.company}-${job.period}-${job.title}`} className="relative">
              <span
                className="absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
                aria-hidden
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="font-medium text-zinc-100">{job.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {job.company}
                    <span className="text-zinc-600"> · </span>
                    {job.location}
                  </p>
                </div>
                <p className="shrink-0 text-xs uppercase tracking-wider text-zinc-500">
                  {job.period}
                </p>
              </div>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-zinc-500">
                {job.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}
