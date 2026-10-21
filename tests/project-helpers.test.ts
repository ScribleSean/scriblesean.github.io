import assert from "node:assert/strict";
import test from "node:test";
import { featuredProjects, getProject, projectHref, projectPages } from "../data/featured-projects";

test("project pages preserve source order and exclude every teaser", () => {
  assert.deepEqual(projectPages.map((project) => project.slug),
    featuredProjects.filter((project) => !project.teaser).map((project) => project.slug));
  assert.ok(featuredProjects.some((project) => project.teaser), "exercise teaser exclusion");
  for (const project of featuredProjects) {
    assert.equal(getProject(project.slug), project.teaser ? undefined : project);
  }
});

test("project lookup returns undefined for absent or inexact slugs", () => {
  const slug = projectPages[0].slug;
  for (const value of ["", "missing-project-雪", ` ${slug}`, `${slug}/`, slug.toUpperCase(), "__proto__", "constructor"]) {
    assert.equal(getProject(value), undefined, value);
  }
});

test("project links use the project route and a trailing slash", () => {
  for (const project of projectPages) {
    assert.equal(projectHref(project.slug), `/projects/${project.slug}/`);
    assert.equal(new URL(projectHref(project.slug), "https://example.com").pathname,
      `/projects/${project.slug}/`);
  }
});
