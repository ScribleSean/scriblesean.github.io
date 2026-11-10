// false: plays unless the visitor asks for less motion. "focus": paused while the loop has keyboard focus.
// "key": paused until the visitor plays it again. "choice": played on purpose, even with less motion asked for.
export type LoopHold = false | "focus" | "key" | "choice";

export function loopPlays({ reducedMotion, held }: { reducedMotion: boolean; held: LoopHold }) {
  return held === "choice" || (!reducedMotion && !held);
}

// The pause button and Space or Enter on the loop flip whatever the visitor currently sees.
export function loopToggle(held: LoopHold, reducedMotion: boolean): LoopHold {
  if (loopPlays({ reducedMotion, held })) return "key";
  return reducedMotion ? "choice" : false;
}

// Returns the new hold for a key that toggles the loop, or undefined for any other key.
// A held-down key repeats; only the first press toggles.
export function loopKey(key: string, held: LoopHold, reducedMotion: boolean, repeat = false): LoopHold | undefined {
  if (key !== " " && key !== "Enter") return undefined;
  if (repeat) return held;
  return loopToggle(held, reducedMotion);
}

// Keyboard focus pauses the loop, unless the visitor already paused or played it on purpose.
export function loopFocus(held: LoopHold): LoopHold {
  return held || "focus";
}

export function loopBlur(held: LoopHold): LoopHold {
  return held === "focus" ? false : held;
}
