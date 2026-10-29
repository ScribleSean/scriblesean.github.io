type ProjectSections = { sections?: { title: string; body: string[] }[] };

// JSON imports and TypeScript casts do not validate nested data at runtime.
export function validateProjectSections(project: unknown): asserts project is ProjectSections {
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error("Project must be an object");
  }
  const { sections } = project as { sections?: unknown };
  if (sections === undefined) return; // Teasers have no sections.
  if (!Array.isArray(sections)) throw new Error("Project sections must be an array");
  sections.forEach((section, index) => {
    if (!section || typeof section !== "object" || Array.isArray(section) ||
        typeof section.title !== "string" || !Array.isArray(section.body) ||
        !section.body.every((paragraph: unknown) => typeof paragraph === "string")) {
      throw new Error(`Project section ${index}: expected a title and body array of strings`);
    }
  });
}
