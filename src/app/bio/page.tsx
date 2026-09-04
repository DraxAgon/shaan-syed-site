import type { Metadata } from "next";

import { OrgLogo } from "@/components/logo";
import { Photo } from "@/components/photo";
import { bioParagraphs, bioPhotos } from "@/content/bio";
import {
  doubleDegree,
  highSchool,
  highSchoolRecord,
  interests,
} from "@/content/education";

export const metadata: Metadata = {
  title: "Bio",
  description:
    "Shaan Syed on piano and cross country, lifeguarding for the City of Toronto, shipping Rilo to the Chrome Web Store, and a Computer Science and BBA double degree at Waterloo and Laurier.",
};

export default function BioPage() {
  return (
    <div className="page">
      <h1 className="page-title">Bio</h1>

      {/* Two sides: the photos run down the left, the writing holds the
          right. The frames are tilted and offset off each other so the
          rail reads as prints laid out by hand rather than a stack of
          boxes; the angles live in the CSS, not in the data. No captions
          under them on purpose — the prose beside the rail already says
          what they are. */}
      <div className="bio-split">
        <div className="bio-rail">
          {bioPhotos.map((photo, index) => (
            <figure key={photo.src} className="bio-frame">
              <Photo
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 900px) 280px, 44vw"
                priority={index === 0}
                className="bio-photo"
              />
            </figure>
          ))}
        </div>

        <div className="bio-prose">
          {bioParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
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
