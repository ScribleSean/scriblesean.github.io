"use client";

import { motion } from "framer-motion";

import { transition } from "@/lib/motion";

const TOOLS = ["Git", "Unity", "Bootstrap", "Bulma", "Oracle SQL Developer"];

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
          I&apos;m Sean Arackal — a computer science student at Worcester Polytechnic Institute,
          based in the Greater Boston area. I ship AI-powered research tools, full-stack web
          systems, and accessibility interfaces, with a focus on measurable outcomes and clean
          engineering.
        </p>

        <div className="mt-10 text-left text-sm leading-relaxed text-zinc-400">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Education
          </h3>
          <p>
            <span className="text-zinc-200">Worcester Polytechnic Institute</span> — Bachelor of
            Science in Computer Science (Aug 2022 – May 2026). GPA{" "}
            <span className="text-zinc-200">3.53</span>.
          </p>
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
