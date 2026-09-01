import type { Metadata } from "next";
import Image from "next/image";

import { OrgLogo } from "@/components/logo";
import { bioParagraphs } from "@/content/bio";
import {
  doubleDegree,
  highSchool,
  highSchoolRecord,
  interests,
} from "@/content/education";

export const metadata: Metadata = {
  title: "Bio",
  description:
    "Shaan Syed on piano and cross country, lifeguarding for the City of Toronto, shipping Rilo to the Chrome Web Store, and a Computer Science and Business double degree at Waterloo and Lazaridis.",
};

export default function BioPage() {
  return (
    <div className="page">
      <div className="bio-head">
        <Image
          src="/images/portrait-bio.webp"
          alt="Shaan Syed"
          width={1000}
          height={1000}
          sizes="128px"
          className="portrait portrait-square"
        />
        <h1 className="page-title">Bio</h1>
      </div>

      <div className="bio-prose">
        {bioParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <section aria-labelledby="edu-h" className="stack-section">
        <h2 id="edu-h" className="stack-heading">
          Education
        </h2>
        <p className="stack-note">{doubleDegree.summary}</p>
        <ul className="edu-list">
          {[...doubleDegree.entries, highSchool].map((entry) => (
            <li key={entry.institution} className="edu-row">
              <OrgLogo src={entry.logo} name={entry.institution} size={26} />
              <span className="edu-body">
                <span className="edu-name">{entry.institution}</span>
                <span className="muted"> {entry.credential}</span>
                {entry.note ? <span className="edu-note">{entry.note}</span> : null}
              </span>
              <span className="edu-dates">{entry.dates}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hs-h" className="stack-section">
        <h2 id="hs-h" className="stack-heading">
          High school
        </h2>
        <ul className="plain-list">
          {highSchoolRecord.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="int-h" className="stack-section">
        <h2 id="int-h" className="stack-heading">
          Outside software
        </h2>
        <ul className="plain-list">
          {interests.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
