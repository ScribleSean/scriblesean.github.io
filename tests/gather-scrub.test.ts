import assert from "node:assert/strict";
import test from "node:test";
import { scrub } from "../scripts/portfolio-agent/gather.mjs";

test("scrubbing preserves empty input, whitespace and ordinary Unicode text", () => {
  for (const text of ["", "\n", "  \n\n", "Résumé: 雪 ❄️\nfix #272 on 2026-10-21\n"]) {
    assert.equal(scrub(text), text);
  }
});

test("private context lines are removed case-insensitively without losing neighbors", () => {
  assert.equal(scrub("before\nAGENT-CONTEXT/private\nmiddle\niMessage archive\nafter\n"),
    "before\nmiddle\nafter\n");
  assert.equal(scrub("agent-context\nimessage"), "");
});

test("home paths and multiple email addresses are scrubbed within surrounding prose", () => {
  assert.equal(scrub("(/home/alice/Developer/app) /Users/bob/My Project\nFIRST+tag@EXAMPLE.COM, second@sub.example.org"),
    "(~/Developer/app) ~/My Project\n[email], [email]");
});

test("phone formats are redacted while dates, issue IDs and embedded identifiers survive", () => {
  assert.equal(scrub("+1 (774) 555-0123; 774.555.0123; 1-774-555-0123"),
    "[number]; [number]; [number]");
  const identifiers = "2026-10-21 #272 ticket-774-555-0123 abc7745550123 7745550123xyz";
  assert.equal(scrub(identifiers), identifiers);
});

test("private network addresses and supported token prefixes are redacted", () => {
  const suffix = "aB09_-".repeat(3) + "z";
  for (const prefix of ["sk-", "ghp_", "gho_", "xoxa-", "xoxb-", "xoxp-"]) {
    assert.equal(scrub(`token: ${prefix}${suffix}.`), "token: [secret].");
  }
  assert.equal(scrub("100.64.0.1, 100.127.255.254; 192.168.1.2"),
    "[address], [address]; 192.168.1.2");
});

test("token and hash length boundaries preserve short references", () => {
  assert.equal(scrub(`ghp_${"g".repeat(15)} ghp_${"g".repeat(16)}`),
    `ghp_${"g".repeat(15)} [secret]`);
  assert.equal(scrub(`${"a".repeat(39)} ${"B".repeat(40)} ${"c".repeat(64)}`),
    `${"a".repeat(39)} [hash] [hash]`);
});

test("scrubbing mixed private details twice does not change the result", () => {
  const text = "Résumé /home/alice/project: me@example.com 774-555-0123 100.64.0.1\nagent-context/private\n";
  const expected = "Résumé ~/project: [email] [number] [address]\n";
  assert.equal(scrub(text), expected);
  assert.equal(scrub(expected), expected);
});

// Keep regressions visible while production fixes remain outside this test-only job.
test("unformatted phone numbers are redacted", { todo: "bug: scrub leaks standalone ten-digit phone numbers" }, () => {
  assert.equal(scrub("Call 7745550123."), "Call [number].");
});

test("tokens ending in a hyphen are completely redacted", { todo: "bug: scrub leaves a trailing hyphen from a secret token" }, () => {
  assert.equal(scrub(`token: ghp_${"aB09_-".repeat(3)}.`), "token: [secret].");
});
