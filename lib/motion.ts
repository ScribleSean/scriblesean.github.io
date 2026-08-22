import type { Transition } from "framer-motion";

export const easeSmooth: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeFloat: [number, number, number, number] = [0.42, 0, 0.58, 1];

export const transition: {
  enter: Transition;
  heroChar: Transition;
  heroSub: Transition;
  expand: Transition;
  hover: Transition;
  layout: Transition;
  card: Transition;
} = {
  enter: { type: "tween", duration: 0.8, ease: easeSmooth },
  heroChar: { type: "tween", duration: 0.9, ease: easeSmooth },
  heroSub: { type: "tween", duration: 0.9, ease: easeSmooth },
  expand: { type: "tween", duration: 0.45, ease: easeSmooth },
  hover: { type: "tween", duration: 0.35, ease: easeSmooth },
  layout: { type: "tween", duration: 0.5, ease: easeSmooth },
  card: { type: "tween", duration: 0.6, ease: easeSmooth },
};
