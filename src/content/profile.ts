export type SocialLink = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  /* The two degrees, one per entry. They are a list rather than one
     string because the home page sets each on its own line and the
     social card runs them together, and a single string left the
     break where the column happened to run out — after the @, with
     the university on the next line. */
  subtitle: string[];
  /* Written to stay true without edits. The site is a record of what
     has been built, not a status feed, so nothing here says "currently"
     or names a thing in progress. The line is a stance rather than a
     claim, because the Built column beside it already carries the
     claims, and a second "I shipped" under the headshot read as
     corny. */
  summary: string;
  location: string;
  email: string;
  siteUrl: string;
  socials: SocialLink[];
};

/* A mailto opens the visitor's mail client, so it must stay in this tab.
   Every other social link leaves the site and gets target="_blank". */
export const isMailto = (href: string) => href.startsWith("mailto:");

export const profile: Profile = {
  name: "Shaan Syed",
  subtitle: ["Computer Science @ Waterloo", "BBA @ Laurier"],
  summary: "I like deciding what software should do as much as writing it.",
  location: "Toronto, Ontario",
  email: "shaansaifsyed@gmail.com",
  siteUrl: "https://shaan-syed.vercel.app",
  socials: [
    { label: "GitHub", href: "https://github.com/DraxAgon" },
    { label: "LinkedIn", href: "https://linkedin.com/in/shaan-syed-4a6a06306" },
    { label: "Email", href: "mailto:shaansaifsyed@gmail.com" },
  ],
};
