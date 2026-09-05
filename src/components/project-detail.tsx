"use client";

import dynamic from "next/dynamic";

import { ProjectDemo } from "./project-demo";
import { Icon } from "./icon";
import { hasIcon } from "./icons";
import { Photo } from "./photo";
import { projects, type Project } from "@/content/projects";

/* The walkthrough is one panel of one project, so it is fetched when that
   panel is opened rather than by everyone who lands on /projects. */
const RediDemo = dynamic(() => import("./redi-demo").then((m) => m.RediDemo), {
  ssr: false,
  loading: () => null,
});

/* The detail half of master and detail. One project's panel, rendered by
   that project's own route, with the index beside it held in the layout.
   Keyed on the slug by its caller so the crossfade replays on every
   switch, the way it did when the switch was local state. */
export function ProjectDetail({ project }: { project: Project }) {
  const isFirst = projects[0].slug === project.slug;

  return (
    <div className="browser-detail">
      <h2 className="browser-title">{project.name}</h2>
      <p className="browser-descriptor">{project.descriptor}</p>
      <p className="browser-status">{project.status}</p>

      {/* Where it has got to, kept in its own row and its own shape so it
          reads as a state rather than as another fact about the work. The
          facts beside it are things the prose does not already say. */}
      <ul className="browser-tags">
        <li className="browser-stage" data-stage={project.stage}>
          {project.stage}
        </li>
        {(project.tags ?? []).map((tag) => (
          <li key={tag} className="browser-tag">
            {tag}
          </li>
        ))}
      </ul>

      {project.award ? (
        <p className="browser-award">
          {project.award}
          {project.awardEvent ? `, ${project.awardEvent}` : ""}
        </p>
      ) : null}

      {project.mockup ? (
        <figure className="demo">
          <div className="demo-stage is-mockup">
            <RediDemo />
          </div>
          <figcaption className="demo-caption">
            <span className="demo-caption-text">
              <span className="demo-dot is-mock" aria-hidden="true" />
              {project.mockup.label}
            </span>

            {/* Same shape as every other panel: what the thing is on the
                left, what you are looking at on the right. Redi has no
                page to open beside it, so the chip stands alone. */}
            <span className="demo-modes">
              <span className="demo-mode is-on">The demo</span>
            </span>
          </figcaption>
        </figure>
      ) : project.demo ? (
        <ProjectDemo
          playable={project.demo.playable}
          liveUrl={project.demo.liveUrl}
          liveLabel={project.demo.liveLabel}
          liveZoom={project.demo.liveZoom}
          guide={project.demo.guide}
          scrollImage={project.demo.scrollImage}
          scrollImageWidth={project.demo.scrollImageWidth}
          scrollImageHeight={project.demo.scrollImageHeight}
          scrollLabel={project.demo.scrollLabel}
          hotspots={project.demo.hotspots}
          pageUrl={project.demo.pageUrl}
          pageLabel={project.demo.pageLabel}
          defaultMode={project.demo.defaultMode}
        />
      ) : project.image ? (
        <Photo
          src={project.image}
          alt={`${project.name}, ${project.descriptor}`}
          width={1600}
          height={900}
          sizes="(min-width: 900px) 560px, 100vw"
          className="browser-shot"
          priority={isFirst}
        />
      ) : null}

      {project.prose.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="browser-prose">
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

      {project.links.length > 0 ? (
        <ul className="browser-links">
          {project.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`${link.label}, opens in a new tab`}
                className="browser-link"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Last in the panel by design. Anyone who came for the work has
          already had it above; this is here for whoever wants the reason
          behind it. */}
      {project.why ? (
        <section className="browser-why">
          <h3 className="browser-why-label">Why I built it</h3>
          <p className="browser-why-text">{project.why}</p>
        </section>
      ) : null}
    </div>
  );
}
