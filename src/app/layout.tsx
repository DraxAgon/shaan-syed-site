import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

import { Icon } from "@/components/icon";
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
  title: { default: "Shaan Syed", template: "%s, Shaan Syed" },
  description:
    "Shaan Syed builds software. Rilo, an AI reply assistant for Gmail, is on the Chrome Web Store. Computer Science at Waterloo, Business at Lazaridis.",
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
    { "@type": "CollegeOrUniversity", name: "University of Waterloo", sameAs: "https://uwaterloo.ca" },
    { "@type": "CollegeOrUniversity", name: "Wilfrid Laurier University", sameAs: "https://wlu.ca" },
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

        <header className="site-header">
          <SiteNav />
        </header>

        <main id="main" className="site-main">
          {children}
        </main>

        <footer className="site-footer">
          <ul className="footer-socials">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a className="footer-link" href={social.href} rel="me noopener noreferrer">
                  <Icon name={social.label} size={12} />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="footer-copy">&copy; {new Date().getFullYear()} Shaan Syed</p>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
