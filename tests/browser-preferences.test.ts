import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import {
  getMotionPreference, getVisibility, setMotionPreference,
  subscribeMotion, subscribeVisibility,
} from "../lib/browser-preferences";

const motionKey = "sean-reduce-motion";

function browser(t: TestContext) {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  const media = Object.assign(new EventTarget(), { matches: false });
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const window = Object.assign(new EventTarget(), {
    localStorage,
    matchMedia: (query: string) => {
      assert.equal(query, "(prefers-reduced-motion: reduce)");
      return media;
    },
  });
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  Object.defineProperty(globalThis, "window", { configurable: true, value: window });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  const storage = (key: string | null) => {
    window.dispatchEvent(Object.assign(new Event("storage"), { key }));
  };
  // Reset the module's session cache through its public cross-tab interface.
  const reset = () => {
    const unsubscribe = subscribeMotion(() => {});
    storage(null);
    unsubscribe();
  };
  const cleanups: (() => void)[] = [];
  reset();
  t.after(() => {
    for (const cleanup of cleanups) cleanup();
    reset();
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    else Reflect.deleteProperty(globalThis, "window");
    if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor);
    else Reflect.deleteProperty(globalThis, "document");
  });
  return { window, document, media, values, localStorage, storage, cleanup: (fn: () => void) => cleanups.push(fn) };
}

test("motion follows the system when no preference is saved", (t) => {
  const { media } = browser(t);
  assert.equal(getMotionPreference(), false);
  media.matches = true;
  assert.equal(getMotionPreference(), true);
});

test("explicit true and false preferences override the system", (t) => {
  const { media, values } = browser(t);
  values.set(motionKey, "true");
  assert.equal(getMotionPreference(), true);
  media.matches = true;
  values.set(motionKey, "false");
  assert.equal(getMotionPreference(), false);
});

test("unavailable storage falls back to the system", (t) => {
  const { localStorage, media } = browser(t);
  localStorage.getItem = () => { throw new Error("storage denied"); };
  media.matches = true;
  assert.equal(getMotionPreference(), true);
  media.matches = false;
  assert.equal(getMotionPreference(), false);
});

test("setting a preference persists it and notifies after the value changes", (t) => {
  const { values, cleanup } = browser(t);
  const observed: boolean[] = [];
  const unsubscribe = subscribeMotion(() => observed.push(getMotionPreference()));
  cleanup(unsubscribe);
  setMotionPreference(true);
  assert.equal(values.get(motionKey), "true");
  setMotionPreference(false);
  assert.equal(values.get(motionKey), "false");
  assert.deepEqual(observed, [true, false]);
});

test("failed writes retain the session preference and still notify", (t) => {
  const { localStorage, media, cleanup } = browser(t);
  localStorage.setItem = () => { throw new Error("quota exceeded"); };
  const observed: boolean[] = [];
  const unsubscribe = subscribeMotion(() => observed.push(getMotionPreference()));
  cleanup(unsubscribe);
  setMotionPreference(true);
  assert.equal(getMotionPreference(), true);
  media.matches = true;
  setMotionPreference(false);
  assert.equal(getMotionPreference(), false);
  assert.deepEqual(observed, [true, false]);
});

test("cross-tab changes and storage clearing invalidate the session preference", (t) => {
  const { values, media, storage, cleanup } = browser(t);
  const unsubscribe = subscribeMotion(() => {});
  cleanup(unsubscribe);
  setMotionPreference(true);
  values.set(motionKey, "false");
  storage("unrelated-setting");
  assert.equal(getMotionPreference(), true);
  storage(motionKey);
  assert.equal(getMotionPreference(), false);
  setMotionPreference(true);
  values.clear();
  media.matches = false;
  storage(null);
  assert.equal(getMotionPreference(), false);
});

test("motion subscriptions receive system events and remove every listener", (t) => {
  const { media, window, storage } = browser(t);
  let calls = 0;
  const unsubscribe = subscribeMotion(() => { calls++; });
  media.dispatchEvent(new Event("change"));
  window.dispatchEvent(new Event("sean-motion-change"));
  storage(motionKey);
  assert.equal(calls, 3);
  unsubscribe();
  media.dispatchEvent(new Event("change"));
  window.dispatchEvent(new Event("sean-motion-change"));
  storage(motionKey);
  assert.equal(calls, 3);
});

test("visibility reads current state and subscriptions clean up", (t) => {
  const { document } = browser(t);
  const observed: boolean[] = [];
  assert.equal(getVisibility(), true);
  const unsubscribe = subscribeVisibility(() => observed.push(getVisibility()));
  document.visibilityState = "hidden";
  document.dispatchEvent(new Event("visibilitychange"));
  document.visibilityState = "visible";
  document.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(observed, [false, true]);
  unsubscribe();
  document.visibilityState = "hidden";
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(getVisibility(), false);
  assert.deepEqual(observed, [false, true]);
});
