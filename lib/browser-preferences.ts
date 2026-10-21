"use client";

const MOTION_KEY = "sean-reduce-motion";
let sessionPreference: boolean | undefined;

export function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Another tab changed the setting: drop this tab's copy so the new value wins.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === MOTION_KEY) sessionPreference = undefined;
    callback();
  };
  query.addEventListener("change", callback);
  window.addEventListener("sean-motion-change", callback);
  window.addEventListener("storage", onStorage);
  return () => {
    query.removeEventListener("change", callback);
    window.removeEventListener("sean-motion-change", callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getMotionPreference() {
  if (sessionPreference !== undefined) return sessionPreference;
  try {
    const saved = window.localStorage.getItem(MOTION_KEY);
    if (saved !== null) return saved === "true";
  } catch { /* Browser storage is optional. */ }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setMotionPreference(value: boolean) {
  sessionPreference = value;
  try { window.localStorage.setItem(MOTION_KEY, String(value)); } catch { /* Keep the in-memory preference. */ }
  window.dispatchEvent(new Event("sean-motion-change"));
}

export function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
export const getVisibility = () => document.visibilityState === "visible";
