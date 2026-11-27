// Phone desktop: tap into the CRT on a touch phone and check whichever variant this build uses (lib/site.ts phoneDesktop).
// "crt" keeps the desktop inside the 3D monitor; "fullscreen" fills the phone at its own width.
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.SHOT_DIR || tmpdir();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

const onScreen = (page) => page.evaluate(() => {
  const scale = visualViewport.scale;
  const size = (el) => { const r = el.getBoundingClientRect(); return { w: +(r.width * scale).toFixed(1), h: +(r.height * scale).toFixed(1) }; };
  const root = document.querySelector('[data-desktop-root]');
  const dock = [...document.querySelectorAll('[aria-label="Desktop applications"] button')];
  const clock = root?.querySelector('[data-desktop-clock]');
  const ratio = clock ? clock.getBoundingClientRect().height / clock.offsetHeight : 1;
  return {
    layoutWidth: document.documentElement.clientWidth,
    scale: +scale.toFixed(3),
    desktop: root && size(root),
    dockButtons: dock.map(size),
    clockText: clock ? +(parseFloat(getComputedStyle(clock).fontSize) * ratio * scale).toFixed(1) : null,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
});

try {
  for (const phone of [{ width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const page = await browser.newPage({ viewport: phone, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(/youtube|ytimg|googlevideo/, (route) => route.abort());
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3124');
    await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 });
    const variant = await page.locator('main').getAttribute('data-phone-desktop');
    assert(variant === 'crt' || variant === 'fullscreen', `unknown phone desktop variant ${variant}`);
    const name = `${variant}-${phone.width}`;
    await page.getByRole('button', { name: 'Tap to approach · drag to rotate' }).tap();
    await page.waitForFunction(() => document.querySelector('main').dataset.camera === 'desk');
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Enter the CRT', exact: true }).tap();
    const chrome = page.getByRole('button', { name: 'Portfolio in Chrome', exact: true });
    await chrome.waitFor({ timeout: 30000 });
    await page.waitForTimeout(3000);
    const entered = await onScreen(page);
    await page.screenshot({ path: path.join(out, `phone-${name}-entered.png`) });

    if (variant === 'crt') {
      assert(await page.locator('[data-crt-surface]').count() === 1, 'crt: desktop stays on the 3D screen');
      assert.equal(entered.layoutWidth, phone.width, 'crt: page lays out at the phone width');
      assert(!page.url().includes('view=portfolio'), 'crt: no full-screen route');
    } else {
      assert(page.url().includes('view=portfolio'), 'fullscreen: opens the full-screen route');
      assert.equal(await page.locator('[data-crt-surface]').count(), 0, 'fullscreen: 3D scene is not under the desktop');
      assert.equal(entered.layoutWidth, phone.width, 'fullscreen: lays out at the phone width');
      assert(Math.abs(entered.scale - 1) < 0.01, 'fullscreen: no zoom-out');
      assert(Math.abs(entered.desktop.w - phone.width) < 1 && Math.abs(entered.desktop.h - phone.height) < 1, 'fullscreen: desktop fills the phone');
      assert(entered.dockButtons.every((b) => b.h >= 44 && b.w >= 42), `fullscreen: dock buttons finger-sized ${JSON.stringify(entered.dockButtons)}`);
      assert(entered.clockText >= 13, 'fullscreen: top bar text readable');
      assert(!entered.overflowX, 'fullscreen: no sideways scroll');
    }

    await chrome.tap();
    await page.locator('[data-desktop-window="chrome"]').getByRole('heading', { name: 'Sean Arackal', level: 1 }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(out, `phone-${name}-chrome.png`) });
    if (variant === 'fullscreen') {
      const frame = await page.locator('[data-desktop-window="chrome"]').boundingBox();
      assert(frame.x >= 0 && frame.y >= 44 && frame.x + frame.width <= phone.width && frame.y + frame.height <= phone.height - 60, `fullscreen: window between top bar and dock ${JSON.stringify(frame)}`);
      assert(frame.width >= phone.width - 30, 'fullscreen: window uses the full width');
      // Messages: the field must be 16px so focusing it does not zoom the page.
      await page.getByRole('button', { name: 'Message Sean', exact: true }).tap();
      const field = page.locator('[data-desktop-window="messages"] textarea, [data-desktop-window="messages"] input').first();
      await field.waitFor();
      assert(parseFloat(await field.evaluate((el) => getComputedStyle(el).fontSize)) >= 16, 'fullscreen: message field is 16px');
      await page.screenshot({ path: path.join(out, `phone-${name}-messages.png`) });
      // Back to the room: the 3D scene comes back at the phone width.
      await page.getByRole('button', { name: 'Back to the desk', exact: true }).tap();
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('main').dataset.camera === 'room');
      assert(!page.url().includes('view=portfolio'), 'fullscreen: back leaves the full-screen route');
      assert.equal(await page.evaluate(() => document.documentElement.clientWidth), phone.width, 'fullscreen: room stays at phone width');
      // The footer contact link opens Messages full screen too.
      await page.getByRole('button', { name: 'Contact', exact: true }).tap();
      await page.locator('[data-desktop-window="messages"]').waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.clientWidth), phone.width, 'fullscreen: contact opens at phone width');
      await page.goBack();
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 });
      assert.equal(await page.evaluate(() => document.documentElement.clientWidth), phone.width, 'fullscreen: system back restores the room');
    }
    assert.deepEqual(errors, [], 'no page errors');
    console.log(`PASS: ${name} ${JSON.stringify({ dock: entered.dockButtons[0], clockText: entered.clockText, scale: entered.scale })}`);
    await page.close();
  }
} finally { await browser.close(); }
