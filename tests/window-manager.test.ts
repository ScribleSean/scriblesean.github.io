import assert from "node:assert/strict";
import test from "node:test";
import { createWindowState, windowReducer } from "../lib/window-manager";

const viewport = { width: 1000, height: 720 };

test("opening an app brings it forward and keeps its frame in the desktop", () => {
  const first = windowReducer(createWindowState(), { type: "open", app: "chrome", viewport });
  const second = windowReducer(first, { type: "open", app: "messages", viewport });

  assert.equal(second.chrome.status, "open");
  assert.equal(second.messages.status, "open");
  assert.ok(second.messages.z > second.chrome.z);
  assert.ok(second.chrome.x >= 12 && second.chrome.y >= 12);
  assert.ok(second.chrome.x + second.chrome.width <= viewport.width - 12);
});

test("maximizing remembers a usable frame and restores it", () => {
  const open = windowReducer(createWindowState(), { type: "open", app: "files", viewport });
  const maximized = windowReducer(open, { type: "toggle-maximize", app: "files", viewport });
  const restored = windowReducer(maximized, { type: "toggle-maximize", app: "files", viewport });

  assert.equal(maximized.files.status, "maximized");
  assert.equal(restored.files.status, "open");
  assert.equal(restored.files.x, open.files.x);
  assert.equal(restored.files.y, open.files.y);
  assert.equal(restored.files.width, open.files.width);
  assert.equal(restored.files.height, open.files.height);
});

test("moves and resizes clamp to the visible desktop", () => {
  const open = windowReducer(createWindowState(), { type: "open", app: "messages", viewport });
  const moved = windowReducer(open, { type: "move", app: "messages", x: -500, y: 9999, viewport });
  const resized = windowReducer(moved, { type: "resize", app: "messages", width: 9000, height: 9000, viewport });

  assert.equal(moved.messages.x, 12);
  assert.equal(moved.messages.y, viewport.height - moved.messages.height - 12);
  assert.equal(resized.messages.width, viewport.width - 24);
  assert.equal(resized.messages.height, viewport.height - 24);
});
