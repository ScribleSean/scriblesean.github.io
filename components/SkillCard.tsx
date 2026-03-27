"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

import type { Skill } from "@/data/skills";

const spring = { type: "spring" as const, stiffness: 300 };

type SkillCardProps = {
  skill: Skill;
};

export function SkillCard({ skill }: SkillCardProps) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;

  const onPointerDown = useCallback(() => {
    setPinned((p) => !p);
  }, []);

  return (
    <motion.article
      layout
      className="group relative min-w-[min(100%,280px)] shrink-0 snap-start rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.4)] backdrop-blur-sm md:min-w-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      transition={spring}
      whileHover={{
        boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 22%, transparent)",
        borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
      }}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={onPointerDown}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-medium text-zinc-100">{skill.name}</h3>
          <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
            {skill.proficiency}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{skill.description}</p>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Projects</p>
              {skill.projects.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600">No linked projects yet.</p>
              ) : (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-300">
                  {skill.projects.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
