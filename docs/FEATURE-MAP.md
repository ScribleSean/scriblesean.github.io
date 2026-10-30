# Feature map

What a visitor can do, and what checks it today. `npm test` runs in CI before every deploy. The `tests/*.browser.mjs` scripts need Playwright, which is not installed, and nothing runs them.

| Feature | How a visitor reaches it | Checked by |
| --- | --- | --- |
| 3D desk: approach, rotate, zoom, back | `/`, click or drag the scene | `scene-state.test.ts` (camera states); `camera-motion.browser.mjs` (not run) |
| Melee video on the CRT, pause, reduced motion | `/`, plays on load; "pause video" | `scene-state.test.ts` (when it plays); `video-autoplay.browser.mjs` (not run) |
| Video fallback notice and "Watch the original" link | `/` when YouTube won't play | none |
| Enter the CRT desktop, contact shortcut | `/`, "Enter the CRT" or "contact" | `scene-state.test.ts` |
| Reload after a failed desktop load | `/`, after a deploy replaced chunks | `desktop-load-recovery.browser.mjs` (not run) |
| Desktop windows: open, move, resize, minimize, maximize, close | dock inside the CRT | `window-manager.test.ts`; `desktop-usability.browser.mjs` (not run) |
| Desktop browser: address bar, portfolio inside, outside links | Chrome in the dock | `browser-navigation.test.ts` |
| Files: contributions and resume | Files in the dock | none |
| Messages: compose, edit, send, email fallback | Messages in the dock | `message-thread.test.ts`, `message-transport.test.ts` |
| Photos, Settings | dock | none |
| Slippi: back to the video | dock | `scene-state.test.ts` (restore-game) |
| Skip to portfolio | `/`, footer link | none |
| Portfolio page | `/portfolio/` | none (built by `npm run build`) |
| Project pages, light and dark | `/projects/`, `/projects/<slug>/` | `featured-projects.test.ts` (content, images, links, privacy) |
| Resume page and PDF | `/resume/`, Files | none |
| Share image, sitemap, robots | `/og.png`, `/sitemap.xml`, `/robots.txt` | none (built by `npm run build`) |
| Project source scrubbing | `npm run portfolio:gather` | `gather-scrub.test.ts`, `featured-projects.test.ts` |
| Phone layout | any page under 640 px | `screen-alignment.browser.mjs` (CRT only, not run) |

## Human-owned

None yet.
