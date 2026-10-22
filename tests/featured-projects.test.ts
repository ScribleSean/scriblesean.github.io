import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { featured, featuredProjects, projectPages } from "../data/featured-projects";
import { scrub } from "../scripts/portfolio-agent/gather.mjs";


const root = path.resolve(__dirname, "..");
const config = JSON.parse(readFileSync(path.join(root, "portfolio-agent.config.json"), "utf8"));
const rawDraft = readFileSync(path.join(root, "data/featured-projects.json"), "utf8");

test("the draft follows the config's projects and order", () => {
  assert.deepEqual(featuredProjects.map((p) => p.slug), config.projects.map((p: { slug: string }) => p.slug));
  assert.equal(new Set(featuredProjects.map((p) => p.slug)).size, featuredProjects.length);
  assert.match(featured.checkedThrough, /^\d{4}-\d{2}-\d{2}$/);
});

test("every project page has its content and every image exists", () => {
  for (const project of projectPages) {
    for (const field of ["name", "verb", "kind", "status", "tagline", "summary"] as const) {
      assert.ok(project[field]?.trim(), `${project.slug}: missing ${field}`);
    }
    assert.ok(project.sections?.length, `${project.slug}: needs at least one section`);
    assert.ok(project.icon || project.mark, `${project.slug}: needs an icon or mark`);
    const images = [project.icon, project.hero?.light, project.hero?.dark, ...(project.gallery ?? []).flatMap((g) => [g.src, g.darkSrc])];
    for (const src of images.filter(Boolean) as string[]) {
      assert.ok(src.startsWith(`/projects/${project.slug}/`), `${project.slug}: ${src} should live in public/projects/${project.slug}/`);
      assert.ok(existsSync(path.join(root, "public", src)), `${project.slug}: ${src} is missing`);
    }
    for (const link of project.connects ?? []) {
      assert.notEqual(link.slug, project.slug);
      assert.ok(projectPages.some((p) => p.slug === link.slug), `${project.slug}: connects to unknown ${link.slug}`);
    }
  }
});

test("links appear only for public repos and match the config", () => {
  for (const project of featuredProjects) {
    const entry = config.projects.find((p: { slug: string }) => p.slug === project.slug);
    const allowed = Object.values(entry.links ?? {});
    for (const link of project.links ?? []) {
      assert.ok(entry.public, `${project.slug} is private but has a link`);
      assert.ok(allowed.includes(link.href), `${project.slug}: ${link.href} is not in the config`);
    }
  }
});

test("the teaser says nothing about the private project", () => {
  for (const teaser of featuredProjects.filter((p) => p.teaser)) {
    for (const field of ["icon", "hero", "sections", "gallery", "highlights", "connects", "stack", "links", "tagline", "kind"] as const) {
      assert.equal(teaser[field], undefined, `teaser must not have ${field}`);
    }
    assert.ok(teaser.summary.length < 120);
    assert.doesNotMatch(teaser.summary, /media|video|music|photo|stream/i);
  }
});

test("the draft holds no private details and follows the writing style", () => {
  const banned: [RegExp, string][] = [
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "an email address"],
    [/\/Users\/|~\/|Developer\//, "a local path"],
    [/agent-context|imessage/i, "a blocked folder"],
    [/\(?\d{3}\)?[ .-]?\d{3}[ .-]\d{4}/, "a phone number"],
    [/claude\/[a-z-]+-[0-9a-f]{6}/i, "a branch name"],
    [/—/, "an em dash"],
    [/\b(honestly|genuinely|seamless(ly)?|cutting-edge|revolutionary)\b/i, "filler wording"],
  ];
  for (const [pattern, what] of banned) assert.doesNotMatch(rawDraft, pattern, `draft contains ${what}`);
  assert.ok(!featuredProjects.some((p) => /voice\s*control/i.test(p.name)), "VoiceControl is part of Beeline, not its own project");
});

test("the public config names no private list and teasers have no repo", () => {
  assert.equal(config.blockedPaths, undefined, "blocked folders belong in the local private list");
  for (const teaser of config.projects.filter((p: { teaser?: boolean }) => p.teaser)) assert.equal(teaser.repo, undefined);
});

const privatePath = path.join(root, "portfolio-agent.private.json");
const privateList = existsSync(privatePath) ? JSON.parse(readFileSync(privatePath, "utf8")) : null;

test("private projects and folders never reach the site", { skip: !privateList && "no local private list" }, () => {
  const names: string[] = privateList.privateNames;
  const blocked: string[] = privateList.blockedPaths;
  const publicFiles = [
    rawDraft,
    readFileSync(path.join(root, "portfolio-agent.config.json"), "utf8"),
    ...readdirSync(path.join(root, "public/projects")),
  ].join("\n");
  for (const name of names) {
    assert.doesNotMatch(publicFiles, new RegExp(name.replace(/\s+/g, "\\s*"), "i"), `"${name}" is private`);
  }
  for (const project of config.projects) {
    assert.ok(!blocked.some((b) => project.repo?.startsWith(b)), `${project.slug} points into a blocked folder`);
  }
});

test("gathered sources are scrubbed of private details", () => {
  const text = scrub("Call +1 (774) 555-0123 on 2026-10-21 (#272).\nSee ~/Developer/agent-context/x\nPath /Users/someone/Developer/app, mail me@example.com, key ghp_abcdefghijklmnopqrstuv");
  assert.equal(text, "Call [number] on 2026-10-21 (#272).\nPath ~/Developer/app, mail [email], key [secret]");
});
