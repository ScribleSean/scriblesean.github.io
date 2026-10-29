import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("browser test has a runnable script", () => {
  const config = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(config.scripts["test:browser"], "node tests/desktop-usability.browser.mjs");
  const browserTest = readFileSync(new URL("./desktop-usability.browser.mjs", import.meta.url), "utf8");
  assert.match(browserTest, /require\(process\.env\.PLAYWRIGHT_MODULE \|\| 'playwright'\)/);
});
