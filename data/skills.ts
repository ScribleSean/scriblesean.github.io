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
      "Full-stack web development with TypeScript and JavaScript, plus HTML/CSS for production UIs and tooling.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham kiosk", "Portfolio"],
  },
  {
    name: "React & Next.js",
    description:
      "Component-driven front ends with React and Next.js; Bootstrap and Bulma for rapid layout when needed.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham kiosk", "Portfolio"],
  },
  {
    name: "Node.js & Express",
    description:
      "APIs and server logic with Node.js and Express, paired with PostgreSQL, Prisma, and MongoDB.",
    proficiency: "proficient",
    projects: ["ReVISit", "Brigham kiosk"],
  },
  {
    name: "Data, auth & cloud",
    description:
      "PostgreSQL and MongoDB with Prisma, Auth0 RBAC, Docker containers, and AWS (EC2, RDS) deployments.",
    proficiency: "proficient",
    projects: ["Brigham kiosk"],
  },
  {
    name: "Python & systems languages",
    description:
      "Python for ML, CV, and backends; Java, C/C++, and C# from coursework and application work.",
    proficiency: "proficient",
    projects: [
      "Exercise Form Classification System",
      "ReVISit",
      "Sri Sangwan assistive gaze interface",
    ],
  },
  {
    name: "AI / ML",
    description:
      "LLM APIs (Gemini, GPT-4o), offline LLaVA/Ollama, sentence-transformers, YOLO + LSTM video models, OpenCV, and MediaPipe.",
    proficiency: "proficient",
    projects: [
      "Exercise Form Classification System",
      "ReVISit",
      "Sri Sangwan assistive gaze interface",
    ],
  },
];
