import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
try {
  for (const device of [
    { viewport: { width: 877, height: 837 }, deviceScaleFactor: 2 },
    { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  ]) {
    const page = await browser.newPage(device);
    await page.route(/youtube|ytimg|googlevideo/, route => route.abort());
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3124');
    await page.locator('[data-ready="true"]').waitFor();
    await page.getByRole('button', { name: 'click to approach · drag to rotate · scroll to zoom', exact: true }).click();
    await page.waitForTimeout(1800);
    await page.getByRole('button', { name: 'Enter the CRT', exact: true }).click();
    await page.waitForTimeout(2200);
    const check = async () => {
      const result = await page.evaluate(() => {
        const screen = document.querySelector('[data-crt-surface]');
        const rect = screen.getBoundingClientRect();
        const mismatches = [...document.querySelectorAll('[data-desktop-root] button')].filter(button => {
          const r = button.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          const x = r.x + r.width / 2, y = r.y + r.height / 2;
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
          for (let parent = button.parentElement; parent; parent = parent.parentElement) {
            if (!/hidden|clip|auto|scroll/.test(getComputedStyle(parent).overflow)) continue;
            const bounds = parent.getBoundingClientRect();
            if (x < bounds.left || x >= bounds.right || y < bounds.top || y >= bounds.bottom) return false;
          }
          return !button.contains(document.elementFromPoint(x, y));
        }).map(button => button.getAttribute('aria-label'));
        return { x: rect.x + rect.width / 2 - innerWidth / 2, y: rect.y + rect.height / 2 - innerHeight / 2, transform: screen.style.transform, mismatches };
      });
      assert(Math.abs(result.x) < 1 && Math.abs(result.y) < 1, 'Screen must stay centered on the CRT');
      assert(result.transform.startsWith('matrix('), 'Entered desktop must use flat 2D hit testing');
      assert.deepEqual(result.mismatches, [], 'Visible button centers must hit the same buttons');
      return result;
    };
    await check();
    const chrome = page.getByRole('button', { name: 'Portfolio in Chrome', exact: true });
    const rect = await chrome.boundingBox();
    await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.getByRole('heading', { name: 'Hi, I’m Sean.' }).waitFor();
    await check();
    if (!device.isMobile) {
      await page.setViewportSize({ width: device.viewport.width - 117, height: device.viewport.height - 63 });
      await page.waitForTimeout(2200);
      await check();
    }
    console.log(`PASS: ${device.viewport.width}x${device.viewport.height} alignment, button hits and resize`);
    await page.screenshot({ path: `/private/tmp/sean-aligned-${device.viewport.width}.png` });
    await page.close();
  }
} finally { await browser.close(); }
