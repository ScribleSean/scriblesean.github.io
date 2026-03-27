"use client";

import { motion } from "framer-motion";

import type { Project } from "@/data/projects";

const spring = { type: "spring" as const, stiffness: 300 };

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.article
      className="flex h-full flex-col rounded-lg border border-zinc-800/90 bg-zinc-950/50 p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={spring}
      whileHover={{
        y: -6,
        boxShadow: "0 0 28px color-mix(in srgb, var(--accent) 18%, transparent)",
        borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
      }}
    >
      <h3 className="text-lg font-medium text-zinc-100">{project.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded border border-zinc-700/80 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-400"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline-offset-4 hover:underline"
          >
            GitHub
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 underline-offset-4 hover:underline"
          >
            Live demo
          </a>
        )}
      </div>
    </motion.article>
  );
}
