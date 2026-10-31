import assert from "node:assert/strict";
import test from "node:test";
import {
  BEATS, DATA, SAGE, TILES, TWO_COMPUTERS, TOTAL, WORLD, beatAt, cameraAt, countUp, deskZoom, fit, formatDollars, formatMinutes, historySegments, palette, parseTime,
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
  assert.ok(same(cameraAt(21, 1080, 1100), fit(TWO_COMPUTERS, 1080, 1100)), "portrait pulls back only to the Cost tile and the computer chips");
  const mid = cameraAt(11.8, vw, vh);
  assert.ok(mid.x < fit(TILES[0], vw, vh).x && mid.x > fit(TILES[1], vw, vh).x, "mid-pan sits between tiles");
});

test("the palette is the Sage skin in the page's appearance, light or dark", () => {
  assert.equal(palette(false).background, SAGE.background[0]);
  assert.equal(palette(true).background, SAGE.background[1]);
  for (const key of Object.keys(SAGE) as (keyof typeof SAGE)[]) assert.equal(palette(true)[key], SAGE[key][1]);
});

test("the opening is close on the menu bar item, and pulls back before the panel settles", () => {
  assert.ok(deskZoom(0) > 2.5);
  assert.equal(deskZoom(2.4), deskZoom(0));
  assert.equal(deskZoom(3.4), 1);
  assert.equal(deskZoom(6), 1);
});

test("limit history: each window falls from near 100%, windows never overlap, and every render is identical", () => {
  for (const seed of [7, 31]) {
    const segments = historySegments(seed);
    assert.deepEqual(segments, historySegments(seed));
    assert.ok(segments.length >= 7, "at least one window a day");
    for (const [x1, y1, x2, y2] of segments) {
      assert.ok(x1 >= 0 && x2 <= 800 && x2 > x1, "inside the plot");
      assert.ok(y1 <= 4 && y2 > y1 && y2 <= 196, "falls from near 100% and stays above 0%");
    }
    for (let i = 1; i < segments.length; i++) assert.ok(segments[i][0] > segments[i - 1][2], "a gap at each reset");
  }
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
  for (const beat of BEATS) assert.ok(beat.textAlternative.length > beat.caption.length, `text alternative says more than the caption: ${beat.caption}`);
  assert.match(BEATS.at(-1)!.textAlternative, /git clone https:\/\/github\.com\/ScribleSean\/observatory\.git/);
  assert.match(BEATS.at(-1)!.textAlternative, /npm run setup/);
});

test("the two-computer text matches the numbers on screen", () => {
  const says = BEATS[5].textAlternative;
  for (const value of [formatMinutes(DATA.screen.one), formatMinutes(DATA.screen.two - DATA.screen.one), formatMinutes(DATA.screen.two),
    formatDollars(DATA.cost.one), formatDollars(DATA.cost.two - DATA.cost.one), formatDollars(DATA.cost.two)]) {
    assert.ok(says.includes(value), `beat 6 text includes ${value}`);
  }
});
