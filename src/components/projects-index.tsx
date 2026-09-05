"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { projects } from "@/content/projects";

/* The master half of master and detail. It lives in the /projects layout,
   so it is rendered once and stays put while the panel beside it changes.
   Every row is a real link to a real page, which is the whole reason the
   query param went away.

   Which row is lit comes from the pathname rather than from state: on
   /projects/<slug> it is that project, and on the index itself it is the
   first one, which is the project the index renders. */
export function ProjectsIndex() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/projects/")
    ? pathname.slice("/projects/".length)
    : projects[0].slug;

  return (
    <ol className="browser-index">
      {projects.map((project, i) => {
        const isActive = project.slug === activeSlug;

        return (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className={`browser-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="browser-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Image
                src={project.logo}
                alt=""
                width={256}
                height={256}
                className="browser-logo"
                style={{ width: 18, height: 18 }}
              />
              <span className="browser-name">{project.name}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
