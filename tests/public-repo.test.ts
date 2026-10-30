import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { pdfText } from "./pdf-text";

// This repo and everything under public/ are published. These checks cover every
// tracked file, so a detail removed from one file can't survive in another
// (the phone number left data/resume.json but stayed in the résumé PDF).

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const git = (...args: string[]) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
const tracked = git("ls-files", "-z").split("\0").filter(Boolean);

const AGENT_FILES = /(^|\/)(CLAUDE\.md|AGENTS\.md|HANDOFF[^/]*|[^/]*\.local\.md|IMPLEMENTATION_PLAN\.md|portfolio-agent\.(config|private)\.json)$|(^|\/)\.(claude|codex)\//;

test("agent setup and private config files are not tracked", () => {
  const found = tracked.filter((file) => AGENT_FILES.test(file));
  assert.deepEqual(found, [], `Tracked agent or private files: ${found.join(", ")}. Run \`git rm --cached <file>\` and keep the local copy; .gitignore already lists these names.`);
});

// SHA-256 of each lowercased internal tool or notes name. Hashes keep the names
// themselves out of this public file; the plain list lives with the private notes.
const INTERNAL_NAMES = new Set([
  "67c6921739229bf4410ca72c769284ce1e15309f06a000e445536adb9906a4f7",
  "aeacda21cbc3fe134dede52ddb8a7a634de2a91e36f10181f3451221a5a0dd36",
  "ed789ba8898bf08533d57d5938436d45c256e5990e7e619e0b0295cbf62f8ea9",
  "6cb784e0f985cba22d0642283892ad0f90dcd48385524de0dec0f51624456a43",
]);
const sha256 = (word: string) => createHash("sha256").update(word).digest("hex");

// Every word, and every hyphenated run of up to three words ("a-b-c" gives a, b, c,
// a-b, b-c, a-b-c), whose hash is in the list.
function internalNames(text: string, hashes = INTERNAL_NAMES): string[] {
  const hits: string[] = [];
  for (const run of text.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []) {
    const parts = run.split("-");
    for (let start = 0; start < parts.length; start++) {
      for (let end = start + 1; end <= Math.min(parts.length, start + 3); end++) {
        const word = parts.slice(start, end).join("-");
        if (hashes.has(sha256(word))) hits.push(word);
      }
    }
  }
  return hits;
}

test("the internal-name check catches a planted name", () => {
  const planted = `leak-${Date.now().toString(36)}`;
  const hashes = new Set([sha256(planted)]);
  assert.deepEqual(internalNames(`See ~/notes/${planted.toUpperCase()}/plan.md.`, hashes), [planted]);
  assert.deepEqual(internalNames("See the notes for the plan.", hashes), []);
  for (const hash of INTERNAL_NAMES) assert.match(hash, /^[0-9a-f]{64}$/);
});

// A phone number in the 555-01xx range is fictional and fine in test fixtures.
const PHONE = /(?<![\w-])(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}(?![\w-])/g;
const fictional = (number: string) => /555\D?01\d\d$/.test(number);

const RULES: { name: string; find: (text: string, file: string) => string[]; fix: string }[] = [
  {
    name: "a phone number",
    find: (text) => (text.match(PHONE) ?? []).filter((n) => !fictional(n)),
    fix: "The site lists email, city and links only. Remove the number (and regenerate the résumé PDF if it is in there).",
  },
  {
    name: "a local path",
    find: (text, file) => (file.startsWith("tests/") ? [] : text.match(/\/Users\/[^/\s"'`]+|\/home\/[a-z][^/\s"'`]*|~\/Developer\b/g) ?? []),
    fix: "Use a path relative to the repo, or keep the note in a gitignored local file.",
  },
  {
    name: "internal process",
    find: (text) => [...(text.match(/\bqueue row \d+/gi) ?? []), ...internalNames(text)],
    fix: "Agent notes, queue rows and tool names stay out of the public repo. Keep them in a gitignored local file.",
  },
];

// Known leaks waiting on the owner. Each needs a reason. No expiry date: CI runs
// these tests before every deploy, so a date would block unrelated deploys.
const EXCEPTIONS: { file: string; rule: string; reason: string }[] = [
  {
    file: "public/resume/sean-arackal-resume.pdf",
    rule: "a phone number",
    reason: "The résumé carries the owner's phone number on purpose.",
  },
  {
    file: "public/resume/sean-arackal-resume.pdf",
    rule: "internal process",
    reason: "The owner keeps the résumé's skills line as written.",
  },
];

function readTracked(file: string): string | null {
  const full = path.join(root, file);
  if (!existsSync(full)) return null;
  const data = readFileSync(full);
  if (file.endsWith(".pdf")) return pdfText(data);
  return data.includes(0) ? null : data.toString("utf8");
}

test("tracked files hold no phone numbers, local paths or internal process notes", () => {
  const problems: string[] = [];
  for (const file of tracked) {
    if (file === "package-lock.json" || file === "tests/public-repo.test.ts") continue;
    const text = readTracked(file);
    if (text === null) continue;
    for (const rule of RULES) {
      const hits = rule.find(text, file);
      if (!hits.length) continue;
      const exception = EXCEPTIONS.find((e) => e.file === file && e.rule === rule.name);
      if (exception) continue;
      problems.push(`${file}: ${rule.name} (${hits.length}x). ${rule.fix}`);
    }
  }
  assert.deepEqual(problems, []);
});

// Commit messages and authors are public too. This checks commits that are not on
// the remote yet; in CI that range is empty. PUBLIC_COMMITS_BASE overrides the base.
const COMMIT_RULES: [RegExp, string][] = [
  [/\bqueue row\b|\(row \d+\)/i, "a queue row"],
  [/\b(review )?findings? \d+/i, "audit finding numbers"],
  [/\bon (Ubuntu|the Mac|the PC)\b/i, "a device name"],
  [/\b(claude|codex|cursor)\/[\w.-]+/i, "an agent branch name"],
  [/\b(subagent|handoff)\b/i, "agent tooling"],
  [/\bTests? \d+\/\d+/i, "internal test counts"],
  [/^Co-Authored-By:|Generated with/im, "an AI attribution line"],
];
const AUTHOR = "ScribleSean <56331494+ScribleSean@users.noreply.github.com>";

function unpushedBase(): string | null {
  const base = process.env.PUBLIC_COMMITS_BASE ?? "origin/main";
  try {
    git("rev-parse", "--verify", "--quiet", `${base}^{commit}`);
    return base;
  } catch {
    return null;
  }
}

test("unpushed commit messages say what changed, not how it was made", { skip: !unpushedBase() && "no origin/main to compare with" }, () => {
  const log = git("log", "--format=%h%x00%an <%ae>%x00%B%x01", `${unpushedBase()}..HEAD`);
  const problems: string[] = [];
  for (const entry of log.split("\x01").map((e) => e.trim()).filter(Boolean)) {
    const [sha, author, message] = entry.split("\0");
    if (author !== AUTHOR) problems.push(`${sha}: author ${author}; commit as ${AUTHOR}`);
    for (const [pattern, what] of COMMIT_RULES) {
      if (pattern.test(message)) problems.push(`${sha}: message has ${what}`);
    }
    if (internalNames(message).length) problems.push(`${sha}: message has agent tooling`);
  }
  assert.deepEqual(problems, [], "Reword with `git commit --amend` or `git rebase` before pushing: say what the change does for a visitor or a contributor. If these commits are already on GitHub, run `git fetch origin` first.");
});
