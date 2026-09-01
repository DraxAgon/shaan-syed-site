"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ProjectDemo } from "./project-demo";
import { Icon } from "./icon";
import { hasIcon } from "./icons";
import { projects } from "@/content/projects";

/* Master and detail. The index on the left stays put; only the panel
   on the right changes, and it crossfades so the switch reads as one
   surface updating rather than a page reload. */
export function ProjectsBrowser() {
  const params = useSearchParams();
  const requested = params.get("p");
  const initial = Math.max(
    0,
    projects.findIndex((p) => p.name === requested),
  );

  /* State is adjusted during render rather than in an effect, so a
     ?p= change from the nav menu selects that project without an
     extra render pass. Clicking the index still wins until the URL
     changes again. */
  const [state, setState] = useState({ active: initial, from: requested });

  if (state.from !== requested) {
    const i = projects.findIndex((p) => p.name === requested);
    setState({ active: i >= 0 ? i : state.active, from: requested });
  }

  const active = state.active;
  const setActive = (i: number) => setState({ active: i, from: requested });

  const project = projects[active];

  return (
    <div className="browser">
      <ol className="browser-index">
        {projects.map((p, i) => (
          <li key={p.name}>
            <button
              type="button"
              className={`browser-item${i === active ? " is-active" : ""}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => setActive(i)}
            >
              <span className="browser-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="browser-name">{p.name}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* Keyed on the active index so React remounts the panel and the
          crossfade replays on every switch. */}
      <div className="browser-detail" key={active}>
        {project.demo ? (
          <ProjectDemo
            src={project.demo.src}
            poster={project.demo.poster}
            label={project.demo.label}
            liveUrl={project.demo.liveUrl}
            liveLabel={project.demo.liveLabel}
          />
        ) : project.image ? (
          <Image
            src={project.image}
            alt={`${project.name}, ${project.descriptor}`}
            width={1600}
            height={900}
            sizes="(min-width: 900px) 560px, 100vw"
            className="browser-shot"
            priority={active === 0}
          />
        ) : null}

        <h2 className="browser-title">{project.name}</h2>
        <p className="browser-descriptor">{project.descriptor}</p>
        <p className="browser-status">{project.status}</p>

        {project.award ? (
          <p className="browser-award">
            {project.award}
            {project.awardEvent ? `, ${project.awardEvent}` : ""}
          </p>
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
                <a href={link.href} rel="noopener noreferrer" className="browser-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
