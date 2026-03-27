"use client";

import { motion } from "framer-motion";

import { TypingAnimation } from "@/components/TypingAnimation";

const logo = "{ Sean Arackal }";
const chars = logo.split("");

const spring = { type: "spring" as const, stiffness: 300 };

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-20"
    >
      <div className="mb-10 flex max-w-[min(100%,42rem)] flex-wrap select-none items-center justify-center gap-x-0.5 gap-y-1 text-center text-3xl font-medium leading-tight text-[var(--accent)] sm:text-4xl md:text-5xl lg:text-7xl">
        {chars.map((ch, i) => (
          <motion.span
            key={`hero-char-${i}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            {ch === " " ? "\u00a0" : ch}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="mb-16 w-full max-w-3xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.45 }}
      >
        <TypingAnimation />
      </motion.div>

      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-2 text-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        aria-hidden
      >
        <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          className="text-[var(--accent)]"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
