export interface Project {
  name: string;
  role?: string;
  period?: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

export const projects: Project[] = [
  {
    name: "Exercise Form Classification System",
    role: "Deep Learning Engineer",
    period: "Jan 2026 – Present",
    description:
      "Video classification with YOLO pose estimation and LSTM networks across 148 exercise types (80%+ target accuracy). Built an NLP pipeline with LLM APIs to turn pose output into natural-language feedback. Preprocessed 289,000 video clips and 650,000+ annotations from the Qualcomm dataset; evaluated with BLEU/ROUGE, outperforming baseline CNN and vision-language models.",
    tech: [
      "Python",
      "TensorFlow",
      "YOLO",
      "LSTM",
      "OpenCV",
      "LLM APIs",
    ],
    github:
      "https://github.com/ScribleSean/Exercise-Form-Classification-System",
  },
  {
    name: "ReVISit — AI video analysis",
    role: "AI Software Engineer",
    period: "Aug 2025 – May 2026",
    description:
      "Built a full AI video analysis system for revisit.dev — an open-source visualization platform cited in 13 peer-reviewed IEEE/CHI papers with 100,000+ users. Cut manual review time by 83% (217s → 35.6s per clip) via clickable confusion timelines across six event types. Designed four pipelines (Gemini multimodal, GPT-4o frame-by-frame, LLaVA/Ollama offline); fused audio, OCR, and scene signals with Tesseract grounding; added semantic search with sentence-transformer embeddings and cross-clip analytics dashboards.",
    tech: [
      "TypeScript",
      "React",
      "Python",
      "Gemini",
      "GPT-4o",
      "LLaVA",
      "Tesseract",
    ],
    live: "https://revisit.dev",
  },
  {
    name: "Sri Sangwan assistive gaze interface",
    role: "Research Engineer",
    period: "Jan 2025 – Aug 2025",
    description:
      "Dual-mode assistive interface using a standard webcam for eye-tracking cursor control and dwell-click — 40% higher precision than typical webcam gaze methods. Deployed for 50+ students with mobility disabilities; expanded to 100+ daily users with a Tobii partnership. Formal user research with 200+ students and teachers informed the final input model; real-time tracking via OpenCV and MediaPipe with full technical documentation.",
    tech: ["Python", "OpenCV", "MediaPipe", "User research"],
    github: "https://github.com/ScribleSean",
  },
  {
    name: "Brigham and Women's Hospital kiosk",
    role: "Lead Software Engineer",
    period: "Mar 2024 – Jun 2024",
    description:
      "Led 10 engineers on a full-stack hospital kiosk with 10+ features, reducing patient check-in time by 35%. Auth0 RBAC for 1,000+ daily users; AWS EC2, Docker, and PostgreSQL at 99.9% uptime. Wayfinding, appointment management, and payment processing modules.",
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
