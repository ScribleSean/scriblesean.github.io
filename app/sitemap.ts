import type { MetadataRoute } from "next";
import { projectPages } from "@/data/featured-projects";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/portfolio/", "/resume/", "/projects/", ...projectPages.map((p) => `/projects/${p.slug}/`)].map((path) => ({ url: `${siteUrl}${path}` }));
}
