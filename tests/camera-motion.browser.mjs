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
  await page.waitForTimeout(3000);
  assert((await page.evaluate(() => window.__playTimes.length)) > 0, 'Video must autoplay on initial load before interaction');
  const results = [];
  for (const name of ['click to approach · drag to rotate · scroll to zoom', 'Enter the CRT', '↖ back to desk', 'click to approach · drag to rotate · scroll to zoom']) {
    await page.evaluate(() => { window.__drawTimes = []; window.__playTimes = []; window.__motionStarted = performance.now(); });
    await page.getByRole('button', { name, exact: true }).click();
    // A move is a fixed number of frames, so wait for drawing to stop rather than a fixed time.
    let settled = false;
    for (let last = -1, waited = 0; waited < 30000; waited += 1500) {
      await page.waitForTimeout(1500);
      const count = await page.evaluate(() => window.__drawTimes.length);
      if (count === last) { settled = true; break; }
      last = count;
    }
    assert(settled, `${name}: transition kept drawing for 30 s`);
    const result = await page.evaluate(() => {
      const times = window.__drawTimes;
      const gaps = times.slice(1).map((time, index) => time - times[index]).filter(time => time > 1).sort((a, b) => a - b);
      return { durationMs: Math.round(times.at(-1) - times[0]), frames: times.length, p95FrameMs: Math.round(gaps[Math.floor(gaps.length * .95)]) };
    });
    assert(result.frames > 1, 'The test must observe animated frames');
    assert(result.frames < 120, `${name}: restored transition must settle (${result.frames} frames)`);
    if (name.startsWith('click to approach')) {
      await page.evaluate(() => { window.__drawTimes = []; });
      await page.getByRole('button', { name: 'Enter the CRT', exact: true }).hover();
      await page.waitForTimeout(700);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'focus');
      await page.mouse.move(10, 10);
      await page.waitForTimeout(700);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'desk');
      assert((await page.evaluate(() => window.__drawTimes.length)) > 0, 'Hovering must move the camera');
      await page.mouse.click(1060, 450);
      assert.equal(await page.locator('main[data-camera]').getAttribute('data-camera'), 'desk', 'Batched models must still receive clicks');
    }
    results.push({ name, ...result });
  }
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
