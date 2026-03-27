"use client";

import { motion } from "framer-motion";

import { transition } from "@/lib/motion";

const TOOLS = ["Git", "Unity", "Oracle SQL Developer", "Bootstrap", "Bulma"];

export function AboutSection() {
  return (
    <section className="relative px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition.enter}
        className="mx-auto max-w-3xl"
      >
        <h2 className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          About
        </h2>
        <p className="text-center leading-relaxed text-zinc-400">
          I&apos;m Sean Arackal — computer science student at Worcester Polytechnic Institute (WPI),
          based in the Greater Boston area. I build full-stack web apps, research tooling, and
          accessibility-focused interfaces, with an emphasis on clear architecture and measurable
          impact.
        </p>

        <div className="mt-10 space-y-6 text-left text-sm leading-relaxed text-zinc-400">
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Education
            </h3>
            <p>
              <span className="text-zinc-200">Worcester Polytechnic Institute</span> — Bachelor of
              Science in Computer Science, expected May 2026. GPA 3.62; Dean&apos;s List for three
              semesters.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Experience
            </h3>
            <ul className="list-inside list-disc space-y-2 text-zinc-400">
              <li>
                <span className="text-zinc-300">Peer Learning Assistant</span>, WPI Computer
                Science — ungrading-style support, office hours, and reviews for 300+ students
                (Aug 2024–present).
              </li>
              <li>
                <span className="text-zinc-300">Lead Instructor</span>, iD Tech, Boston — led 18+
                instructors and programs across New England for 200+ students (Jun 2023–Aug 2025).
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Leadership
            </h3>
            <p>
              <span className="text-zinc-300">Events Coordinator</span>, Society of Asian
              Scientists and Engineers (WPI) — conference travel and cultural/career programming
              for 100+ members (Jan 2024–Jan 2025).
            </p>
          </div>
        </div>

        <div className="mt-10">
          <p className="mb-3 text-center text-xs uppercase tracking-wider text-zinc-500">
            Also used regularly
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {TOOLS.map((item) => (
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
