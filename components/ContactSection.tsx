"use client";

import { motion } from "framer-motion";

import { transition } from "@/lib/motion";
import { site } from "@/lib/site";

const social = [
  { label: "GitHub", handle: site.githubHandle, href: site.github },
  { label: "LinkedIn", handle: site.linkedinHandle, href: site.linkedin },
];

export function ContactSection() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative scroll-mt-20 px-5 pb-10 pt-24 md:px-8 md:pt-32"
    >
      <motion.div
        className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/80 px-6 py-16 text-center backdrop-blur-xl md:px-12 md:py-24"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition.enter}
      >
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">
          Contact
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-[var(--ink)] md:text-6xl">
          Hiring for AI, vision, or full-stack?{" "}
          <span className="italic text-[var(--accent-strong)]">Let&apos;s talk.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[var(--muted)]">
          {site.location}. Open to full-time software engineering roles after May 2026.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm text-[var(--background)] transition hover:bg-white"
          >
            {site.email}
          </a>
          <a
            href={site.resume}
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]"
          >
            Résumé
          </a>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--muted)]">
          {social.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[var(--ink)]"
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--faint)]">
                  {s.label}
                </span>
                {s.handle}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${site.schoolEmail}`} className="transition hover:text-[var(--ink)]">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--faint)]">
                School
              </span>
              {site.schoolEmail}
            </a>
          </li>
        </ul>
      </motion.div>

      <p className="mx-auto mt-8 max-w-6xl px-2 text-center text-xs text-[var(--faint)]">
        © {year} {site.name}. Cinematic 3D inspired by Meng To / ThreeUI.
      </p>
    </footer>
  );
}
