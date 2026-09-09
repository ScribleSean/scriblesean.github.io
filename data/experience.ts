import { experience as resumeExperience } from "./resume";

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export const experience: Experience[] = resumeExperience.map(job => ({
  title: job.role,
  company: job.company,
  location: job.location,
  period: job.period,
  highlights: [job.details],
}));
