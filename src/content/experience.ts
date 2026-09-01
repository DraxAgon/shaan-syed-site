export type ExperienceEntry = {
  org: string;
  role: string;
  dates: string;
  meta?: string;
  location: string;
  logo: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    org: "City of Toronto",
    role: "Lifeguard",
    dates: "May 2026 to Present",
    meta: "Permanent part-time",
    location: "Toronto, ON",
    logo: "/images/logo-toronto.webp",
    bullets: [
      "Supervises public swim sessions and enforces pool safety rules",
      "Holds current National Lifeguard, Standard First Aid, and CPR-C certification",
    ],
  },
  {
    org: "Strello Health",
    role: "Business Analyst Intern",
    dates: "June 2025 to September 2025",
    location: "Toronto, ON",
    logo: "/images/logo-strello.webp",
    bullets: [
      "Ran market research supporting the company's U.S. expansion",
      "Analyzed competitors and target segments, and summarized findings for the team",
      "The company closed a seed round after the internship",
    ],
  },
  {
    org: "Sumo Dino",
    role: "Seasonal Sales Associate",
    dates: "August 2024 to Present",
    meta: "Seasonal",
    location: "Toronto, ON",
    logo: "/images/logo-sumodino.webp",
    bullets: [
      "Runs a retail booth at the Canadian National Exhibition, selling to walk-up foot traffic",
      "Handles transactions, restocking, and daily setup and teardown",
      "Also worked the company's booth at Fan Expo Toronto",
    ],
  },
  {
    org: "Northern Secondary School Target Alpha Chapter",
    role: "Founder & President",
    dates: "September 2025 to June 2026",
    location: "Toronto, ON",
    logo: "/images/logo-targetalpha.webp",
    bullets: [
      "Founded the chapter and led an 11-person executive team",
      "Prepared members for Target Alpha competitions",
      "Grew it into the second largest Target Alpha chapter in Canada",
    ],
  },
  {
    org: "Northern Secondary School Peer Tutoring Program",
    role: "Peer Tutor",
    dates: "September 2023 to June 2026",
    meta: "Volunteer",
    location: "Toronto, ON",
    logo: "/images/logo-northern.webp",
    bullets: [
      "Tutored math in group sessions, working with roughly 100 students over four years",
      "Ran one-on-one sessions with about ten students",
      "Proposed changes to how the program ran that were adopted",
    ],
  },
];
