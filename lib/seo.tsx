import type { Metadata } from "next";
import { contact, education } from "@/data/resume";
import { ogImage } from "@/lib/site";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io").replace(/\/$/, "");
export const personName = "Sean Arackal";
export const headline = "I build AI agents and the tools around them.";
export const homeDescription = "Sean Arackal builds AI agents and the tools around them. A 3D GameCube desk with a working desktop inside the CRT, plus his projects, résumé and contact.";

// Canonical URL, og:url and descriptions per page. Paths end in "/" to match trailingSlash.
export function pageMetadata({ path, title, description }: { path: string; title?: string; description: string }): Metadata {
  const fullTitle = title ? `${title} · ${personName}` : personName;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: personName, locale: "en_US", type: path === "/portfolio/" ? "profile" : "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage] },
  };
}

const person = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: personName,
  alternateName: "ScribleSean",
  url: `${siteUrl}/portfolio/`,
  description: headline,
  alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
  sameAs: [contact.github, contact.linkedin],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: personName,
  alternateName: "ScribleSean",
  url: `${siteUrl}/`,
  author: person,
};

export const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${siteUrl}/portfolio/`,
  mainEntity: person,
};

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so no string in the data can close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
