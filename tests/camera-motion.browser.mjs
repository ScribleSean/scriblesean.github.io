import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.route(/youtube|ytimg|googlevideo/, route => route.abort());
  await page.addInitScript(() => {
    window.__drawTimes = [];
    window.__playTimes = [];
    window.YT = { Player: class {
      constructor(element, options) { this.options = options; setTimeout(() => options.events.onReady({ target: this }), 0); }
      getCurrentTime() { return 17; }
      mute() {}
      seekTo() {}
      pauseVideo() {}
      destroy() {}
      playVideo() { window.__playTimes.push(performance.now()); this.options.events.onStateChange({ data: 1, target: this }); }
    } };
    const original = WebGL2RenderingContext.prototype.clear;
    WebGL2RenderingContext.prototype.clear = function (...args) {
      window.__drawTimes.push(performance.now());
      return original.apply(this, args);
    };
  });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3124');
  await page.locator('[data-ready="true"]').waitFor();
  await page.waitForTimeout(1200);
  const results = [];
  for (const name of ['click to approach · drag to rotate · scroll to zoom', 'Enter the CRT', '↖ back to desk', 'click to approach · drag to rotate · scroll to zoom']) {
    await page.evaluate(() => { window.__drawTimes = []; window.__playTimes = []; window.__motionStarted = performance.now(); });
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(1200);
    const result = await page.evaluate(() => {
      const times = window.__drawTimes;
      const gaps = times.slice(1).map((time, index) => time - times[index]).filter(time => time > 1).sort((a, b) => a - b);
      return { durationMs: Math.round(times.at(-1) - times[0]), frames: times.length, p95FrameMs: Math.round(gaps[Math.floor(gaps.length * .95)]) };
    });
    assert(result.frames > 1, 'The test must observe animated frames');
    assert(result.durationMs < 900, `${name}: transition must finish without a long easing tail`);
    if (name.startsWith('click to approach')) {
      const playDelay = await page.evaluate(() => window.__playTimes[0] - window.__motionStarted);
      assert(playDelay < 500, 'Playback must start without waiting for camera movement');
      await page.evaluate(() => { window.__drawTimes = []; });
      await page.getByRole('button', { name: 'Enter the CRT', exact: true }).hover();
      await page.waitForTimeout(700);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'focus');
      await page.mouse.move(10, 10);
      await page.waitForTimeout(700);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'desk');
      assert((await page.evaluate(() => window.__drawTimes.length)) > 0, 'Hovering must move the camera');
      // Visible GameCube body at this fixed desktop camera/viewport.
      await page.mouse.click(1060, 450);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'desk', 'Batched models must still receive clicks');
    }
    results.push({ name, ...result });
  }
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
