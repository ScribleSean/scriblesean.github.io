import assert from "node:assert/strict";
import test from "node:test";
import {
  BEATS, DATA, TILES, TOTAL, WORLD, beatAt, cameraAt, countUp, darkness, fit, formatDollars, formatMinutes, mixHex, paletteAt, parseTime,
} from "../lib/observatory-intro";

test("beats follow the storyboard: seven, back to back, 27 seconds", () => {
  assert.equal(BEATS.length, 7);
  assert.deepEqual(BEATS.map((b) => b.start), [0, 3, 7, 11.5, 15.5, 19.5, 24]);
  for (let i = 1; i < BEATS.length; i++) assert.equal(BEATS[i].start, BEATS[i - 1].start + BEATS[i - 1].length);
  assert.equal(BEATS.at(-1)!.start + BEATS.at(-1)!.length, TOTAL);
  for (const beat of BEATS) assert.ok(beat.caption.split(/\s+/).length <= 7, `at most seven words: ${beat.caption}`);
});

test("beatAt picks the beat that owns a moment, and clamps outside the timeline", () => {
  assert.equal(beatAt(-1), 0);
  assert.equal(beatAt(0), 0);
  assert.equal(beatAt(2.99), 0);
  assert.equal(beatAt(7), 2);
  assert.equal(beatAt(23.99), 5);
  assert.equal(beatAt(99), 6);
});

test("the limits hero number lands at 8.0 s after a 600 ms count", () => {
  const hero = DATA.limits[0].left;
  assert.equal(countUp(7.3, 8, 0, hero), 0);
  assert.ok(countUp(7.7, 8, 0, hero) > 0 && countUp(7.7, 8, 0, hero) < hero);
  assert.equal(countUp(8, 8, 0, hero), hero);
  assert.equal(countUp(12, 8, 0, hero), hero);
});

test("number formats match the dashboard", () => {
  assert.equal(formatMinutes(DATA.screen.one), "3h 53m");
  assert.equal(formatMinutes(DATA.screen.two), "6h 23m");
  assert.equal(formatMinutes(5), "0h 05m");
  assert.equal(formatDollars(DATA.cost.one), "$60.70");
  const rowSum = DATA.cost.rows.reduce((sum, row) => sum + row.value, 0);
  assert.equal(formatDollars(rowSum), formatDollars(DATA.cost.one), "cost rows add up to the tile total");
  const screenSum = DATA.screen.rows.reduce((sum, row) => sum + row.minutes, 0);
  assert.equal(screenSum, DATA.screen.one, "screen rows add up to the tile total");
});

test("fit centres a rect inside the viewport with padding", () => {
  const cam = fit({ x: 100, y: 100, w: 200, h: 100 }, 1000, 600, 50);
  assert.equal(cam.scale, Math.min(900 / 200, 500 / 100));
  assert.equal(cam.x + (100 + 100) * cam.scale, 500);
  assert.equal(cam.y + (100 + 50) * cam.scale, 300);
});

test("camera pushes in on Limits, pans to Screen time and Cost, then pulls back", () => {
  const [vw, vh] = [1920, 860];
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  const same = (a: ReturnType<typeof fit>, b: ReturnType<typeof fit>) => near(a.x, b.x) && near(a.y, b.y) && near(a.scale, b.scale);
  assert.ok(same(cameraAt(6.9, vw, vh), fit(WORLD, vw, vh, 24)));
  assert.ok(same(cameraAt(9, vw, vh), fit(TILES[0], vw, vh)));
  assert.ok(same(cameraAt(14, vw, vh), fit(TILES[1], vw, vh)));
  assert.ok(same(cameraAt(18, vw, vh), fit(TILES[2], vw, vh)));
  assert.ok(same(cameraAt(21, vw, vh), fit(WORLD, vw, vh, 24)));
  const mid = cameraAt(11.8, vw, vh);
  assert.ok(mid.x < fit(TILES[0], vw, vh).x && mid.x > fit(TILES[1], vw, vh).x, "mid-pan sits between tiles");
});

test("light until beat 6, then dark", () => {
  assert.equal(darkness(19.5), 0);
  assert.equal(darkness(21), 1);
  assert.equal(paletteAt(0).background, "#edeae5");
  assert.equal(paletteAt(22).background, "#1c1d1b");
  assert.equal(mixHex("#000000", "#ffffff", 0.5), "#808080");
});

test("parseTime accepts a number on the timeline and rejects junk", () => {
  assert.equal(parseTime(null), null);
  assert.equal(parseTime(""), null);
  assert.equal(parseTime("abc"), null);
  assert.equal(parseTime("8.5"), 8.5);
  assert.equal(parseTime("-3"), 0);
  assert.equal(parseTime("400"), TOTAL);
});

test("every beat has a text alternative, and the end card names the install steps", () => {
  for (const beat of BEATS) assert.ok(beat.says.length > beat.caption.length, `says more than the caption: ${beat.caption}`);
  assert.match(BEATS.at(-1)!.says, /git clone https:\/\/github\.com\/ScribleSean\/observatory\.git/);
  assert.match(BEATS.at(-1)!.says, /npm run setup/);
});
