import data from "./featured-projects.json";

// Drafted by the update-portfolio agent (.claude/skills/update-portfolio) and
// reviewed by Sean before merging. Edit the JSON, not this file.

export type ProjectImage = {
  src: string;
  darkSrc?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type FeaturedProject = {
  slug: string;
  name: string;
  verb: string;
  status: string;
  summary: string;
  teaser?: boolean;
  kind?: string;
  tagline?: string;
  icon?: string;
  /** The icon image has no macOS-style margin, so the page adds one. */
  iconFullBleed?: boolean;
  mark?: "telescope";
  /** Shown in the hero spot until real screenshots exist. */
  heroPlaceholder?: string;
  hero?: { light: string; dark?: string; width: number; height: number; alt: string };
  sections?: { title: string; body: string[] }[];
  gallery?: ProjectImage[];
  highlights?: string[];
  connects?: { slug: string; text: string }[];
  stack?: string[];
  links?: { label: string; href: string }[];
};

export const featured = data as {
  checkedThrough: string;
  heading: string;
  intro: string;
  projects: FeaturedProject[];
};

export const featuredProjects = featured.projects;

/** Projects that get their own page. Teasers do not. */
export const projectPages = featuredProjects.filter((project) => !project.teaser);

export function getProject(slug: string): FeaturedProject | undefined {
  return projectPages.find((project) => project.slug === slug);
}

export function projectHref(slug: string): string {
  return `/projects/${slug}/`;
}
