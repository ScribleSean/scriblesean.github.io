import data from "./featured-projects.json";


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
  iconFullBleed?: boolean;
  mark?: "telescope";
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

export const projectPages = featuredProjects.filter((project) => !project.teaser);

export function getProject(slug: string): FeaturedProject | undefined {
  return projectPages.find((project) => project.slug === slug);
}

export function projectHref(slug: string): string {
  return `/projects/${slug}/`;
}
