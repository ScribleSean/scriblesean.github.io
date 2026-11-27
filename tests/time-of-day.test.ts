import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import { phaseAt, phaseScript, themeOf } from "../lib/time-of-day";

const at = (hours: number, minutes = 0) => new Date(2026, 10, 27, hours, minutes);

test("the clock picks daylight, golden hour and night", () => {
  assert.equal(phaseAt(at(12)), "day");
  assert.equal(phaseAt(at(7, 45)), "day");
  assert.equal(phaseAt(at(17)), "golden");
  assert.equal(phaseAt(at(6, 30)), "golden");
  assert.equal(phaseAt(at(20)), "night");
  assert.equal(phaseAt(at(2)), "night");
  assert.equal(themeOf("night"), "dark");
  assert.equal(themeOf("golden"), "light");
});

// The inline head script must agree with phaseAt at every minute of the day, and honor a pinned phase.
test("the first-paint script matches phaseAt and the saved choice", () => {
  for (let minute = 0; minute < 24 * 60; minute += 15) {
    const date = at(Math.floor(minute / 60), minute % 60);
    for (const saved of [null, "day", "golden", "night", "junk"]) {
      const root = { dataset: {} as Record<string, string> };
      const RealDate = Date;
      const FakeDate = class extends RealDate { constructor() { super(date.getTime()); } };
      vm.runInNewContext(phaseScript, { Date: FakeDate, document: { documentElement: root }, localStorage: { getItem: () => saved } });
      const expected = saved === "day" || saved === "golden" || saved === "night" ? saved : phaseAt(date);
      assert.equal(root.dataset.phase, expected, `${date.toTimeString()} saved=${saved}`);
      assert.equal(root.dataset.theme, themeOf(expected));
    }
  }
});
