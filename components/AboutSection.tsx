"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/components/SectionHeader";
import { transition } from "@/lib/motion";
import { site } from "@/lib/site";

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="About"
          title={
            <>
              Built in labs, classrooms,{" "}
              <span className="italic text-[var(--accent-strong)]">and production.</span>
            </>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            className="panel rounded-3xl p-6 md:p-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={transition.enter}
          >
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              I&apos;m {site.name} — a computer science student at {site.school}, based
              in the Greater Boston area. I ship AI-powered research tools, full-stack
              web systems, and accessibility interfaces, with a focus on measurable
              outcomes and clean engineering.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              Recent work sits at the overlap of computer vision and product: making
              models inspectable, faster to review, and usable by people who are not
              ML engineers.
            </p>
          </motion.div>

          <motion.div
            className="panel rounded-3xl p-6 md:p-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...transition.enter, delay: 0.08 }}
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
              Education
            </p>
            <h3 className="mt-4 font-serif text-3xl text-[var(--ink)]">{site.school}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {site.degree}
              <span className="text-[var(--faint)]"> · GPA {site.gpa}</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--faint)]">
              {site.dates} · Worcester, MA
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
