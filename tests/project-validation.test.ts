import assert from "node:assert/strict";
import test from "node:test";
import { validateProjectFilm, validateProjectSections } from "../lib/project-validation";

const film = { src: "/projects/x/x.mp4", loop: "/projects/x/x-loop.mp4", poster: "/projects/x/x.jpg", width: 1920, height: 1080, label: "What the film shows", sound: false };

test("project validation accepts a complete film or none", () => {
  assert.doesNotThrow(() => validateProjectFilm({}));
  assert.doesNotThrow(() => validateProjectFilm({ film }));
});

for (const [name, project, message] of [
  ["a film that is not an object", { film: "x.mp4" }, /must be an object/],
  ["a film beside a hero image", { film, hero: {} }, /set one or the other/],
  ["a missing poster", { film: { ...film, poster: undefined } }, /poster/],
  ["a poster that is not a JPEG", { film: { ...film, poster: "/projects/x/x.png" } }, /poster/],
  ["a missing loop", { film: { ...film, loop: undefined } }, /loop/],
  ["a loop that is the full film", { film: { ...film, loop: film.src } }, /its own file/],
  ["a relative src", { film: { ...film, src: "x.mp4" } }, /src/],
  ["a zero width", { film: { ...film, width: 0 } }, /width/],
  ["a blank label", { film: { ...film, label: "  " } }, /label/],
  ["a missing sound flag", { film: { ...film, sound: undefined } }, /sound/],
] as const) {
  test(`project validation rejects ${name}`, () => {
    assert.throws(() => validateProjectFilm(project), message);
  });
}

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
