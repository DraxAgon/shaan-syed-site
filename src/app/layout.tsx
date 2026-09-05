import type { Metadata } from "next";
import {
  Source_Serif_4,
  IBM_Plex_Mono,
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
  Geist,
} from "next/font/google";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteNav } from "@/components/site-nav";
import { isMailto, profile } from "@/content/profile";

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

/* Redi's own three faces, for the walkthrough on /projects and nowhere else.
   They are the app's real type system, so the panel reads as the product
   rather than as this site drawing a picture of it: Bricolage Grotesque 700
   for question text and titles, Instrument Sans for everything readable, and
   JetBrains Mono for the uppercase eyebrows and timers.

   preload is off on all three. They are used on one panel of one page, and
   preloading a face the home page never draws is bytes spent on nothing. */
const rediDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  preload: false,
  variable: "--font-display-src",
});

const rediBody = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-body-src",
});

const rediMeta = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  preload: false,
  variable: "--font-meta-src",
});

/* Rilo's face, for the rebuilt Rilo demo on /projects and nowhere else.
   riloai.app is set in Geist, and a demo rebuilt down to its spacing and
   colour would still read as a copy in someone else's type. Not
   preloaded, for the same reason Redi's three are not. */
const riloSans = Geist({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
  variable: "--font-geist-src",
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: "Shaan Syed", template: "%s, Shaan Syed" },
  description:
    "Shaan Syed builds software. Rilo, an AI reply assistant for Gmail, is on the Chrome Web Store. Computer Science at Waterloo, BBA at Laurier.",
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
    <html
      lang="en"
      className={`${serif.variable} ${mono.variable} ${rediDisplay.variable} ${rediBody.variable} ${rediMeta.variable} ${riloSans.variable}`}
    >
      <body>
        {/* First thing in the body, so the class is set while the parser
            is still working through the markup and the elements that
            reveal on scroll are never painted before they are hidden.
            It is also the switch for the whole effect: if this does not
            run, every one of those elements stays visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)" +
              "document.documentElement.classList.add('reveal-ready')}catch(e){}",
          }}
        />

        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <ScrollReveal />

        <header className="site-header">
          <div className="site-header-inner">
            {/* The nav says where you can go. Nothing said whose site you
                were on once you left the home page, so the name rides
                along, drawn with the same brass rule as the share card
                rather than a second logo to keep in step. */}
            <Link href="/" className="brand">
              <span aria-hidden="true" className="brand-rule" />
              <span>{profile.name}</span>
            </Link>
            <SiteNav />
          </div>
        </header>

        <main id="main" className="site-main">
          {children}
        </main>

        <footer className="site-footer">
          <ul className="footer-socials">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  className="footer-link"
                  href={social.href}
                  rel="me noopener noreferrer"
                  target={isMailto(social.href) ? undefined : "_blank"}
                  aria-label={
                    isMailto(social.href)
                      ? undefined
                      : `${social.label}, opens in a new tab`
                  }
                >
                  <Icon name={social.label} size={12} />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Shaan Syed
          </p>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
