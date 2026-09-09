import assert from "node:assert/strict";
import test from "node:test";

import {
  createMessageTransport,
  formatConversation,
  MAX_CONVERSATION_LENGTH,
  MAX_MESSAGE_COUNT,
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

test("formats and preserves only explicit visitor messages as plain conversation text", () => {
  const conversation = formatConversation(submission);

  assert.match(conversation, /  Could we talk about your <strong>work<\/strong>\?  /);
  assert.match(conversation, /example@example\.com/);
  assert.doesNotMatch(conversation, /Thank you for visiting/);
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

test("posts URL-encoded plain text and accepts explicit boolean or string success", async () => {
  let postedBody = "";
  for (const success of [true, "true"]) {
    const transport = createMessageTransport(
      "https://example.test/form",
      async (_url, request) => {
        postedBody = request.body;
        return { ok: true, status: 200, json: async () => ({ success }) };
      },
    );

    await transport(submission);
  }

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
    async () => ({ ok: false, status: 429, json: async () => ({ success: false }) }),
  );

  await assert.rejects(() => transport(submission), /status 429/);
});

test("does not treat a 200 FormSubmit error response as a sent conversation", async () => {
  const transport = createMessageTransport(
    "https://example.test/form",
    async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "Form is not active" }),
    }),
  );

  await assert.rejects(() => transport(submission), /could not accept/);
});

test("rejects false, string false, and missing provider success values", async () => {
  for (const response of [{ success: false }, { success: "false" }, {}]) {
    const transport = createMessageTransport(
      "https://example.test/form",
      async () => ({ ok: true, status: 200, json: async () => response }),
    );

    await assert.rejects(() => transport(submission), /could not accept/);
  }
});

test("times out a stalled request instead of leaving the UI in a sending state", async () => {
  const transport = createMessageTransport(
    "https://example.test/form",
    async (_url, request) =>
      new Promise<never>((_, reject) => {
        request.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      }),
    1,
  );

  await assert.rejects(() => transport(submission), /timed out/);
});

test("rejects excessive bubbles and conversation text without trimming it", async () => {
  const transport = createMessageTransport("https://example.test/form", async () => {
    throw new Error("should not be called");
  });
  const tooManyMessages = Array.from({ length: MAX_MESSAGE_COUNT + 1 }, (_, index) => ({
    id: `message-${index}`,
    text: "Hello",
    createdAt: submission.messages[0].createdAt,
  }));

  await assert.rejects(
    () =>
      transport({
        messages: tooManyMessages,
        submittedAt: submission.submittedAt,
      }),
    /up to 40 messages/,
  );
  await assert.rejects(
    () =>
      transport({
        messages: [
          {
            ...submission.messages[0],
            text: "x".repeat(2_001),
          },
        ],
        submittedAt: submission.submittedAt,
      }),
    /up to 2,000 characters/,
  );
  await assert.rejects(
    () =>
      transport({
        messages: Array.from({ length: 11 }, (_, index) => ({
          id: `long-message-${index}`,
          text: "x".repeat(2_000),
          createdAt: submission.messages[0].createdAt,
        })),
        submittedAt: submission.submittedAt,
      }),
    new RegExp(`up to ${MAX_CONVERSATION_LENGTH.toLocaleString()} characters`),
  );
});
