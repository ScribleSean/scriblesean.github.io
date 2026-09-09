import { projects as resumeProjects } from "./resume";

export interface Project {
  name: string;
  role?: string;
  period?: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  linkLabel?: string;
}

export const projects: Project[] = resumeProjects.map(project => ({
  name: project.name,
  role: project.role,
  period: project.period,
  description: project.portfolioSummary,
  tech: project.tags,
  linkLabel: project.linkLabel,
  ...(project.linkKind === "source" ? { github: project.href } : project.href ? { live: project.href } : {}),
}));
