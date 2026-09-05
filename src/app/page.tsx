import type { Metadata } from "next";
import Link from "next/link";

import { AmbientHalo } from "@/components/ambient-halo";
import { CertRow } from "@/components/cert-row";
import { DisclosureRow } from "@/components/disclosure-row";
import { Icon } from "@/components/icon";
import { Photo } from "@/components/photo";
import { hasIcon } from "@/components/icons";
import { softwareCertifications } from "@/content/certifications";
import { experience } from "@/content/experience";
import { isMailto, profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";

export const metadata: Metadata = {
  description:
    "Shaan Syed builds software. Rilo, an AI reply assistant for Gmail, is on the Chrome Web Store. Computer Science at Waterloo, BBA at Laurier.",
};

export default function HomePage() {
  return (
    <>
      {/* Sibling of the page rather than a child of it: .home carries the
          load animation, and a transform on an ancestor is what a fixed
          layer would be positioned against. */}
      <AmbientHalo />

      <div className="home">
        {/* Left: who. Right: what. */}
        <div className="home-identity">
          <Photo
            src="/images/portrait-hero.webp"
            alt="Shaan Syed"
            width={960}
            height={1200}
            priority
            sizes="(min-width: 900px) 208px, 160px"
            className="portrait"
          />

          <h1 className="name">{profile.name}</h1>
          <p className="subtitle">
            {profile.subtitle.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="summary">{profile.summary}</p>

          <ul className="social-row">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  className="social-link"
                  href={social.href}
                  rel="me noopener noreferrer"
                  target={isMailto(social.href) ? undefined : "_blank"}
                  aria-label={
                    isMailto(social.href)
                      ? undefined
                      : `${social.label}, opens in a new tab`
                  }
                >
                  <Icon name={social.label} size={13} />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="home-record">
          {/* Experience leads the column: where he has worked and what
              he did there is the first thing a recruiter looks for, and
              Built below reads as the evidence for it rather than the
              opening claim. */}
          <section aria-labelledby="exp-h">
            <div className="record-head">
              <h2 id="exp-h">Experience</h2>
            </div>
            {experience.map((entry) => (
              <DisclosureRow
                key={`${entry.org}-${entry.role}`}
                logo={entry.logo}
                title={entry.org}
                aside={entry.role}
                meta={entry.meta ? `${entry.dates}, ${entry.meta}` : entry.dates}
              >
                <ul className="panel-bullets">
                  {entry.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </DisclosureRow>
            ))}
          </section>

          <section aria-labelledby="built-h">
            <div className="record-head">
              <h2 id="built-h">Built</h2>
              <Link href="/projects" className="record-more">
                All projects
              </Link>
            </div>
            {projects.map((project) => (
              <DisclosureRow
                key={project.name}
                logo={project.logo}
                logoPlate={false}
                title={project.name}
                aside={project.descriptor}
                meta={project.status}
              >
                {project.prose.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="panel-prose">
                    {paragraph}
                  </p>
                ))}
                <ul className="chip-run">
                  {project.stack.map((item) => (
                    <li key={item}>
                      {hasIcon(item) ? <Icon name={item} size={12} /> : null}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/projects/${project.slug}`} className="panel-link">
                  Open in Projects
                </Link>
              </DisclosureRow>
            ))}
          </section>

          <section aria-labelledby="skills-h" className="skills-block">
            <h2 id="skills-h" className="sr-only">
              Skills
            </h2>
            {skills.map((run) => (
              <p key={run.label} className="skill-run">
                <span className="skill-label">{run.label}:</span>{" "}
                {/* The separator trails its item rather than leading the
                    next one, so a wrapped line never opens with a dot. */}
                {run.items.map((item, i) => (
                  <span key={item} className="skill-item">
                    {hasIcon(item) ? <Icon name={item} size={11} /> : null}
                    <span>{item}</span>
                    {i < run.items.length - 1 ? (
                      <span aria-hidden="true" className="sep">
                        ·
                      </span>
                    ) : null}
                  </span>
                ))}
              </p>
            ))}
          </section>

          {/* Last on the page on purpose: the credential is a footnote to
              the work above, not a headline. Links out to the issuer. */}
          <section aria-labelledby="certs-h">
            <div className="record-head">
              <h2 id="certs-h">Certifications</h2>
              <Link href="/awards" className="record-more">
                All awards
              </Link>
            </div>
            <ul className="ledger">
              {softwareCertifications.map((cert) => (
                <CertRow key={cert.name} cert={cert} />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}