export interface SkillGroup {
  label: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "AI / ML",
    items: [
      "LLM integration",
      "YOLO",
      "LSTM / Transformers",
      "RAG pipelines",
      "Prompt engineering",
      "Vector embeddings",
      "sentence-transformers",
    ],
  },
  {
    label: "Languages",
    items: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Java",
      "C / C++",
      "C#",
      "HTML / CSS",
    ],
  },
  {
    label: "Frameworks",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "TensorFlow",
      "PyTorch",
      "OpenCV",
      "MediaPipe",
    ],
  },
  {
    label: "Data & cloud",
    items: [
      "PostgreSQL",
      "MongoDB",
      "Prisma",
      "Firebase",
      "Supabase",
      "Docker",
      "AWS EC2 / RDS",
      "Auth0",
    ],
  },
  {
    label: "Tools",
    items: ["Git", "ffmpeg", "Tesseract", "Whisper", "Unity"],
  },
];
