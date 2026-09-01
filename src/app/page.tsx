import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";

import { Row, Section } from "@/components/section";
import { awards } from "@/content/awards";
import { certifications } from "@/content/certifications";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { skills } from "@/content/skills";

export const metadata: Metadata = {
  description:
    "Shaan Syed builds software. He shipped Rilo, an AI reply assistant for Gmail, to the Chrome Web Store, and is building Redi AI. Computer Science at Waterloo, Business at Lazaridis.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero. The portrait is exactly the rail width, which is where
          the rail width comes from. */}
      <div className="rail hero">
        <div className="rail-side">
          <Image
            src="/images/portrait-hero.webp"
            alt="Shaan Syed"
            width={1200}
            height={1500}
            priority
            sizes="112px"
            className="portrait-hero"
          />
        </div>
        <div className="rail-main">
          <h1 className="name-heading">{profile.name}</h1>
          <p className="figure-text mt-3 mb-0">{profile.subtitle}</p>
          <p className="prose-text mt-5">{profile.currentWork}</p>

          <ul className="run mt-6 font-mono text-sm">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a className="link" href={social.href} rel="me noopener noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="figure-text mt-4 mb-0">{profile.availability}</p>
        </div>
      </div>

      <Section heading="Experience" id="experience">
        {experience.map((entry) => (
          <Row
            key={`${entry.org}-${entry.role}`}
            as="article"
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
              <span className="org">{entry.org}</span>{" "}
              <span className="role">{entry.role}</span>
            </h3>
            <p className="date-text mt-1 mb-0">
              {entry.meta ? `${entry.meta}, ${entry.location}` : entry.location}
            </p>
            <ul className="bullets">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </Row>
        ))}
      </Section>

      {/* A dated ledger. The year hangs in the rail, the citation sits
          in the measure as one line. */}
      <Section heading="Awards & honours" id="awards">
        {awards.map((award) => (
          <Row
            key={award.title}
            side={
              award.year ? (
                <time className="figure-text" dateTime={award.year}>
                  {award.year}
                </time>
              ) : null
            }
          >
            <p className="prose-text ledger-line">
              {award.title}
              {award.context ? (
                <span className="muted">, {award.context}</span>
              ) : null}
            </p>
          </Row>
        ))}
      </Section>

      <Section heading="Skills" id="skills">
        {skills.map((run) => (
          <Row key={run.label} side={<span>{run.label}</span>}>
            <ul className="run">
              {run.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Row>
        ))}
      </Section>

      <Section heading="Certifications" id="certifications">
        {certifications.map((group) => (
          <Fragment key={group.label}>
            <Row side={<span>{group.label}</span>}>
              <ul className="plain-list">
                {group.items.map((cert) => (
                  <li key={cert.name} className="cert-item">
                    <span className={group.label === "Completed" ? "" : "muted"}>
                      {cert.href ? (
                        <a className="link" href={cert.href} rel="noopener noreferrer">
                          {cert.name}
                        </a>
                      ) : (
                        cert.name
                      )}
                    </span>
                    {cert.issuer || cert.date ? (
                      <span className="date-text">
                        {" "}
                        {[cert.issuer, cert.date].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Row>
          </Fragment>
        ))}
      </Section>
    </>
  );
}
