export const contact = {
  email: "sean.arackal@gmail.com",
  phone: "+1 (774) 232-5365",
  location: "Worcester, MA, USA",
  linkedin: "https://www.linkedin.com/in/seanarackal/",
  github: "https://github.com/ScribleSean",
};

export const projects = [
  {
    name: "ReVIEW",
    role: "AI Engineer",
    period: "Oct 2025 - May 2026",
    location: "Remote",
    summary: "AI video analysis for reVISit, an open-source visualization platform used by 100,000+ people and cited in 13 peer-reviewed IEEE/CHI papers.",
    outcomes: [
      "Reduced manual video review time by 83%, from 217 seconds to 35.6 seconds per clip.",
      "Designed and benchmarked four multimodal pipelines using Gemini, GPT-4o, LLaVA, audio, OCR, and scene signals.",
      "Built semantic search and cross-clip dashboards with sentence-transformer embeddings.",
    ],
    href: "https://revisit.dev",
    tags: ["TypeScript", "Python", "LLMs", "Tesseract", "Embeddings"],
  },
  {
    name: "Sri Sangwan School",
    role: "Research Engineer",
    period: "Oct 2024 - Mar 2025",
    location: "Bangkok, Thailand",
    summary: "A dual-mode assistive interface using a standard webcam for eye-tracking cursor control and dwell-click selection.",
    outcomes: [
      "Achieved 40% higher precision than standard webcam-based gaze methods.",
      "Deployed for 50+ students with mobility disabilities; the program expanded to 100+ daily users.",
      "Conducted user research with 200+ students and teachers and built real-time tracking with OpenCV and MediaPipe.",
    ],
    href: "https://github.com/ScribleSean",
    tags: ["Python", "OpenCV", "MediaPipe", "Accessibility"],
  },
  {
    name: "Exercise Form Classification System",
    role: "Deep Learning Engineer",
    period: "Jan 2026 - May 2026",
    location: "Worcester, MA",
    summary: "Video classification using YOLO pose estimation and LSTM networks to assess exercise form across 148 exercise types.",
    outcomes: [
      "Targeted 80%+ accuracy and generated actionable feedback through an LLM-powered NLP pipeline.",
      "Preprocessed 289,000 clips and 650,000+ annotations from the Qualcomm dataset.",
      "Evaluated with BLEU and ROUGE against CNN and vision-language baselines.",
    ],
    href: "https://github.com/ScribleSean/Exercise-Form-Classification-System",
    tags: ["YOLO", "LSTM", "PyTorch", "NLP", "Video"],
  },
  {
    name: "Brigham and Women's Hospital Kiosk",
    role: "Lead Software Engineer",
    period: "Mar 2024 - Jun 2024",
    location: "Boston, MA",
    summary: "A full-stack hospital kiosk covering wayfinding, appointments, payments, and role-based access.",
    outcomes: [
      "Led a team of 10 engineers and delivered 10+ features, reducing patient check-in time by 35%.",
      "Architected Auth0 role-based access control for 1,000+ daily users.",
      "Deployed with AWS EC2, Docker, and PostgreSQL at 99.9% uptime.",
    ],
    href: "https://github.com/ScribleSean/Brigham-and-Womens-Hospital-Web-Application",
    tags: ["Next.js", "PostgreSQL", "Auth0", "Docker", "AWS"],
  },
];

export const experience = [
  { company: "Worcester Polytechnic Institute", role: "Peer Learning Assistant", period: "Aug 2024 - May 2026", location: "Worcester, MA", details: "Supported 300+ students through office hours, grading feedback, and labs for Database Systems II, Machine Learning, Operating Systems, Algorithms, and Object-Oriented Design." },
  { company: "iD Tech Camps", role: "Lead Instructor", period: "Jun 2025 - Aug 2025", location: "Waltham, MA", details: "Managed 18+ instructors and coordinated operations, logistics, and curriculum delivery for 200+ students across 6+ New England campuses, including MIT, UMass, and UConn." },
  { company: "iD Tech Camps", role: "Lead Instructor", period: "Jun 2024 - Aug 2024", location: "Amherst, MA", details: "Led 8+ employees, taught students ages 10-17, adapted curricula, and managed daily program logistics." },
  { company: "iD Tech Camps", role: "Online Instructor", period: "Aug 2023 - Dec 2023", location: "Remote", details: "Delivered individualized online instruction, adapting curriculum and technical setup to each student's goals." },
  { company: "iD Tech Camps", role: "On-Site Instructor", period: "Jun 2023 - Aug 2023", location: "Amherst, MA", details: "Taught week-long courses in Python, Java, JavaScript, Unity, Blender, and Lua while supporting curriculum, logistics, and student safety." },
];

export const skills = [
  "Agile Methodology", "AWS EC2", "AWS RDS", "BiLSTM", "C/C++", "Data Structures & Algorithms",
  "EfficientNet", "ffmpeg", "Firebase", "HTML/CSS", "LLM Integration", "LSTM", "Machine Learning",
  "Object-Oriented Design", "Operating Systems", "PostgreSQL", "PyTorch", "RAG Pipelines", "RDBMS",
  "Sentence-Transformers", "Supabase", "Temporal Transformer", "TensorFlow", "Tesseract", "TSM",
  "Vector Embeddings", "Web Development", "Whisper", "YOLO",
];

