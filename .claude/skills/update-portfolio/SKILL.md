---
name: update-portfolio
description: Refresh the featured project pages on Sean's portfolio from his project repos. Reads each project listed in portfolio-agent.config.json (README, chosen docs, recent commits, images), drafts updated content in data/featured-projects.json on a new branch, checks the pages in light and dark mode, and stops for Sean's review. Use when Sean asks to update, refresh or redraft his portfolio or project pages, or to add or remove a featured project.
---

# Update the portfolio's project pages

The featured projects appear in three places, all driven by `data/featured-projects.json`:
the "Currently working on" cards on `/portfolio/` (and inside the 3D desktop), the overview at
`/projects/`, and one page per project at `/projects/<slug>/`. This skill redrafts that file from
the projects themselves. Sean approves everything: the site is public.

## Hard rules

- Work on a new branch named `portfolio/update-YYYY-MM-DD`. Never push, deploy, merge, tag or open a PR.
- Only projects listed in `portfolio-agent.config.json` are ever read or published. Never add one Sean hasn't approved for the public site.
- `portfolio-agent.private.json` (gitignored, local only) lists folders that must never be read and private projects that must never be named. Never read those folders, never mention those projects anywhere in the repo (pages, data, docs, commit messages), and never copy the list into a tracked file. The gather script refuses to run without it and refuses any project on it; don't work around that.
- A `teaser` project is private. Never read its repo, name it, hint at what it does, or give it an icon or link.
- Write only what the sources support. Don't invent features, users, numbers or integrations. If a README says "planned" or "not verified", say so or leave it out. Status words stay modest ("In progress", "Early preview", "Prototype", "Personal tool").
- Links only for projects marked `"public": true`, and only the URLs listed in the config.
- No private details: no emails, phone numbers, local paths, branch names, account names, people's names other than Sean, or anything from a file the gather step marked as skipped.

## Steps

1. **Branch.** `git switch -c portfolio/update-$(date +%F)` from the current main line.
2. **Check the config.** `portfolio-agent.config.json` is the one list of projects. Its order is the order on the site. Each entry names the repo, the git `ref` to read (a branch or tag; repos are never checked out), extra `docs`, `images` to export, whether it's `public`, allowed `links`, and `notes` with Sean's framing. Update a `ref` only if Sean said which branch is current.
3. **Gather.** `npm run portfolio:gather` (same as `node scripts/portfolio-agent/gather.mjs`) (add `--only beeline,observatory` to limit). It writes a scrubbed Markdown bundle per project and exported images to `tmp/portfolio-agent/<date>/` (gitignored). Read every bundle in full before writing.
4. **Draft.** Edit `data/featured-projects.json` (types in `data/featured-projects.ts`). Keep the existing shape:
   - `heading` and `intro` frame the set. The projects should read as one family that leads into each other: each card has a one-word `verb` (Do, Ask, Watch, Control, Soon), and `connects` says in one sentence how a project sits next to another. Only claim real relationships.
   - Per project: `tagline` (one line), `summary` (two sentences), two or three `sections` of one or two short paragraphs, three or four `highlights`, a short `stack`, and `links`.
   - Images: pick from the exported ones, check each by eye for private details, and copy only what a page uses into `public/projects/<slug>/`. Shrink screenshots with `sips -s format jpeg -s formatOptions 82 -Z 1600 in.png --out out.jpg` and icons with `sips -s format png -Z 256`. Give dark variants (`hero.dark`, `gallery[].darkSrc`) when the repo has them. Record real pixel sizes in `width` and `height`.
   - Set `checkedThrough` to today's date.
   - A project without screenshots yet can set `heroPlaceholder` (for example "Screenshots coming soon") to hold the hero spot.
5. **Write like Sean.** First person, plain and short. Concrete over clever. No em dashes, no filler ("honestly", "genuinely", "seamless"), no hype. Match the existing pages' tone.
6. **Verify.**
   - Search the build for every name in the private list: `grep -ril -e <name> out/` must find nothing outside third-party library code (check any hit by hand).
   - `npm run lint`, `npm run typecheck`, `npm test` (includes `tests/featured-projects.test.ts`, which fails on leaks, missing images, bad links or em dashes), `npm run build`.
   - Serve `out/` (for example `python3 -m http.server 3124 --directory out`), then run `npm run portfolio:screenshots`. It saves full-page light and dark captures of the 3D home page, the portfolio, its projects section, the overview and every project page, plus a phone shot of the home page, to `tmp/portfolio-agent/<date>/screenshots/` (`--out <dir>` to change it, `--phones` for a phone shot of every page). Look at every one. Fix anything cramped, clipped, misaligned or hard to read in either appearance.
7. **Commit and stop.** Small commits, no AI attribution lines. Then tell Sean: the branch, what changed per project, the screenshot folder, and every judgement call he should make (claims you softened, images you chose or skipped, status words, anything the sources left unclear).

## Adding or removing a project

Add or remove its entry in `portfolio-agent.config.json` (keep the teaser last), then run the steps above. The tests require the draft to list the same projects in the same order as the config.
