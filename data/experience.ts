export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export const experience: Experience[] = [
  {
    title: "AI Software Engineer",
    company: "ReVISit",
    location: "Remote",
    period: "Aug 2025 – May 2026",
    highlights: [
      "Contract role building AI video analysis integrated into revisit.dev (100,000+ users; cited in 13 IEEE/CHI papers).",
      "83% faster manual review via confusion timelines; semantic search and cross-clip dashboards with sentence-transformer embeddings.",
    ],
  },
  {
    title: "Peer Learning Assistant",
    company: "WPI Computer Science",
    location: "Worcester, MA",
    period: "Aug 2024 – May 2026",
    highlights: [
      "Office hours, grading feedback, and labs for 300+ students.",
      "Courses: Database Systems II, Machine Learning, Operating Systems, Algorithms, Object-Oriented Design.",
    ],
  },
  {
    title: "Lead Instructor",
    company: "iD Tech Camps",
    location: "Waltham, MA",
    period: "Jun 2025 – Aug 2025",
    highlights: [
      "Managed 18+ instructors across 6+ New England campuses (MIT, UMass, UConn) for 200+ students.",
    ],
  },
  {
    title: "Research Engineer",
    company: "Sri Sangwan School",
    location: "Bangkok, Thailand",
    period: "Jan 2025 – Aug 2025",
    highlights: [
      "Contract: webcam-based assistive gaze interface deployed to 50+ students; scaled to 100+ daily users.",
      "User research with 200+ participants comparing eye tracking, switch, and head controls.",
    ],
  },
  {
    title: "Lead Instructor",
    company: "iD Tech Camps",
    location: "Amherst, MA",
    period: "Jun 2024 – Aug 2024",
    highlights: [
      "Led 8+ staff; taught Python, Java, JavaScript, Unity, Blender, and Lua to ages 10–17.",
    ],
  },
  {
    title: "Online Instructor",
    company: "iD Tech Camps",
    location: "Remote",
    period: "Aug 2023 – Dec 2023",
    highlights: [
      "Delivered individualized online instruction across JavaScript, HTML/CSS, Java, Python, C++, and Scratch.",
    ],
  },
  {
    title: "On-Site Instructor",
    company: "iD Tech Camps",
    location: "Amherst, MA",
    period: "Jun 2023 – Aug 2023",
    highlights: [
      "Week-long courses for ages 10–17; curriculum design, logistics, and safe classroom operations.",
    ],
  },
];
