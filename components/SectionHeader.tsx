"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { transition } from "@/lib/motion";

type SectionHeaderProps = {
  kicker: string;
  title: ReactNode;
  description?: string;
};

export function SectionHeader({ kicker, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      className="mb-12 max-w-3xl"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={transition.enter}
    >
      <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[var(--accent)]">
        {kicker}
      </p>
      <h2 className="font-serif text-4xl leading-tight text-[var(--ink)] md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-[var(--muted)]">{description}</p>
      ) : null}
    </motion.div>
  );
}
