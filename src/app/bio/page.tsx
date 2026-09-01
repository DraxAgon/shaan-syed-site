import type { Metadata } from "next";
import Image from "next/image";

import { Row, Section } from "@/components/section";
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
    "Shaan Syed on shipping Rilo to the Chrome Web Store, building Phantom at Ignition Hacks, and starting a Computer Science and Business double degree at Waterloo and Lazaridis.",
};

export default function BioPage() {
  return (
    <>
      <div className="rail hero">
        <div className="rail-side">
          <Image
            src="/images/portrait-bio.webp"
            alt="Shaan Syed"
            width={1000}
            height={1000}
            sizes="112px"
            className="portrait-bio"
          />
        </div>
        <div className="rail-main">
          <h1 className="page-heading">Bio</h1>
          <div className="mt-6">
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="prose-text">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <Section heading="Education" id="education">
        <Row side={<span>{doubleDegree.heading}</span>}>
          <p className="prose-text">{doubleDegree.summary}</p>
        </Row>

        {doubleDegree.entries.map((entry) => (
          <Row
            key={entry.institution}
            side={
              <>
                <Image
                  src={entry.logo}
                  alt=""
                  width={256}
                  height={256}
                  sizes="28px"
                  className="logo-tile"
                />
                <span className="block mt-2 date-text">{entry.dates}</span>
              </>
            }
          >
            <h3 className="entry-title">
              <span className="org">{entry.institution}</span>{" "}
              <span className="role">{entry.credential}</span>
            </h3>
            {entry.note ? (
              <p className="date-text mt-1 mb-0">{entry.note}</p>
            ) : null}
          </Row>
        ))}

        <Row
          side={
            <>
              <Image
                src={highSchool.logo}
                alt=""
                width={256}
                height={256}
                sizes="28px"
                className="logo-tile"
              />
              <span className="block mt-2 date-text">{highSchool.dates}</span>
            </>
          }
        >
          <h3 className="entry-title">
            <span className="org">{highSchool.institution}</span>{" "}
            <span className="role">{highSchool.credential}</span>
          </h3>
          {highSchool.note ? (
            <p className="date-text mt-1 mb-0">{highSchool.note}</p>
          ) : null}
        </Row>
      </Section>

      {/* Context, not a second resume. */}
      <Section heading="High school" id="high-school">
        <Row>
          <ul className="plain-list">
            {highSchoolRecord.map((item) => (
              <li key={item} className="ledger-line">
                {item}
              </li>
            ))}
          </ul>
        </Row>
      </Section>

      <Section heading="Interests" id="interests">
        <Row>
          <ul className="run">
            {interests.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Row>
      </Section>
    </>
  );
}
