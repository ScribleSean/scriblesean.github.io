export interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = [
  {
    name: "ReVISit — Interactive visualization platform",
    description:
      "Software engineer on AI-powered video analysis for screen-recording studies — automated annotation and tagging over 100+ hours of recordings, ML-driven insights from behavioral data, and heavy issue triage (80+ resolved) to improve repo health and team velocity.",
    tech: [
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "ML",
      "LLM APIs",
    ],
    github: "https://github.com/ScribleSean",
  },
  {
    name: "Eye-tracking accessibility interface",
    description:
      "Research developer building dual-mode assistive tech for 50+ students with disabilities — OpenCV/MediaPipe tracking with higher precision than traditional eye-tracking, user research, and documentation for deployment.",
    tech: ["Python", "OpenCV", "MediaPipe", "Research"],
    github: "https://github.com/ScribleSean",
  },
  {
    name: "Brigham and Women’s Hospital kiosk application",
    description:
      "Lead engineer for a full-stack hospital kiosk (10+ features): Auth0 with RBAC for 1,000+ daily users, AWS EC2 + Docker + PostgreSQL at 99.9% uptime, wayfinding, appointments, and payments — cutting patient check-in time by 35%.",
    tech: [
      "Next.js",
      "React",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Auth0",
      "Docker",
      "AWS",
    ],
    github:
      "https://github.com/ScribleSean/Brigham-and-Womens-Hospital-Web-Application",
  },
];
