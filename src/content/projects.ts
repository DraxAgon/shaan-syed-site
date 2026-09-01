export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  name: string;
  descriptor: string;
  /* Short enough to sit in the 112px rail. */
  railStatus: string;
  status: string;
  /* The award name is fixed wording. "3rd Place, Best Use of Base44"
     is a sponsor track placement, not an overall hackathon result. */
  award?: string;
  awardEvent?: string;
  prose: string[];
  stack: string[];
  links: ProjectLink[];
  /* Optional. Set the path once a real screenshot exists in
     public/images. Left unset, the entry renders as prose with no
     empty box. See public/images/PLACEHOLDERS.md. */
  image?: string;
};

export const projects: Project[] = [
  {
    name: "Rilo",
    descriptor: "AI reply assistant for Gmail",
    railStatus: "Live",
    status: "On the Chrome Web Store since July 2026",
    prose: [
      "Most AI email tools ask for full OAuth inbox access to read, send, and store your mail. Rilo reads only the email currently open on screen, never touches the rest of the inbox, never sends anything, and never stores your email.",
      "Each reply comes back as a few drafts across different tones and intents rather than one generic answer. Rilo was the first product I built and shipped end to end.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Chrome Extension APIs (Manifest V3)",
      "Firebase Auth",
      "Firestore",
      "Stripe",
      "Resend",
      "Google Gemini API",
      "Netlify",
    ],
    links: [{ label: "riloai.app", href: "https://riloai.app" }],
    image: "/images/project-rilo.webp",
  },
  {
    name: "Redi AI",
    descriptor: "Interview prep, generated per role",
    railStatus: "In development",
    status: "Mobile, and what I spend most of my time on now",
    prose: [
      "You describe a role, whether that's a job, a scholarship, or a program, and Redi generates a question set for it. Answer out loud and it scores what you said.",
      "Update the role and the questions regenerate around it.",
    ],
    stack: [
      "React Native",
      "Expo",
      "TypeScript",
      "Firebase",
      "Google Gemini API",
    ],
    links: [],
  },
  {
    name: "Phantom",
    descriptor: "Independent check on forest carbon credits",
    railStatus: "Team build",
    status: "Environmental track",
    award: "3rd Place, Best Use of Base44",
    awardEvent: "Ignition Hacks 2026",
    prose: [
      "Carbon credit projects claim they prevented deforestation that would otherwise have happened. Phantom checks that claim against free public satellite data by comparing the protected land to similar unprotected land nearby. If both cleared at the same rate, the credit is not buying anything.",
      "It outputs a year-by-year clearing view inside the project boundary, the project's auditor and the buyers holding its credits, and a PDF export.",
    ],
    stack: ["Public satellite forest-loss datasets", "Base44"],
    /* The Ignition Hacks repo is private, so linking it would 404 for
       every visitor. Add the link back once it is public, or add the
       Base44 app URL when there is one. */
    links: [],
  },
  {
    name: "Loxbox",
    descriptor: "Group photos, locked until reveal day",
    railStatus: "In development",
    status: "Mobile",
    prose: [
      "A group makes a box and picks a reveal date. Everyone adds photos to it and nobody sees a single one until the timer hits zero, when the whole box opens at once.",
    ],
    stack: ["React Native", "Expo", "TypeScript", "Firebase"],
    links: [],
  },
];
