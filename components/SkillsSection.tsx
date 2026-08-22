"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/components/SectionHeader";
import { skillGroups } from "@/data/skills";
import { transition } from "@/lib/motion";

export function SkillsSection() {
  return (
    <section id="skills" className="relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Capabilities"
          title={
            <>
              A stack that survives{" "}
              <span className="italic text-[var(--accent-strong)]">production.</span>
            </>
          }
          description="From LLM pipelines and pose models to React, Postgres, and AWS — used on shipped systems, not just coursework."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.label}
              className="panel rounded-3xl p-6"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...transition.card, delay: i * 0.05 }}
            >
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
                {group.label}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-[var(--ink)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
