"use client";

import { motion } from "framer-motion";

import { SkillCard } from "@/components/SkillCard";
import { skills } from "@/data/skills";

const spring = { type: "spring" as const, stiffness: 300 };

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative scroll-mt-8 px-6 py-24 md:scroll-mt-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={spring}
      >
        <h2 className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          Skills & languages
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          Click or hover cards to see linked projects. Replace copy in{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[var(--accent)]">
            data/skills.ts
          </code>
          .
        </p>

        <div className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:snap-none md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
