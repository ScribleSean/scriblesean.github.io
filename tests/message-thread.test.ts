import assert from "node:assert/strict";
import test from "node:test";

import { MAX_CONVERSATION_LENGTH, MAX_MESSAGE_COUNT, MAX_MESSAGE_LENGTH, type Message } from "../lib/message-transport";
import {
  COMPOSER_ID,
  createMessageId,
  getPendingMessages,
  getThreadView,
  initialThreadState,
  MAILTO_BODY_LIMIT,
  makeMailtoHref,
  threadReducer,
  type ThreadAction,
  type ThreadState,
} from "../lib/message-thread";

let counter = 0;
const draft = (): Message => ({ id: `m${++counter}`, text: "", createdAt: "2026-10-21T12:00:00.000Z" });
const run = (state: ThreadState, ...actions: ThreadAction[]) => actions.reduce(threadReducer, state);
const type = (text: string): ThreadAction => ({ type: "compose", text });
const commit = (): ThreadAction => ({ type: "commit", draft: draft() });

test("Send stays available after Enter moves the text into a bubble (finding 1)", () => {
  const state = run(initialThreadState, type("Reach me at a@b.com"), commit());
  const view = getThreadView(state);

  assert.equal(state.composerText, "");
  assert.equal(state.messages.length, 1);
  assert.equal(view.composerEmpty, true);
  assert.equal(view.showSend, true);
  assert.equal(view.canSend, true);
});

test("Send hides once everything has been delivered", () => {
  let state = run(initialThreadState, type("Hi"), commit(), { type: "submit-start", draft: draft() });
  state = run(state, { type: "submit-success", ids: getPendingMessages(state).map((m) => m.id) });

  assert.equal(getThreadView(state).showSend, false);
  assert.equal(state.statusMessage, "Sent to Sean.");
});

test("reaching the message or character limit reports an error instead of throwing (finding 2)", () => {
  let state = initialThreadState;
  for (let i = 0; i < MAX_MESSAGE_COUNT; i++) state = run(state, type(`message ${i}`), commit());
  assert.equal(state.messages.length, MAX_MESSAGE_COUNT);

  state = run(state, type("one too many"));
  const view = getThreadView(state);
  assert.match(view.limitError ?? "", /up to 40 messages/);
  assert.equal(view.canCommit, false);
  assert.equal(view.canSend, false);
  assert.doesNotThrow(() => makeMailtoHref("sean@example.com", view.pending));

  let long = initialThreadState;
  for (let i = 0; i < MAX_CONVERSATION_LENGTH / MAX_MESSAGE_LENGTH; i++) {
    long = run(long, type("x".repeat(MAX_MESSAGE_LENGTH)), commit());
  }
  long = run(long, type("y"));
  assert.match(getThreadView(long).limitError ?? "", /20,000 characters/);
  assert.doesNotThrow(() => makeMailtoHref("sean@example.com", getThreadView(long).pending));
});

test("submitting gives the composer text its own id, so later bubbles never share one (finding 3)", () => {
  let state = run(initialThreadState, type("first"), { type: "submit-start", draft: draft() });
  state = run(state, { type: "submit-success", ids: getPendingMessages(state).map((m) => m.id) });
  state = run(state, type("second"), { type: "submit-start", draft: draft() });

  const ids = state.messages.map((message) => message.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(!ids.includes(COMPOSER_ID));
});

test("a second send only includes messages Sean has not received (finding 28)", () => {
  let state = run(initialThreadState, type("first"), commit(), { type: "submit-start", draft: draft() });
  state = run(state, { type: "submit-success", ids: getPendingMessages(state).map((m) => m.id) });
  state = run(state, type("second"), commit());

  assert.deepEqual(getPendingMessages(state).map((m) => m.text), ["second"]);
  const sentId = state.messages[0].id;
  assert.equal(run(state, { type: "edit", id: sentId, draft: draft() }), state);
  assert.equal(run(state, { type: "delete", id: sentId }), state);
});

test("Edit keeps a half-typed draft instead of overwriting it (finding 15)", () => {
  let state = run(initialThreadState, type("earlier"), commit(), type("half-typed"));
  state = run(state, { type: "edit", id: state.messages[0].id, draft: draft() });

  assert.deepEqual(state.messages.map((m) => m.text), ["earlier", "half-typed"]);
  assert.equal(state.composerText, "earlier");
  assert.equal(state.editingMessageId, state.messages[0].id);
});

test("clearing the composer while editing cancels the edit (finding 26)", () => {
  let state = run(initialThreadState, type("keep me"), commit());
  state = run(state, { type: "edit", id: state.messages[0].id, draft: draft() }, type(""));
  assert.equal(state.editingMessageId, null);

  state = run(state, type("new message"), commit());
  assert.deepEqual(state.messages.map((m) => m.text), ["keep me", "new message"]);
});

test("Escape-style cancel restores the original bubble", () => {
  let state = run(initialThreadState, type("original"), commit());
  state = run(state, { type: "edit", id: state.messages[0].id, draft: draft() }, type("changed"), { type: "cancel-edit" });
  assert.deepEqual(state.messages.map((m) => m.text), ["original"]);
  assert.equal(state.composerText, "");
});

test("nothing can change while a send is in flight", () => {
  const state = run(initialThreadState, type("hi"), commit(), { type: "submit-start", draft: draft() });
  assert.equal(run(state, type("more")), state);
  assert.equal(run(state, { type: "delete", id: state.messages[0].id }), state);
});

test("a failed send keeps every message unsent and offers email", () => {
  let state = run(initialThreadState, type("hi"), { type: "submit-start", draft: draft() });
  state = run(state, { type: "submit-error", message: "down", showEmailFallback: true });
  assert.equal(getPendingMessages(state).length, 1);
  assert.equal(getThreadView(state).canSend, true);
  assert.equal(state.showEmailFallback, true);
});

test("the email fallback link stays short enough for Outlook (finding 29)", () => {
  const messages = Array.from({ length: 10 }, (_, i) => ({ ...draft(), text: `${i}`.repeat(1_500) }));
  const href = makeMailtoHref("sean@example.com", messages);
  const body = decodeURIComponent(href.split("&body=")[1]);
  assert.ok(body.length < MAILTO_BODY_LIMIT + 100);
  assert.match(body, /Trimmed/);
  assert.ok(href.startsWith("mailto:sean@example.com?subject="));
});

test("message ids work without crypto.randomUUID (finding 31)", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });
  try {
    const a = createMessageId();
    const b = createMessageId();
    assert.ok(a && b && a !== b);
  } finally {
    if (original) Object.defineProperty(globalThis, "crypto", original);
  }
});
