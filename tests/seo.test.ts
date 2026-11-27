import assert from "node:assert/strict";
import test from "node:test";

import { featured, projectHref, projectPages } from "../data/featured-projects";
import { contact } from "../data/resume";
import { headline, pageMetadata, personName, profileJsonLd, siteUrl, websiteJsonLd } from "../lib/seo";
import sitemap from "../app/sitemap";

const publicPaths = ["/", "/portfolio/", "/projects/", "/resume/", ...projectPages.map((p) => projectHref(p.slug))];

test("each page gets its own canonical URL and og:url", () => {
  for (const path of publicPaths) {
    const meta = pageMetadata({ path, description: "x" });
    assert.equal(meta.alternates?.canonical, path);
    assert.equal((meta.openGraph as { url?: string }).url, path);
    assert.ok(path.endsWith("/"), `${path} must end in / to match trailingSlash`);
  }
});

test("structured data names Sean and matches what the pages show", () => {
  assert.equal(websiteJsonLd["@type"], "WebSite");
  assert.equal(websiteJsonLd.name, personName);
  assert.equal(profileJsonLd["@type"], "ProfilePage");
  const person = profileJsonLd.mainEntity;
  assert.equal(person.name, "Sean Arackal");
  assert.equal(person.description, headline);
  assert.deepEqual(person.sameAs, [contact.github, contact.linkedin]);
  // Structured data stays in line with the visible page and keeps contact details out.
  const json = JSON.stringify(profileJsonLd);
  assert.ok(!json.includes(contact.email) && !json.includes(contact.location), "no email or location in structured data");
});

test("the sitemap lists every public page with a date", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);
  for (const path of publicPaths) assert.ok(urls.includes(`${siteUrl}${path}`), path);
  assert.ok(entries.every((e) => e.lastModified === featured.checkedThrough));
});
