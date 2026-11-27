import type { MetadataRoute } from "next";
import { featured, projectHref, projectPages } from "@/data/featured-projects";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = featured.checkedThrough;
  return ["/", "/portfolio/", "/projects/", ...projectPages.map((p) => projectHref(p.slug)), "/resume/"].map((path) => ({ url: `${siteUrl}${path}`, lastModified }));
}
