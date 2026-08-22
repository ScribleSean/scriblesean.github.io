"use client";

import { motion } from "framer-motion";

import { SectionHeader } from "@/components/SectionHeader";
import { projects } from "@/data/projects";
import { transition } from "@/lib/motion";

export function ProjectsSection() {
  return (
    <section id="work" className="relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="Selected work"
          title={
            <>
              Systems with a number{" "}
              <span className="italic text-[var(--accent-strong)]">attached.</span>
            </>
          }
          description="Shipped research tooling, vision models, accessibility interfaces, and healthcare software — each with a measurable outcome."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project, i) => (
            <motion.article
              key={project.name}
              className="panel group flex flex-col rounded-3xl p-6 md:p-8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...transition.card, delay: i * 0.06 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl text-[var(--ink)] md:text-2xl">{project.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--faint)]">
                    {project.role}
                    {project.role && project.period ? " · " : null}
                    {project.period}
                  </p>
                </div>
                {project.metric ? (
                  <p className="shrink-0 text-right">
                    <span className="block font-serif text-3xl text-[var(--accent-strong)]">
                      {project.metric.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
                      {project.metric.label}
                    </span>
                  </p>
                ) : null}
              </div>

              <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {project.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)]"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex gap-5 text-sm">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                  >
                    Live →
                  </a>
                ) : null}
                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    GitHub →
                  </a>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
