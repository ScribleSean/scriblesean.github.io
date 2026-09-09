# GameCube portfolio implementation plan

## Outcome

Extend the existing Next.js portfolio with the approved interactive GameCube scene, a useful Ubuntu-style desktop, a separate mobile Safari presentation, and a direct portfolio route. Keep GitHub Pages compatibility and existing portfolio content. No paid services or audio.

## Approved visitor flow

1. Show a wide, softly lit beige 3D setup immediately, with subtle motion. The setup contains an ivory CRT, green/cream Slippi GameCube, classic indigo controller, and Fox figurine on a single Melee case.
2. Desktop: click the scene to approach the desk. Hovering over the CRT moves closer; leaving pulls back. Clicking the CRT locks the view and minimizes the silent Melee clip into the Slippi dock icon.
3. Reveal the approved Sassy sunset wallpaper and desktop, without an automatically opened browser. Chrome, Files, Messages, Settings, and Slippi have real functions.
4. Windows support focus, dragging, resize, minimize, maximize, close, and dock restoration. Slippi restores the paused clip at its prior position. Clicking outside or Back to desk returns to the opening wide view. Drag rotates, scroll zooms, and right-drag pans while outside the desktop.
5. Mobile: tap the CRT to enter a full-screen Safari-style portfolio. No desktop window manager or simulated phone bezel.
6. Opening footer: `sean arackal · contact · skip to portfolio`. Contact opens Messages directly. Skip opens the existing portfolio presentation.

## Implementation packages

### Coordinator: scene, routing, assets, integration

- Build actual lightweight 3D geometry using React Three Fiber, with a projected DOM screen for video and interactive desktop content.
- Keep a deterministic room/desk/focused/entered camera state machine and reduced-motion behavior.
- Use the approved YouTube video `TFmpEWb0Nqk`, muted, starting and looping at the verified READY countdown at 0:17, ending at 1:08 before looping back, and paused while hidden. Keep the IFrame API instance stable across minimize/restore. Never pretend a fallback still is playing video.
- Integrate the approved wallpaper and reuse existing visual references. Physically separate controller and AV cables.
- Preserve standalone portfolio access and old section hashes.

### Desktop owner

- Own desktop shell, app registry, dock, window state and Ubuntu styling.
- Accept React nodes for portfolio, Files and Messages, plus callbacks for Slippi and Back to desk.
- Keep all windows inside the desktop viewport; support keyboard controls and sensible minimum sizes.

### Portfolio and Files owner

- Extract the existing portfolio into a reusable, style-isolated component without changing factual content.
- Add the mobile Safari shell and useful project folders.
- Locate an existing resume before adding a download. Do not fabricate a PDF source or dead link.

### Messages owner

- Implement welcome, editable/deletable draft bubbles and explicit Send conversation action.
- Send only the submitted complete transcript, with contact details optional and naturally entered in text.
- Add pending, success and recoverable failure states. No fake read receipts or premature success.
- Verify a free delivery transport and document any required owner activation. Keep service secrets out of browser code and Git.

## Work order

1. Confirm architecture and module contracts, create isolated worktrees for independent owners.
2. Build the scene and desktop/portfolio/messages packages in parallel.
3. Integrate a coherent local preview, then finish camera transitions, video lifecycle and responsive behavior.
4. Verify type checking, lint, production static export and meaningful interaction/state tests. Fix failures before completion.
5. Review the integrated changes, verify available assets and delivery configuration, and prepare the GitHub Pages deployment. Report any external activation or asset blocker precisely rather than claiming it works.

## Acceptance checks

- Opening has the approved calm scene, correct object identities and no boot sequence.
- Scene approach, hover focus, enter, minimize, restore and Back to desk follow the agreed state transitions.
- Desktop starts with wallpaper and usable dock only. Each app performs its named function.
- Windows preserve state on minimize and stay operable after viewport changes.
- Phone flow enters Safari-style portfolio directly; direct portfolio links remain readable without WebGL.
- Messages preserve user text, allow draft corrections, prevent duplicate in-flight submissions and show success only after transport confirmation.
- All audio remains muted. Video pauses while hidden; reduced motion suppresses decorative camera movement.
- Existing content remains available, no credentials or private context enters Git, and no broken resume/live-site links are introduced.

## Known dependencies to resolve

- Existing repository contains resume-backed content; /resume/ provides a printable version. The original PDF copy could not be completed from iCloud, so no broken PDF download is shown.
- Public static hosting requires an external email delivery endpoint; owner activation may be required.
- YouTube autoplay and embedding can be restricted by client/browser policy. Provide a clear, usable video fallback.
- Visual reference images are concepts; interactive geometry must be built and checked separately.
