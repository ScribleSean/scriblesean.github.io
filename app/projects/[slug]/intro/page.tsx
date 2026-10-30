import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ObservatoryIntro from "@/components/projects/ObservatoryIntro";
import { getProject, projectPages } from "@/data/featured-projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectPages.filter((project) => project.intro).map((project) => ({ slug: project.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project?.intro ? { title: `${project.name} intro`, robots: { index: false } } : {};
}

export default async function Page({ params }: Props) {
  const project = getProject((await params).slug);
  if (project?.intro !== "observatory") notFound();
  return <ObservatoryIntro full />;
}
