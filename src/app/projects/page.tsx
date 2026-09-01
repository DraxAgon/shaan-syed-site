import type { Metadata } from "next";
import Image from "next/image";

import { Row, Section } from "@/components/section";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Rilo, an AI reply assistant for Gmail on the Chrome Web Store. Redi AI, interview prep generated per role. Phantom, an independent check on forest carbon credits. Loxbox, group photos locked until reveal day.",
};

export default function ProjectsPage() {
  return (
    <>
      <div className="rail hero">
        <div className="rail-side" aria-hidden="true" />
        <div className="rail-main">
          <h1 className="page-heading">Projects</h1>
        </div>
      </div>

      <Section heading="Built" id="built">
        {projects.map((project) => (
          <Row
            key={project.name}
            as="article"
            side={<span>{project.railStatus}</span>}
          >
            <h3 className="project-title">{project.name}</h3>
            <p className="prose-text mt-1">{project.descriptor}</p>
            <p className="date-text mt-1 mb-0">{project.status}</p>

            {/* Sponsor track placement, stated as the award reads. */}
            {project.award ? (
              <p className="date-text mt-1 mb-0">
                {project.award}
                {project.awardEvent ? `, ${project.awardEvent}` : ""}
              </p>
            ) : null}

            {project.image ? (
              <Image
                src={project.image}
                alt={`${project.name}, ${project.descriptor}`}
                width={1600}
                height={900}
                sizes="(min-width: 768px) 680px, 100vw"
                className="project-shot"
              />
            ) : null}

            <div className="mt-4">
              {project.prose.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="prose-text">
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="stack-run mt-4">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {project.links.length > 0 ? (
              <ul className="run mt-3 font-mono text-sm">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a className="link" href={link.href} rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Row>
        ))}
      </Section>
    </>
  );
}
