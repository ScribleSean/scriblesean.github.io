"use client";

import { motion } from "framer-motion";

import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { transition } from "@/lib/motion";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-8 px-6 py-24 md:scroll-mt-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition.enter}
      >
        <h2 className="mb-4 text-center text-sm uppercase tracking-[0.35em] text-zinc-500">
          Projects
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          Selected work — swap in your repos and demos via{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[var(--accent)]">
            data/projects.ts
          </code>
          .
        </p>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
