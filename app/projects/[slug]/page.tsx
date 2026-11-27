import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/projects/ProjectPage";
import { getProject, projectHref, projectPages } from "@/data/featured-projects";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectPages.map((project) => ({ slug: project.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? pageMetadata({ path: projectHref(project.slug), title: project.name, description: `${project.tagline ?? project.summary} A project by Sean Arackal.` }) : {};
}

export default async function Page({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return <ProjectPage project={project} />;
}
