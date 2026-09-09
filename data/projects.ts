import { projects as resumeProjects } from "./resume";

export interface Project {
  name: string;
  role?: string;
  period?: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = resumeProjects.map(project => ({
  name: project.name,
  role: project.role,
  period: project.period,
  description: project.portfolioSummary,
  tech: project.tags,
  ...(project.href.startsWith("https://github.com/") ? { github: project.href } : { live: project.href }),
}));
