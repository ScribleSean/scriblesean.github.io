import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 877, height: 837 } });
  await page.route(/youtube|ytimg|googlevideo/, route => route.abort());
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3124');
  await page.locator('[data-ready="true"]').waitFor();
  // Simulate a stale tab requesting desktop chunks removed by a deployment.
  const chunks = '**/_next/static/chunks/*.js';
  await page.route(chunks, route => route.abort());
  await page.getByRole('button', { name: 'click to approach · drag to rotate · scroll to zoom', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Enter the CRT', exact: true }).click();
  await page.getByRole('button', { name: 'Reload website', exact: true }).waitFor();
  await page.unroute(chunks);
  await page.getByRole('button', { name: 'Reload website', exact: true }).click();
  await page.locator('[data-ready="true"]').waitFor();
  await page.getByRole('button', { name: 'click to approach · drag to rotate · scroll to zoom', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Enter the CRT', exact: true }).click();
  await page.getByRole('button', { name: 'Portfolio in Chrome', exact: true }).waitFor();
  console.log('PASS: failed desktop chunk shows a reload action; reload restores the desktop.');
} finally { await browser.close(); }
