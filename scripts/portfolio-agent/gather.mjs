#!/usr/bin/env node
// Collects source material for the update-portfolio skill.
//
// For each project in portfolio-agent.config.json it reads the README, the
// listed docs and recent commit subjects from the configured git ref, using
// `git show` and `git log` only. Repos are never checked out or changed.
// Output: one Markdown file per project in tmp/portfolio-agent/<date>/, which
// is gitignored. Private details are scrubbed before anything is written.
//
// Usage: node scripts/portfolio-agent/gather.mjs [--only beeline,observatory] [--commits 40]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = JSON.parse(readFileSync(path.join(root, "portfolio-agent.config.json"), "utf8"));
const privatePath = path.join(root, "portfolio-agent.private.json");

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};
const only = flag("only")?.split(",");
const commitCount = Number(flag("commits") ?? 40);
const MAX_FILE_CHARS = 12_000;

const expand = (p) => path.resolve(p.replace(/^~(?=$|\/)/, homedir()));
const real = (p) => (existsSync(p) ? realpathSync(p) : p);
let blocked = [];
let privateNames = [];
const isBlocked = (p) => {
  const target = real(p).toLowerCase();
  return blocked.some((b) => target === b || target.startsWith(`${b}${path.sep}`));
};

const SKIP_FILE = /(^|\/)(AGENTS|CLAUDE)\.md$|(^|\/)\.env|secret|credential|private|personal/i;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Private names come from portfolio-agent.private.json (loaded in main), so they
// are redacted even when the project-level check is skipped.
function scrubNames(text, names) {
  let out = text;
  for (const name of names) {
    const words = String(name).trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (!words.length) continue;
    out = out.replace(new RegExp(`(?<!\\p{L})${words.join("[\\s_-]+")}(?!\\p{L})`, "giu"), "[private]");
  }
  return out;
}

export function scrub(text, names = privateNames) {
  return scrubNames(text, names)
    .split("\n")
    .filter((line) => !/agent-context|imessage/i.test(line))
    .join("\n")
    .replace(/\/(Users|home)\/[^/\s)]+/g, "~")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?<![\w-])(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}(?![\w-])/g, "[number]")
    .replace(/\b100\.(?:\d{1,3}\.){2}\d{1,3}\b/g, "[address]")
    .replace(/\b(?:sk|ghp|gho|xox[abp])[-_][A-Za-z0-9_-]{16,}(?![\w-])/g, "[secret]")
    .replace(/\b[A-Fa-f0-9]{40,}\b/g, "[hash]");
}

function git(repo, ...gitArgs) {
  return execFileSync("git", ["-C", repo, ...gitArgs], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function readAtRef(repo, ref, file) {
  if (SKIP_FILE.test(file)) return null;
  try {
    const text = git(repo, "show", `${ref}:${file}`);
    return text.length > MAX_FILE_CHARS ? `${text.slice(0, MAX_FILE_CHARS)}\n\n[… trimmed]` : text;
  } catch {
    return null;
  }
}

function exportImages(project, repo, ref, outDir) {
  const exported = [];
  for (const file of project.images ?? []) {
    if (SKIP_FILE.test(file)) continue;
    let data;
    try {
      data = execFileSync("git", ["-C", repo, "show", `${ref}:${file}`], { maxBuffer: 64 * 1024 * 1024 });
    } catch {
      continue;
    }
    const dir = path.join(outDir, "images", project.slug);
    mkdirSync(dir, { recursive: true });
    let target = path.join(dir, path.basename(file));
    writeFileSync(target, data);
    if (file.endsWith(".icns")) {
      const png = target.replace(/\.icns$/, ".png");
      try {
        execFileSync("sips", ["-s", "format", "png", "-Z", "512", target, "--out", png], { stdio: "ignore" });
        target = png;
      } catch {
        continue;
      }
    }
    exported.push(path.relative(root, target));
  }
  return exported;
}

function gatherProject(project, outDir) {
  if (project.teaser || !project.repo) {
    return `# ${project.name}\n\nTeaser slot. This project is private: nothing was read.\n\nNotes: ${project.notes ?? ""}\n`;
  }
  const repo = expand(project.repo);
  if (isBlocked(repo)) throw new Error(`${project.slug}: ${project.repo} is on the blocked list`);
  if (!existsSync(repo)) throw new Error(`${project.slug}: ${project.repo} does not exist`);

  const ref = project.ref ?? "HEAD";
  const head = git(repo, "log", "-1", "--format=%h %ad", "--date=short", ref).trim();
  const commits = git(repo, "log", ref, "-n", String(commitCount), "--no-merges", "--format=%ad  %s", "--date=short").trim();
  const topLevel = git(repo, "ls-tree", "--name-only", ref).trim().split("\n").join(", ");

  const sections = [
    `# ${project.name}`,
    `Read from \`${ref}\` at ${head}. Public repo: ${project.public ? "yes" : "no"}.`,
    project.notes ? `Notes from the config: ${project.notes}` : "",
    `Allowed links: ${Object.entries(project.links ?? {}).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`,
    `Top level: ${topLevel}`,
    `## Recent commits\n\n${commits}`,
  ];
  for (const file of ["README.md", ...(project.docs ?? [])]) {
    const text = readAtRef(repo, ref, file);
    if (text) sections.push(`## ${file}\n\n${text}`);
  }
  const images = exportImages(project, repo, ref, outDir);
  if (images.length) sections.push(`## Exported images (check each for private details before use)\n\n${images.map((f) => `- ${f}`).join("\n")}`);
  return scrub(sections.filter(Boolean).join("\n\n"));
}

function loadPrivateList() {
  if (!existsSync(privatePath)) {
    throw new Error("portfolio-agent.private.json is missing. It lists the folders and private projects the agent must never read or publish. Copy it from the main checkout before gathering.");
  }
  const list = JSON.parse(readFileSync(privatePath, "utf8"));
  blocked = (list.blockedPaths ?? []).map((p) => real(expand(p)).toLowerCase());
  privateNames = (list.privateNames ?? []).map((n) => n.toLowerCase());
  for (const project of config.projects) {
    const text = `${project.slug} ${project.name} ${project.repo ?? ""}`.toLowerCase();
    const name = privateNames.find((n) => text.includes(n.toLowerCase().replace(/\s+/g, " ")));
    if (name) throw new Error(`${project.slug}: matches the private name "${name}" and must not be published`);
  }
}

function main() {
  loadPrivateList();
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(root, config.outputDir, date);
  mkdirSync(outDir, { recursive: true });
  const projects = config.projects.filter((p) => !only || only.includes(p.slug));
  const written = [];
  for (const project of projects) {
    const file = path.join(outDir, `${project.slug}.md`);
    writeFileSync(file, gatherProject(project, outDir));
    written.push(path.relative(root, file));
  }
  console.log(`Gathered ${written.length} project(s):\n${written.map((f) => `  ${f}`).join("\n")}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) main();
