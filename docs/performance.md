# Scene baseline and verification

The interaction baseline is commit `3639ce6`, deployed September 9 and still live September 11. The September 12 tuning changed how the site felt, so Sean asked to return to that baseline.

The restore brought back the baseline's camera easing, orbit damping, hover focus, desk geometry, original Fox, and muted video autoplay on first load. It removed the 600 ms fixed transitions, static batching, delayed video start, and the playback gate tied to transitions. It kept the newer portfolio content, mobile scaling, loading screen, and browser usability fixes.

The camera's distance and polar-angle limits, clipping, and fog still fit the scaled mobile viewport, so every target stays reachable. The canvas resolution follows the physical mobile viewport, capped at the baseline's maximum pixel ratio of 1.5. The scene still recovers from a lost graphics context.

Build the static export with `npm run build`, the same Turbopack build that CI deploys, then serve `out/`. The browser checks read three environment variables. `PLAYWRIGHT_MODULE` and `CHROME_PATH` point to an existing Playwright and Chrome install, and `TEST_URL` sets the local or deployed URL to test.

- `tests/camera-motion.browser.mjs` checks that the original easing settles, that hover moves the camera in and back out, that the page requests autoplay on first load, and that clicks on desk models work. It mocks the video player to test only the camera.
- `tests/scene-performance.browser.mjs` checks viewport fitting, that rendering stops when idle, video start, and desktop interactions. `TEST_DEVICE` picks a scenario. Its geometry counts are for reference, not targets the restored baseline must meet.
- `tests/desktop-usability.browser.mjs` checks window controls, browser navigation, and recovery after the graphics context is lost.
- `tests/video-autoplay.browser.mjs` checks that muted YouTube playback advances before any user interaction. It needs network access.

The restore passed these checks on desktop and in phone emulation. In real Chrome, playback advanced from 17.1 to 18.6 seconds while the camera stayed in the room. The camera's return move uses the original easing of about 1.8 seconds. These results come from local runs and say nothing about frame rate or autoplay behavior on other devices. Keep future changes small, compare each one against this baseline, and check how the interaction feels before adding more tuning.

## Screen alignment

The interactive screen is part of the normal DOM tree. The page projects it from the camera onto the CRT's 2.56 x 1.92 opening, with one perspective transform while the camera moves and a flat 2D transform when the camera faces the desktop. Each frame updates the camera before it projects the screen, and easing ends on the exact target so no leftover angle remains. Camera easing, damping, hover behavior, and video playback stay as in the restored baseline.

`tests/screen-alignment.browser.mjs` checks that the screen stays centered and that visible buttons receive clicks at 877 x 837, 1440 x 900, and 390 x 844, including after desktop resizes and for an app launched by coordinates. `tests/desktop-load-recovery.browser.mjs` simulates a missing desktop chunk and checks the reload action. A stale CSS chunk once broke the desktop in an already open in-app browser tab, and reloading fixed it. The desktop error boundary now shows a reload button instead of a blank screen.
