import type { Transition } from "framer-motion";

/**
 * Soft ease-in-out — slow start/end, gentle glide (no snap).
 * Cubic bezier approximates a smooth “flow” vs. Material’s sharper ease-out.
 */
export const easeSmooth: [number, number, number, number] = [0.45, 0.02, 0.35, 1];

/** Symmetric ease-in-out — even feel on repeating loops (e.g. scroll hint). */
export const easeFloat: [number, number, number, number] = [0.42, 0, 0.58, 1];

export const transition: {
  enter: Transition;
  heroChar: Transition;
  heroSub: Transition;
  expand: Transition;
  hover: Transition;
  layout: Transition;
  /** In-view + hover on project cards */
  card: Transition;
} = {
  enter: {
    type: "tween",
    duration: 1.05,
    ease: easeSmooth,
  },
  heroChar: {
    type: "tween",
    duration: 0.85,
    ease: easeSmooth,
  },
  heroSub: {
    type: "tween",
    duration: 1.05,
    ease: easeSmooth,
  },
  expand: {
    type: "tween",
    duration: 0.58,
    ease: easeSmooth,
  },
  hover: {
    type: "tween",
    duration: 0.52,
    ease: easeSmooth,
  },
  layout: {
    type: "tween",
    duration: 0.65,
    ease: easeSmooth,
  },
  card: {
    type: "tween",
    duration: 0.78,
    ease: easeSmooth,
  },
};
