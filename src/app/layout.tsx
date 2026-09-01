import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

import { SiteNav } from "@/components/site-nav";
import { profile } from "@/content/profile";

import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-serif-src",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono-src",
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: "Shaan Syed",
    template: "%s, Shaan Syed",
  },
  description:
    "Shaan Syed builds software. Computer Science at Waterloo and Business at Lazaridis, currently building Redi AI after shipping Rilo to the Chrome Web Store.",
  authors: [{ name: "Shaan Syed", url: profile.siteUrl }],
  creator: "Shaan Syed",
  openGraph: {
    type: "profile",
    siteName: "Shaan Syed",
    locale: "en_CA",
    url: profile.siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  email: `mailto:${profile.email}`,
  jobTitle: "Software Engineer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Toronto",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  sameAs: [
    "https://github.com/DraxAgon",
    "https://linkedin.com/in/shaan-syed-4a6a06306",
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Waterloo",
      sameAs: "https://uwaterloo.ca",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Wilfrid Laurier University",
      sameAs: "https://wlu.ca",
    },
  ],
  award: "President's Scholarship of Distinction",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <header className="shell pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="rail">
            <div className="rail-side" aria-hidden="true" />
            <div className="rail-main">
              <SiteNav />
            </div>
          </div>
        </header>

        <main id="main" className="shell">
          {children}
        </main>

        <footer className="shell pt-20 pb-16">
          <div className="rail">
            <div className="rail-side" aria-hidden="true" />
            <div className="rail-main">
              <p className="figure-text m-0">{profile.availability}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-1 list-none m-0 mt-4 p-0">
                {profile.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      className="link-quiet font-mono text-sm"
                      href={social.href}
                      rel="me noopener noreferrer"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="figure-text m-0 mt-6 text-[0.8125rem]">
                <span>&copy; {new Date().getFullYear()} Shaan Syed</span>
              </p>
            </div>
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
