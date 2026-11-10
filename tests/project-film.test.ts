import assert from "node:assert/strict";
import test from "node:test";
import { loopBlur, loopFocus, loopKey, loopPlays, loopToggle } from "../lib/film-loop";

test("the film loop plays only when motion is allowed and the visitor has not paused it", () => {
  assert.equal(loopPlays({ reducedMotion: false, held: false }), true);
  assert.equal(loopPlays({ reducedMotion: true, held: false }), false);
  assert.equal(loopPlays({ reducedMotion: false, held: "focus" }), false);
  assert.equal(loopPlays({ reducedMotion: false, held: "key" }), false);
  assert.equal(loopPlays({ reducedMotion: true, held: "choice" }), true);
});

test("the pause button flips what the visitor sees, with or without reduced motion", () => {
  assert.equal(loopToggle(false, false), "key");
  assert.equal(loopToggle("key", false), false);
  assert.equal(loopToggle("focus", false), false);
  assert.equal(loopToggle(false, true), "choice");
  assert.equal(loopToggle("choice", true), "key");
  assert.equal(loopToggle("key", true), "choice");
});

test("Space and Enter pause and resume the focused film loop", () => {
  assert.equal(loopKey(" ", false, false), "key");
  assert.equal(loopKey(" ", "key", false), false);
  assert.equal(loopKey("Enter", "focus", false), false);
  assert.equal(loopKey("Enter", "focus", true), "choice");
  assert.equal(loopKey("Tab", false, false), undefined);
});

test("a pause from keyboard focus ends when focus leaves, a key pause or a chosen play does not", () => {
  assert.equal(loopFocus(false), "focus");
  assert.equal(loopFocus("key"), "key");
  assert.equal(loopFocus("choice"), "choice");
  assert.equal(loopBlur("focus"), false);
  assert.equal(loopBlur("key"), "key");
  assert.equal(loopBlur("choice"), "choice");
  assert.equal(loopBlur(loopKey(" ", loopKey(" ", loopFocus(false), false)!, false)!), "key");
});

test("holding Space or Enter does not toggle the film loop on every repeat", () => {
  assert.equal(loopKey(" ", false, false, true), false);
  assert.equal(loopKey("Enter", "key", false, true), "key");
  assert.equal(loopKey("Tab", false, false, true), undefined);
});
