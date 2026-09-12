# Scene baseline and verification

The current interaction baseline is commit `3639ce6`, deployed September 9 and still live September 11. Sean requested returning to that behavior after the September 12 tuning changed the feel of the site.

Restored from that baseline: camera easing, orbit damping, hover focus, desk geometry, original Fox, and muted video autoplay on initial load. The 600 ms fixed transitions, static batching, delayed video initialization and transition-specific playback gate were removed. The newer portfolio content, mobile scaling, loading treatment and browser usability fixes remain.

The camera's distance/polar limits, clipping and fog still accommodate the scaled mobile viewport, preventing unreachable targets. Canvas resolution respects the physical mobile viewport, with the baseline 1.5 maximum pixel ratio. Graphics-context recovery remains available.

Build the static export with `npm run build -- --webpack`, then serve `out/`. Browser checks accept `PLAYWRIGHT_MODULE`, `CHROME_PATH` and `TEST_URL` for an existing Playwright/Chrome installation and local or deployed URL:

- `tests/camera-motion.browser.mjs`: original easing settles, hover approaches/withdraws, initial autoplay is requested, and desk model clicks work. Its player is mocked to isolate camera behavior.
- `tests/scene-performance.browser.mjs`: viewport fitting, settled idle rendering, video initialization, and desktop interactions. `TEST_DEVICE` selects a scenario. Geometry counts are observations, not acceptance targets for the restored baseline.
- `tests/desktop-usability.browser.mjs`: window controls, browser navigation and graphics-loss recovery.
- `tests/video-autoplay.browser.mjs`: actual muted YouTube playback advances before any user interaction; requires network access.

Restoration checks passed on desktop and phone emulation. Real Chrome playback advanced from 17.1 to 18.6 seconds while the camera stayed in the room. The return camera move follows the original approximately 1.8-second easing. These are local observations, not guarantees of frame rate or autoplay policy on every device. Future changes should be small, compared against this baseline and reviewed for interaction feel before accumulating more tuning.
