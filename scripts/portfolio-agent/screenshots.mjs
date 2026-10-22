#!/usr/bin/env node
// Full-page screenshots of the project pages in light and dark, at desktop and
// phone widths, for review. Uses the local Google Chrome in headless mode over
// the DevTools protocol, so it needs no extra packages.
//
// Serve the static export first (npm run build, then serve out/), then:
//   node scripts/portfolio-agent/screenshots.mjs [--base http://127.0.0.1:3124] [--out dir] [--phones]
// --phones adds a phone-width shot of every page; by default only the home page gets one.

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const base = flag("base", "http://127.0.0.1:3124").replace(/\/$/, "");
const date = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(root, flag("out", `tmp/portfolio-agent/${date}/screenshots`));
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const data = JSON.parse(readFileSync(path.join(root, "data/featured-projects.json"), "utf8"));
const phones = args.includes("--phones");
const both = ["light", "dark"];
const pages = [
  { name: "home", path: "/", schemes: both, phone: true, waitFor: '[data-ready="true"]', viewportOnly: true },
  { name: "portfolio", path: "/portfolio/", schemes: both },
  { name: "portfolio-projects-section", path: "/portfolio/", schemes: both, selector: "#work" },
  { name: "projects-overview", path: "/projects/", schemes: both },
  ...data.projects.filter((p) => !p.teaser).map((p) => ({ name: `project-${p.slug}`, path: `/projects/${p.slug}/`, schemes: both })),
];
const desktop = { name: "desktop", width: 1280, height: 860, mobile: false, scale: 1 };
const phone = { name: "phone", width: 390, height: 844, mobile: true, scale: 2 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  mkdirSync(outDir, { recursive: true });
  const profile = mkdtempSync(path.join(tmpdir(), "portfolio-shots-"));
  // SwiftShader gives headless Chrome software WebGL for the 3D home page.
  const chrome = spawn(chromePath, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  try {
    const wsUrl = await new Promise((resolve, reject) => {
      let buffer = "";
      chrome.stderr.on("data", (chunk) => {
        buffer += chunk;
        const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) resolve(match[1]);
      });
      chrome.on("exit", () => reject(new Error("Chrome exited before it was ready")));
      setTimeout(() => reject(new Error("Chrome did not start")), 15_000);
    });
    const browser = await connect(wsUrl);
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params = {}) => browser.send(method, params, sessionId);
    await page("Page.enable");

    const written = [];
    const shots = pages.flatMap((entry) => [
      ...entry.schemes.map((scheme) => ({ entry, scheme, viewport: desktop })),
      ...(entry.phone || phones ? [{ entry, scheme: "light", viewport: phone }] : []),
    ]);
    for (const { entry, scheme, viewport } of shots) {
      await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }, { name: "prefers-reduced-motion", value: "reduce" }] });
      await page("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: viewport.scale, mobile: viewport.mobile });
      const loaded = browser.once("Page.loadEventFired", sessionId);
      await page("Page.navigate", { url: `${base}${entry.path}` });
      await loaded;
      if (entry.waitFor) {
        for (let i = 0; i < 60; i++) {
          const { result } = await page("Runtime.evaluate", { expression: `!!document.querySelector(${JSON.stringify(entry.waitFor)})`, returnByValue: true });
          if (result.value) break;
          await sleep(500);
        }
        await sleep(2500);
      }
      await sleep(600);
      const { cssContentSize } = await page("Page.getLayoutMetrics");
      const height = entry.viewportOnly ? viewport.height : Math.max(viewport.height, Math.min(Math.ceil(cssContentSize.height), 12_000));
      await page("Emulation.setDeviceMetricsOverride", { width: viewport.width, height, deviceScaleFactor: viewport.scale, mobile: viewport.mobile });
      await sleep(300);
      let clip;
      if (entry.selector) {
        const { result } = await page("Runtime.evaluate", { expression: `(() => { const r = document.querySelector(${JSON.stringify(entry.selector)}).getBoundingClientRect(); const m = 32; return { x: Math.max(0, r.left + scrollX - m), y: Math.max(0, r.top + scrollY - m), width: Math.min(innerWidth, r.width + 2 * m), height: r.height + 2 * m }; })()`, returnByValue: true });
        clip = { ...result.value, scale: 1 };
      }
      const { data: png } = await page("Page.captureScreenshot", { format: "png", captureBeyondViewport: !entry.viewportOnly, ...(clip ? { clip } : {}) });
      const file = path.join(outDir, `${entry.name}-${scheme}-${viewport.name}.png`);
      writeFileSync(file, Buffer.from(png, "base64"));
      written.push(path.relative(root, file));
    }
    browser.close();
    console.log(`Saved ${written.length} screenshots in ${outDir}`);
  } finally {
    const exited = new Promise((resolve) => chrome.once("exit", resolve));
    chrome.kill();
    await exited;
    rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  }
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 1;
  const pending = new Map();
  const waiters = [];
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method) {
      for (const waiter of [...waiters]) {
        if (waiter.method === message.method && waiter.sessionId === message.sessionId) {
          waiters.splice(waiters.indexOf(waiter), 1);
          waiter.resolve(message.params);
        }
      }
    }
  };
  return {
    send(method, params = {}, sessionId) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    once(method, sessionId) {
      return new Promise((resolve) => waiters.push({ method, sessionId, resolve }));
    },
    close() { socket.close(); },
  };
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
