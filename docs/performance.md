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
