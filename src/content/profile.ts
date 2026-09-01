export type SocialLink = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  subtitle: string;
  /* Written to stay true without edits. The site is a record of what
     has been built, not a status feed, so nothing here says "currently"
     or names a thing in progress. */
  summary: string;
  location: string;
  email: string;
  siteUrl: string;
  socials: SocialLink[];
};

export const profile: Profile = {
  name: "Shaan Syed",
  subtitle: "Computer Science @ Waterloo, Business @ Lazaridis",
  summary:
    "I build software, usually taking it from an idea to something shipped on my own.",
  location: "Toronto, Ontario",
  email: "shaansaifsyed@gmail.com",
  siteUrl: "https://shaan-syed.vercel.app",
  socials: [
    { label: "GitHub", href: "https://github.com/DraxAgon" },
    { label: "LinkedIn", href: "https://linkedin.com/in/shaan-syed-4a6a06306" },
    { label: "Email", href: "mailto:shaansaifsyed@gmail.com" },
  ],
};
