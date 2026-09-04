export type ExperienceEntry = {
  org: string;
  role: string;
  dates: string;
  meta?: string;
  location: string;
  /* Real logo when one could be sourced from the organisation. When
     null the UI draws a monogram tile instead, which reads as
     deliberate rather than as a missing image. */
  logo: string | null;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
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
    org: "Target Alpha, Northern Secondary School",
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
    org: "Peer Tutoring, Northern Secondary School",
    role: "Peer Tutor",
    dates: "September 2023 to June 2026",
    meta: "Volunteer",
    location: "Toronto, ON",
    logo: "/images/logo-northern.webp",
    bullets: [
      "Tutored math in group sessions, working with roughly 100 students over four years",
      "Ran one-on-one sessions with about ten students",
      "Pushed for a drop-in afterschool study hall, because booking a tutor was what stopped most students from coming, and the program adopted it",
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
];
