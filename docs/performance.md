# Scene performance checks

Build the static export and serve `out/` locally before running the browser check:

```sh
npm run build
python3 -m http.server 3124 --directory out
# In another terminal, using an installed Playwright:
node tests/scene-performance.browser.mjs
```

Optional environment variables: `PLAYWRIGHT_MODULE` selects an existing Playwright installation, `CHROME_PATH` selects a Chrome executable, `TEST_URL` selects the served site, and `TEST_DEVICE` restricts a rerun to one failing scenario.

The browser check covers desktop, narrow windows, portrait phones, landscape and reduced motion. It checks that camera states stop drawing once settled, camera changes reuse geometry buffers, initial load does not request YouTube, the framebuffer fits the physical screen, and projected desktop scrolling and dragging work. It uses WebGL counters injected by the test, not production diagnostics. Third-party video requests are blocked to isolate rendering; playback needs a separate smoke check.

September 12 measurements on M4 Chrome: narrow-screen idle rendering went from 60 frames/second to zero; settled camera-motion frames fell from 417 draw calls / 481,512 triangles to 221 / 109,128. A 390 × 844 phone emulation dropped from 1800 × 3894 framebuffer pixels to 1169 × 2531. Emulation is not a physical-phone performance benchmark.

Keep the fitted camera distance, orbit limits, fog and clipping distances consistent. The entered camera must permit a level view. Static shadow maps are refreshed after suspended assets mount; future moving models/lights will need explicit shadow invalidation. Shared Fox resources intentionally survive component remounts.

A second September 12 pass reduced settled camera-motion frames from 109,128 to 40,640 triangles (63% fewer), keeping 221 draw calls. Rounded edges, Fox spheres/limbs/tail, controller curves and cables use fewer segments. The maximum canvas pixel ratio is 1.25 instead of 1.5, reducing framebuffer area by 31% where the cap applies; portrait phone emulation was already below this cap. Desktop blur filters were removed. All six viewport checks passed with zero idle draws and no geometry rebuild on approach.

`tests/desktop-usability.browser.mjs` uses the same Playwright/Chrome/URL environment variables. It verifies repeated Chrome close/reopen, minimize/restore, maximize/restore, game transitions, browser history/home/reload, outside navigation in separate tabs, and recovery to the plain desktop after simulated WebGL context loss. Arbitrary sites are no longer embedded, preventing blocked frames and nested 3D scenes. The intermittent reported black screen was not reproduced during normal interactions; forced graphics-loss recovery was verified. Recovery remounts the desktop, so open windows reset.

The camera animation pass replaces asymptotic interpolation with a 600 ms smoothstep transition, removes hover-driven camera movement and orbit damping, and pauses video during view changes. In the same desktop Chrome test, returning to the room fell from 1,783 ms to roughly 600 ms. `tests/camera-motion.browser.mjs` verifies the bounded duration, stable hover and delayed playback on repeat visits. Frame pacing was about 17–18 ms at the 95th percentile in the local test; this is not a guarantee for other devices.

Static opaque models with matching materials are batched once, lowering full scene draw calls from 221 to 115 while retaining 40,640 triangles. Textured, transparent and instanced parts stay separate; batching must only wrap models that never move independently. The pixel-ratio cap is now 1, reducing framebuffer area another 36% where the old 1.25 cap applied. DOM desktop text keeps its normal resolution. All six viewport checks passed; scene appearance and desktop controls were checked after batching.
