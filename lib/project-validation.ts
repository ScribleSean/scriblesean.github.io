type ProjectSections = { sections?: { title: string; body: string[] }[] };

// JSON imports and TypeScript casts do not validate nested data at runtime.
export function validateProjectSections(project: unknown): asserts project is ProjectSections {
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error("Project must be an object");
  }
  const { sections } = project as { sections?: unknown };
  if (sections === undefined) return;
  if (!Array.isArray(sections)) throw new Error("Project sections must be an array");
  sections.forEach((section, index) => {
    if (!section || typeof section !== "object" || Array.isArray(section) ||
        typeof section.title !== "string" || !Array.isArray(section.body) ||
        !section.body.every((paragraph: unknown) => typeof paragraph === "string")) {
      throw new Error(`Project section ${index}: expected a title and body array of strings`);
    }
  });
}

// A film needs its full cut, a silent loop, a poster, its size and a text alternative.
export function validateProjectFilm(project: unknown): void {
  const { film, hero } = (project ?? {}) as { film?: unknown; hero?: unknown };
  if (film === undefined) return;
  if (!film || typeof film !== "object" || Array.isArray(film)) throw new Error("Project film must be an object");
  if (hero !== undefined) throw new Error("Project film replaces the hero image; set one or the other");
  const { src, loop, poster, width, height, label, sound } = film as Record<string, unknown>;
  for (const [field, value, extension] of [["src", src, ".mp4"], ["loop", loop, ".mp4"], ["poster", poster, ".jpg"]] as const) {
    if (typeof value !== "string" || !value.startsWith("/") || !value.endsWith(extension)) {
      throw new Error(`Project film ${field}: expected a site path ending in ${extension}`);
    }
  }
  if (src === loop) throw new Error("Project film loop must be its own file");
  for (const [field, value] of [["width", width], ["height", height]] as const) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) throw new Error(`Project film ${field}: expected a positive whole number`);
  }
  if (typeof label !== "string" || !label.trim()) throw new Error("Project film label: describe what the film shows");
  if (typeof sound !== "boolean") throw new Error("Project film sound: expected true or false");
}
