import assert from "node:assert/strict";
import test from "node:test";

import {
  createMessageTransport,
  formatConversation,
  MessageDeliveryError,
  MessageDeliveryUnavailableError,
  MessageSubmission,
} from "../lib/message-transport";

const submission: MessageSubmission = {
  messages: [
    {
      id: "first",
      text: "  Could we talk about your <strong>work</strong>?  ",
      createdAt: "2026-09-08T14:00:00.000Z",
    },
    {
      id: "second",
      text: "You can reach me at example@example.com.",
      createdAt: "2026-09-08T14:01:00.000Z",
    },
  ],
  submittedAt: "2026-09-08T14:02:00.000Z",
};

test("formats only explicit visitor messages as plain conversation text", () => {
  const conversation = formatConversation(submission);

  assert.match(conversation, /Could we talk about your <strong>work<\/strong>\?/);
  assert.match(conversation, /example@example\.com/);
  assert.doesNotMatch(conversation, /Thank you for visiting/);
  assert.doesNotMatch(conversation, /  Could/);
});

test("rejects an empty conversation before attempting delivery", async () => {
  const transport = createMessageTransport("https://example.test/form", async () => {
    throw new Error("should not be called");
  });

  await assert.rejects(
    () => transport({ messages: [], submittedAt: submission.submittedAt }),
    MessageDeliveryError,
  );
});

test("requires a configured endpoint and does not claim delivery", async () => {
  const transport = createMessageTransport(undefined);

  await assert.rejects(() => transport(submission), MessageDeliveryUnavailableError);
});

test("posts URL-encoded plain text and resolves only on a successful response", async () => {
  let postedBody = "";
  const transport = createMessageTransport(
    "https://example.test/form",
    async (_url, request) => {
      postedBody = request.body;
      return { ok: true, status: 200 };
    },
  );

  await transport(submission);

  const parsed = new URLSearchParams(postedBody);
  assert.equal(parsed.get("_subject"), "New portfolio conversation");
  assert.doesNotMatch(postedBody, /<strong>/);
  assert.match(
    parsed.get("conversation") ?? "",
    /Could we talk about your <strong>work<\/strong>\?/,
  );
  assert.equal(parsed.get("submitted_at"), submission.submittedAt);
});

test("keeps failure visible to the caller when the endpoint rejects delivery", async () => {
  const transport = createMessageTransport(
    "https://example.test/form",
    async () => ({ ok: false, status: 429 }),
  );

  await assert.rejects(() => transport(submission), /status 429/);
});
