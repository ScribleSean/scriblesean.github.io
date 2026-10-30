import assert from "node:assert/strict";
import test from "node:test";
import { prepareGatheredFile, scrub } from "../scripts/portfolio-agent/gather.mjs";

test("scrubbing preserves empty input, whitespace and ordinary Unicode text", () => {
  for (const text of ["", "\n", "  \n\n", "Résumé: 雪 ❄️\nfix #272 on 2026-10-21\n"]) {
    assert.equal(scrub(text), text);
  }
});

const dropWords = ["private-notes", "chat-archive"];

test("private context lines are removed case-insensitively without losing neighbors", () => {
  assert.equal(scrub("before\nPRIVATE-NOTES/x\nmiddle\nChat-Archive export\nafter\n", [], dropWords),
    "before\nmiddle\nafter\n");
  assert.equal(scrub("private-notes\nchat-archive", [], dropWords), "");
  assert.equal(scrub("private-notes stays without a drop list", [], []), "private-notes stays without a drop list");
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
  const text = "Résumé /home/alice/project: me@example.com 774-555-0123 100.64.0.1\nprivate-notes/x\n";
  const expected = "Résumé ~/project: [email] [number] [address]\n";
  assert.equal(scrub(text, [], dropWords), expected);
  assert.equal(scrub(expected, [], dropWords), expected);
});

test("unformatted phone numbers are redacted", () => {
  assert.equal(scrub("Call 7745550123."), "Call [number].");
});

test("tokens ending in a hyphen are completely redacted", () => {
  assert.equal(scrub(`token: ghp_${"aB09_-".repeat(3)}.`), "token: [secret].");
});

test("private names are redacted in any case and across spaces, hyphens or underscores", () => {
  const names = ["jane doe", "secretproj"];
  assert.equal(scrub("Ask Jane  Doe about jane_doe and SecretProj.", names),
    "Ask [private] about [private] and [private].");
  assert.equal(scrub("secretprojects stays, so does Janet", names), "secretprojects stays, so does Janet");
  assert.equal(scrub("no names here", []), "no names here");
});

const fakeSecrets: [string, string][] = [
  ["GitHub fine-grained token", `github_pat_${"FAKE_".repeat(8)}`],
  ["AWS access key", `AKIA${"FAKE".repeat(4)}`],
  ["AWS access key", `ASIA${"FAKE".repeat(4)}`],
  ["xAI key", `xai-${"fake_".repeat(8)}`],
  ["Anthropic key", `sk-ant-${"fake_".repeat(8)}`],
  ["OpenAI project key", `sk-proj-${"fake_".repeat(8)}`],
  ["JWT", "eyJmYWtlIjp0cnVlfQ.eyJmYWtlIjp0cnVlfQ.ZmFrZQ"],
  ...["sk-", "ghp_", "gho_", "xoxa-", "xoxb-", "xoxp-", "xoxs-"].map((prefix): [string, string] => ["API token", `${prefix}${"fake_".repeat(8)}`]),
];

for (const [index, [type, token]] of fakeSecrets.entries()) {
  test(`scrubs and rejects synthetic ${type} (case ${index + 1}) without logging its value`, () => {
    assert.equal(scrub(`before ${token} after`), "before [secret] after");
    assert.equal(scrub(`Token: ${token}.`), "Token: [secret].");
    const logs: string[] = [];
    for (const text of [`before ${token} after`, `${"x".repeat(12_001)}\n${token}`, `private-notes ${token}`]) {
      assert.equal(prepareGatheredFile("docs/example.md", text, (message: string) => logs.push(message)), null);
    }
    assert.equal(logs.length, 3);
    for (const message of logs) {
      assert.ok(message.includes("docs/example.md"));
      assert.ok(message.includes(type));
      assert.ok(!message.includes(token));
    }
  });
}

test("safe gathered files pass and are trimmed only after inspection", () => {
  assert.equal(prepareGatheredFile("README.md", "safe text"), "safe text");
  assert.equal(prepareGatheredFile("README.md", "x".repeat(12_001)), `${"x".repeat(12_000)}\n\n[… trimmed]`);
  for (const token of [`AKIA${"A".repeat(15)}`, `AKIA${"A".repeat(17)}`, "eyJfake.onlytwo", "github_pat_short", "xai-short"]) {
    assert.equal(prepareGatheredFile("README.md", token), token);
  }
});
