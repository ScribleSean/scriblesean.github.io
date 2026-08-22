export interface Project {
  name: string;
  role?: string;
  period?: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  metric?: { value: string; label: string };
}

export const projects: Project[] = [
  {
    name: "ReVISit — AI video analysis",
    role: "AI Software Engineer",
    period: "Aug 2025 – May 2026",
    description:
      "Built a full AI video analysis system for revisit.dev — an open-source visualization platform cited in 13 peer-reviewed IEEE/CHI papers with 100,000+ users. Cut manual review time by 83% via clickable confusion timelines across six event types. Designed four pipelines (Gemini multimodal, GPT-4o frame-by-frame, LLaVA/Ollama offline); fused audio, OCR, and scene signals with Tesseract grounding; added semantic search with sentence-transformer embeddings and cross-clip analytics dashboards.",
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
    metric: { value: "83%", label: "faster review" },
  },
  {
    name: "Exercise Form Classification System",
    role: "Deep Learning Engineer",
    period: "Jan 2026 – May 2026",
    description:
      "Two-stage pipeline: YOLOv11 pose estimation (17 COCO keypoints) plus four downstream networks (BiLSTM, Temporal Transformer, TSM, Skeleton CNN). EfficientNet-B0 reached 84.4% exercise classification and 81.9% form-correctness accuracy across 168 classes. Processed 289,000 Qualcomm clips, reducing 100GB+ of video to lightweight (30, 17, 3) tensors.",
    tech: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "YOLOv11",
      "BiLSTM",
      "Transformer",
    ],
    github:
      "https://github.com/ScribleSean/Exercise-Form-Classification-System",
    metric: { value: "84.4%", label: "class accuracy" },
  },
  {
    name: "Sri Sangwan assistive gaze interface",
    role: "Research Engineer",
    period: "Jan 2025 – Aug 2025",
    description:
      "Dual-mode assistive interface using a standard webcam for eye-tracking cursor control and dwell-click — 40% higher precision than typical webcam gaze methods. Deployed for 50+ students with mobility disabilities; expanded to 100+ daily users with a Tobii partnership. Formal user research with 200+ students and teachers informed the final input model; real-time tracking via OpenCV and MediaPipe.",
    tech: ["Python", "OpenCV", "MediaPipe", "User research"],
    github: "https://github.com/ScribleSean",
    metric: { value: "100+", label: "daily users" },
  },
  {
    name: "Brigham and Women's Hospital kiosk",
    role: "Lead Software Engineer",
    period: "Mar 2024 – May 2024",
    description:
      "Led a team of 10 engineers to deliver a full-stack hospital kiosk with 10+ features under AGILE. Auth0 RBAC, AWS EC2, Docker, and PostgreSQL. Wayfinding, appointment management, and payment processing modules.",
    tech: [
      "React",
      "Node.js",
      "Golang",
      "PostgreSQL",
      "Docker",
      "AWS",
      "Auth0",
    ],
    github:
      "https://github.com/ScribleSean/Brigham-and-Womens-Hospital-Web-Application",
    metric: { value: "10", label: "engineers led" },
  },
];
