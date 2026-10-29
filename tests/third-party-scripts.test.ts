import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("Cloudflare beacon is deferred with an explicit unversioned SRI explanation", () => {
  const layout = read("app/layout.tsx");
  const beacon = layout.match(/<Script[\s\S]*?\/>/)?.[0];
  assert.ok(beacon);
  assert.match(beacon, /\bdefer\b/);
  assert.match(beacon, /strategy="afterInteractive"/);
  assert.doesNotMatch(beacon, /type=|integrity=|dangerouslySetInnerHTML/);
  assert.match(layout, /No SRI:.*unversioned URL/);
});
