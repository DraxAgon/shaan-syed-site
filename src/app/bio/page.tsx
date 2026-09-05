import type { Metadata } from "next";
import type { CSSProperties } from "react";

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
    "Shaan Syed on why he chose the Computer Science and BBA double degree at Waterloo and Laurier, shipping Rilo to the Chrome Web Store, aiming for product management, and running, piano, and cooking.",
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
            <figure
              key={photo.src}
              className="bio-frame"
              /* Each print slides in from the rail's own side as it
                 reaches the window, a beat behind the one above it, and
                 stays where it lands. */
              data-reveal="side"
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
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

        {/* The prose and the three lists share the right column, so the
            column runs as long as the rail beside it. With the bio at
            three paragraphs, prose alone ended level with the second
            frame and left the last two hanging against nothing. */}
        <div className="bio-main">
          <div className="bio-prose" data-reveal>
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <section aria-labelledby="edu-h" className="stack-section" data-reveal>
            <h2 id="edu-h" className="stack-heading">
              Education
            </h2>
            <p className="stack-note">{doubleDegree.summary}</p>
            <ul className="edu-list">
              {[...doubleDegree.entries, highSchool].map((entry) => (
                <li key={entry.institution} className="edu-row">
                  <OrgLogo
                    src={entry.logo}
                    name={entry.institution}
                    size={26}
                  />
                  <span className="edu-body">
                    <span className="edu-name">{entry.institution}</span>
                    <span className="muted"> {entry.credential}</span>
                    {entry.note ? (
                      <span className="edu-note">{entry.note}</span>
                    ) : null}
                  </span>
                  <span className="edu-dates">{entry.dates}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="hs-h" className="stack-section" data-reveal>
            <h2 id="hs-h" className="stack-heading">
              High school
            </h2>
            <ul className="plain-list">
              {highSchoolRecord.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="int-h" className="stack-section" data-reveal>
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
      </div>
    </div>
  );
}
