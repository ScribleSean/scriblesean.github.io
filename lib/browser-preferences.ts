"use client";

export function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  window.addEventListener("sean-motion-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    query.removeEventListener("change", callback);
    window.removeEventListener("sean-motion-change", callback);
    window.removeEventListener("storage", callback);
  };
}

let sessionPreference: boolean | undefined;
export function getMotionPreference() {
  if (sessionPreference !== undefined) return sessionPreference;
  try {
    const saved = window.localStorage.getItem("sean-reduce-motion");
    if (saved !== null) return saved === "true";
  } catch { /* Browser storage is optional. */ }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setMotionPreference(value: boolean) {
  sessionPreference = value;
  try { window.localStorage.setItem("sean-reduce-motion", String(value)); } catch { /* Keep the in-memory preference. */ }
  window.dispatchEvent(new Event("sean-motion-change"));
}

export function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
export const getVisibility = () => document.visibilityState === "visible";
