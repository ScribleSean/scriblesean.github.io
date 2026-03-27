export interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = [
  {
    name: "Example API",
    description:
      "A RESTful API placeholder you can replace with your own backend project.",
    tech: ["Node.js", "TypeScript"],
    github: "https://github.com",
    live: "https://example.com",
  },
  {
    name: "Portfolio Site",
    description:
      "This portfolio — built with Next.js, Tailwind, and Framer Motion.",
    tech: ["Next.js", "React", "Tailwind CSS"],
    github: "https://github.com",
  },
  {
    name: "CLI Tool",
    description:
      "A small command-line utility for automating repetitive tasks.",
    tech: ["TypeScript", "Node.js"],
    github: "https://github.com",
  },
  {
    name: "Data Dashboard",
    description:
      "Visualization dashboard for metrics and analytics (placeholder).",
    tech: ["Python", "React"],
    live: "https://example.com",
  },
];
