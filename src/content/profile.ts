export type SocialLink = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  subtitle: string;
  currentWork: string;
  availability: string;
  location: string;
  email: string;
  siteUrl: string;
  socials: SocialLink[];
};

export const profile: Profile = {
  name: "Shaan Syed",
  subtitle: "Computer Science @ Waterloo, Business @ Lazaridis",
  currentWork:
    "I'm building Redi AI, a mobile app for interview prep, after shipping Rilo, an AI reply assistant that works inside Gmail.",
  availability:
    "I'm looking for SWE and product roles, and open to interesting side projects.",
  location: "Toronto, Ontario",
  email: "shaansaifsyed@gmail.com",
  siteUrl: "https://shaan-syed.vercel.app",
  socials: [
    { label: "GitHub", href: "https://github.com/DraxAgon" },
    { label: "LinkedIn", href: "https://linkedin.com/in/shaan-syed-4a6a06306" },
    { label: "Email", href: "mailto:shaansaifsyed@gmail.com" },
  ],
};
