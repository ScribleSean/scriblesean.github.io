import assert from "node:assert/strict";
import test from "node:test";
import { validateProjectSections } from "../lib/project-validation";

for (const [name, section] of [
  ["missing body", { title: "Example" }],
  ["null body", { title: "Example", body: null }],
  ["string body", { title: "Example", body: "paragraph" }],
  ["object body", { title: "Example", body: {} }],
  ["number body", { title: "Example", body: 42 }],
  ["non-string paragraph", { title: "Example", body: ["valid", null] }],
  ["null section", null],
  ["missing title", { body: ["text"] }],
] as const) {
  test(`project validation rejects ${name}`, () => {
    assert.throws(() => validateProjectSections({ sections: [section] }), /Project section 0/);
  });
}

test("project validation accepts string paragraphs and absent teaser sections", () => {
  for (const project of [{}, { sections: [] }, { sections: [{ title: "Example", body: ["One", "Two"] }] }]) {
    assert.doesNotThrow(() => validateProjectSections(project));
  }
  for (const sections of [null, "wrong", {}]) {
    assert.throws(() => validateProjectSections({ sections }), /sections must be an array/);
  }
});
