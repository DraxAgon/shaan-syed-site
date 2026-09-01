export type SkillRun = {
  label: string;
  items: string[];
};

/* Two labelled runs. No separator character: the label sits in the
   rail and proximity does the work punctuation usually does. */
export const skills: SkillRun[] = [
  {
    label: "Languages",
    items: ["Python", "Java", "JavaScript", "TypeScript", "HTML", "CSS", "SQL"],
  },
  {
    label: "Frameworks & tools",
    items: [
      "Next.js",
      "React",
      "React Native",
      "Expo",
      "Tailwind CSS",
      "Firebase (Auth, Firestore, Cloud Functions)",
      "Stripe",
      "Google Gemini API",
      "Chrome Extension APIs",
      "Resend",
      "Vercel",
      "Netlify",
      "Google Cloud Platform",
      "Git",
      "GitHub",
      "VS Code",
      "IntelliJ IDEA",
      "Android Studio",
      "Chrome DevTools",
      "Claude Code",
      "Maestro",
      "Linux",
    ],
  },
];
