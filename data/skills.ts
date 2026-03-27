export interface Skill {
  name: string;
  description: string;
  proficiency: "learning" | "intermediate" | "proficient";
  projects: string[];
}

export const skills: Skill[] = [
  {
    name: "Node.js",
    description:
      "Runtime of choice for tooling, scripts, and server-side work. Replace with your experience.",
    proficiency: "proficient",
    projects: ["Example API", "CLI Tool"],
  },
  {
    name: "TypeScript",
    description:
      "Typed JavaScript for safer refactors and clearer APIs across projects.",
    proficiency: "proficient",
    projects: ["Example API", "CLI Tool", "Portfolio Site"],
  },
  {
    name: "React / Next.js",
    description:
      "Component-driven UIs and the App Router for this site and web apps.",
    proficiency: "intermediate",
    projects: ["Portfolio Site", "Data Dashboard"],
  },
  {
    name: "Python",
    description:
      "Scripts, automation, and data-oriented work. Customize with your stack.",
    proficiency: "intermediate",
    projects: ["Data Dashboard"],
  },
  {
    name: "Flutter",
    description:
      "Cross-platform mobile UIs when you need native-feeling apps on iOS and Android.",
    proficiency: "learning",
    projects: [],
  },
  {
    name: "HTML / CSS / JS",
    description:
      "Foundations of the web — layout, semantics, and progressive enhancement.",
    proficiency: "proficient",
    projects: ["Portfolio Site"],
  },
];
