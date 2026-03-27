export interface Skill {
  name: string;
  description: string;
  proficiency: "learning" | "intermediate" | "proficient";
  projects: string[];
}

export const skills: Skill[] = [
  {
    name: "TypeScript & JavaScript",
    description:
      "Strong typing and modern ES features for web apps, tooling, and APIs — paired with semantic HTML/CSS.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham hospital kiosk", "Portfolio"],
  },
  {
    name: "React & Next.js",
    description:
      "Component-driven UIs with React.js and Next.js, plus Bootstrap and Bulma where they fit the stack.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham hospital kiosk", "Portfolio"],
  },
  {
    name: "Node.js & Express",
    description:
      "Server-side JavaScript with Express for APIs and full-stack features alongside PostgreSQL and Prisma.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham hospital kiosk"],
  },
  {
    name: "Data, auth & cloud",
    description:
      "MongoDB and PostgreSQL with Prisma, Auth0 for identity, Docker, and AWS (EC2, RDS) for deployment.",
    proficiency: "proficient",
    projects: ["Brigham hospital kiosk"],
  },
  {
    name: "Python & systems languages",
    description:
      "Python for ML and tooling; Java, C/C++, and C# for coursework, systems, and application work.",
    proficiency: "proficient",
    projects: ["ReVISit", "Eye-Tracking Accessibility Interface"],
  },
  {
    name: "AI / ML integrations",
    description:
      "LLM integration with OpenAI, Anthropic, and Gemini APIs for intelligent features in research tooling.",
    proficiency: "intermediate",
    projects: ["ReVISit"],
  },
];
