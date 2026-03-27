"use client";

import { motion } from "framer-motion";

import { TypingAnimation } from "@/components/TypingAnimation";
import { easeFloat, easeSmooth, transition } from "@/lib/motion";

const logo = "{ Sean Arackal }";
const chars = logo.split("");

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-20"
    >
      <div className="mb-10 flex w-full max-w-full flex-nowrap items-center justify-center gap-x-[0.08em] whitespace-nowrap px-4 text-center font-medium leading-none text-[var(--accent)] [font-size:clamp(0.75rem,calc(0.2rem+3.6vw),4.75rem)] sm:px-6">
        {chars.map((ch, i) => (
          <motion.span
            key={`hero-char-${i}`}
            className="inline-block shrink-0"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...transition.heroChar,
              delay: i * 0.058,
            }}
          >
            {ch === " " ? "\u00a0" : ch}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="mb-16 w-full max-w-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition.heroSub, delay: 0.4 }}
      >
        <TypingAnimation />
      </motion.div>

      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-2 text-zinc-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05, duration: 1.05, ease: easeSmooth }}
        aria-hidden
      >
        <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          className="text-[var(--accent)]"
          animate={{ y: [0, 6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: easeFloat,
          }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
