// Run against a served production export. PLAYWRIGHT_MODULE can point to an
// existing Playwright installation; this check adds no runtime dependency.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const base = process.env.TEST_URL || 'http://127.0.0.1:3124';
const results = [];
try {
  for (const device of [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    { name: 'narrow', viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 },
    { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: 'small-phone', viewport: { width: 320, height: 900 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: 'landscape', viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: 'reduced', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, reducedMotion: 'reduce' },
  ].filter(device => !process.env.TEST_DEVICE || device.name === process.env.TEST_DEVICE)) {
    const context = await browser.newContext(device);
    const page = await context.newPage();
    let youtubeRequests = 0;
    page.on('request', r => { if (r.url().includes('youtube.com/iframe_api')) youtubeRequests++; });
    // Playback is tested separately. This isolates rendering from the iframe.
    await context.route(/youtube|ytimg|googlevideo/, route => route.abort());
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.__scenePerf = { calls: 0, triangles: 0, buffers: 0 };
      for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
        for (const key of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
          const original = type.prototype[key];
          if (!original) continue;
          type.prototype[key] = function (...args) {
            window.__scenePerf.calls++;
            if (args[0] === this.TRIANGLES) {
              const count = key.startsWith('drawArrays') ? args[2] : args[1];
              window.__scenePerf.triangles += count / 3 * (key.endsWith('Instanced') ? args[key.startsWith('drawArrays') ? 3 : 4] : 1);
            }
            return original.apply(this, args);
          };
        }
        const clear = type.prototype.clear;
        type.prototype.clear = function (...args) {
          const p = window.__scenePerf;
          p.lastFrame = { calls: p.calls - (p.frameCalls || 0), triangles: p.triangles - (p.frameTriangles || 0) };
          p.frameCalls = p.calls; p.frameTriangles = p.triangles;
          return clear.apply(this, args);
        };
        const original = type.prototype.createBuffer;
        type.prototype.createBuffer = function (...args) { window.__scenePerf.buffers++; return original.apply(this, args); };
      }
    });
    await page.goto(base);
    await page.locator('[data-ready="true"]').waitFor();
    const settle = async (label) => {
      await page.waitForTimeout(3500);
      const before = await page.evaluate(() => window.__scenePerf.calls);
      await page.waitForTimeout(700);
      const after = await page.evaluate(() => window.__scenePerf.calls);
      assert.equal(after, before, `${device.name}: ${label} must stop rendering when idle`);
    };
    await settle('room');
    assert.equal(youtubeRequests, 0, 'YouTube must not load before approach');
    const canvas = await page.locator('canvas').evaluate(c => ({ width: c.width, height: c.height }));
    assert(canvas.width <= device.viewport.width * device.deviceScaleFactor + 2, 'Canvas exceeds physical display width');
    const buffers = await page.evaluate(() => window.__scenePerf.buffers);
    await page.getByRole('button', { name: 'click to approach · drag to rotate · scroll to zoom' }).click();
    await settle('desk');
    assert.equal(youtubeRequests, 1, 'Approach should initialize video once');
    assert.equal(await page.evaluate(() => window.__scenePerf.buffers), buffers, 'Camera state must reuse geometry buffers');
    await page.getByRole('button', { name: 'Enter the CRT', exact: true }).click();
    await settle('entered');
    await page.getByRole('button', { name: 'Portfolio in Chrome', exact: true }).click();
    await page.getByRole('heading', { name: 'Hi, I’m Sean.' }).waitFor();
    if (device.name === 'desktop') {
      // Find the actual portfolio ancestor with native scrolling.
      const selector = await page.getByRole('heading', { name: 'Hi, I’m Sean.' }).evaluate(el => {
        let p = el.parentElement;
        while (p && !(p.scrollHeight > p.clientHeight && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
        if (!p) throw Error('No native portfolio scroll container');
        p.dataset.scrollTest = 'portfolio';
        return '[data-scroll-test="portfolio"]';
      });
      const scroller = page.locator(selector);
      const rect = await scroller.boundingBox();
      await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await page.mouse.wheel(0, 450);
      await page.waitForTimeout(500);
      assert(await scroller.evaluate(el => el.scrollTop) > 0, 'Wheel must scroll the projected portfolio');
      const title = page.locator('[class*="titleBar"]').first();
      const article = page.getByRole('article', { name: 'Sean Arackal • Google Chrome', exact: true });
      const before = await article.boundingBox();
      const t = await title.boundingBox();
      await page.mouse.move(t.x + 90, t.y + t.height / 2); await page.mouse.down();
      await page.mouse.move(t.x + 130, t.y + t.height / 2 + 25, { steps: 5 }); await page.mouse.up();
      const after = await article.boundingBox();
      assert(after.x > before.x + 10, 'Window must drag in scaled coordinates');
    }
    await page.getByRole('button', { name: '↖ back to desk', exact: true }).click();
    await settle('back');
    assert.equal(youtubeRequests, 1, 'Returning to room must keep the initialized player');
    assert.deepEqual(errors, []);
    assert((await page.evaluate(() => window.__scenePerf.lastFrame.triangles)) < 50_000, 'Camera-motion frame exceeds the geometry budget');
    results.push({ device: device.name, canvas, idleDraws: 0, geometryRebuiltOnApproach: false, lastFrame: await page.evaluate(() => window.__scenePerf.lastFrame) });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
