import test from "node:test";
import assert from "node:assert/strict";
import { initialSceneState, sceneReducer, shouldPlayGame } from "../lib/scene-state";

test("hover cannot skip the approach or unlock an entered desktop", () => {
  assert.equal(sceneReducer(initialSceneState, { type: "hover", over: true }).camera, "room");
  const desk = sceneReducer(initialSceneState, { type: "approach" });
  const focus = sceneReducer(desk, { type: "hover", over: true });
  assert.equal(focus.camera, "focus");
  assert.equal(sceneReducer(focus, { type: "hover", over: false }).camera, "desk");
  const entered = sceneReducer(focus, { type: "enter", mobile: false });
  assert.equal(sceneReducer(entered, { type: "hover", over: false }).camera, "entered");
  assert.equal(entered.screen, "desktop");
});

test("video pauses on desktop, hidden document and mobile; restore preserves entered view", () => {
  assert.equal(shouldPlayGame(initialSceneState, true), true);
  const desktop = sceneReducer(initialSceneState, { type: "enter", mobile: false });
  assert.equal(shouldPlayGame(desktop, true), false);
  const restored = sceneReducer(desktop, { type: "restore-game" });
  assert.equal(restored.camera, "entered");
  assert.equal(shouldPlayGame(restored, true), true);
  assert.equal(shouldPlayGame(restored, false), false);
  const mobile = sceneReducer(initialSceneState, { type: "enter", mobile: true });
  assert.equal(shouldPlayGame(mobile, true), false);
});

test("back returns to the original wide view and contact enters directly", () => {
  const contact = sceneReducer(initialSceneState, { type: "contact", mobile: false });
  assert.equal(contact.screen, "desktop");
  assert.deepEqual(sceneReducer(contact, { type: "back" }), initialSceneState);
});
