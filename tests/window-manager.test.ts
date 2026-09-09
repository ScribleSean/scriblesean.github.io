import assert from "node:assert/strict";
import test from "node:test";
import { createWindowState, getViewportScale, windowReducer } from "../lib/window-manager";

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

  assert.equal(moved.messages.x, 86);
  assert.equal(moved.messages.y, viewport.height - moved.messages.height - 12);
  assert.equal(resized.messages.width, viewport.width - 98);
  assert.equal(resized.messages.height, viewport.height - 58);
});

test("a closed app keeps its mounted instance when the dock restores it", () => {
  const open = windowReducer(createWindowState(), { type: "open", app: "messages", viewport });
  const closed = windowReducer(open, { type: "close", app: "messages" });
  const restored = windowReducer(closed, { type: "open", app: "messages", viewport });

  assert.equal(closed.messages.mounted, true);
  assert.equal(restored.messages.status, "open");
  assert.equal(restored.messages.x, open.messages.x);
  assert.equal(restored.messages.y, open.messages.y);
});

test("pointer deltas use the logical desktop coordinate system after CRT scaling", () => {
  const scale = getViewportScale({ clientWidth: 1000, clientHeight: 720, renderedWidth: 500, renderedHeight: 360 });
  const fallback = getViewportScale({ clientWidth: 1000, clientHeight: 720, renderedWidth: 0, renderedHeight: 0 });

  assert.deepEqual(scale, { x: 2, y: 2 });
  assert.deepEqual(fallback, { x: 1, y: 1 });
});


test("maximized apps stay below the top bar and beside the dock after reflow", () => {
  for (const app of ["chrome", "files", "messages", "settings", "photos"] as const) {
    const open = windowReducer(createWindowState(), { type: "open", app, viewport });
    const max = windowReducer(open, { type: "toggle-maximize", app, viewport });
    assert.ok(max[app].x >= 86);
    assert.ok(max[app].y >= 46);
    const narrow = windowReducer(max, { type: "reflow", viewport: { width: 600, height: 720 } });
    assert.ok(narrow[app].y >= 46);
    assert.ok(narrow[app].y + narrow[app].height <= 644);
  }
});
