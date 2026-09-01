import type { Metadata } from "next";

import { awards } from "@/content/awards";
import { certifications } from "@/content/certifications";

export const metadata: Metadata = {
  title: "Awards",
  description:
    "3rd Place, Best Use of Base44 at Ignition Hacks 2026. President's Scholarship of Distinction at the University of Waterloo. Google Cloud Generative AI Leader, National Lifeguard, and Royal Life Saving Society certifications.",
};

export default function AwardsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Awards</h1>

      <section aria-labelledby="honours-h" className="stack-section">
        <h2 id="honours-h" className="stack-heading">
          Honours
        </h2>
        <ul className="ledger">
          {awards.map((award) => (
            <li key={award.title} className="ledger-row">
              <span className="ledger-year">{award.year ?? ""}</span>
              <span className="ledger-body">
                {award.title}
                {award.context ? <span className="muted">, {award.context}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {certifications.map((group) => (
        <section
          key={group.label}
          aria-labelledby={`cert-${group.label.replace(/\s+/g, "-")}`}
          className="stack-section"
        >
          <h2
            id={`cert-${group.label.replace(/\s+/g, "-")}`}
            className="stack-heading"
          >
            {group.label}
          </h2>
          <ul className="ledger">
            {group.items.map((cert) => (
              <li key={cert.name} className="ledger-row">
                <span className="ledger-year">{cert.date ?? ""}</span>
                <span
                  className={`ledger-body${group.label === "In progress" ? " muted" : ""}`}
                >
                  {cert.href ? (
                    <a
                      className="inline-link"
                      href={cert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${cert.name}, opens the credential in a new tab`}
                    >
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                  {cert.issuer ? <span className="muted">, {cert.issuer}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
