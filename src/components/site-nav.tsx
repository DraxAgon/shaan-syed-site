"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { projects } from "@/content/projects";

const routes = [
  { href: "/", label: "Home" },
  { href: "/bio", label: "Bio" },
  { href: "/projects", label: "Projects", dropdown: true },
  { href: "/awards", label: "Awards" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLLIElement>(null);

  /* Close on outside click and on Escape, the two things a menu has to
     get right to not feel broken. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav aria-label="Primary" className="site-nav">
      <ul className="nav-list">
        {routes.map((route) => {
          const isCurrent =
            route.href === "/" ? pathname === "/" : pathname.startsWith(route.href);

          if (!route.dropdown) {
            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="nav-link"
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {route.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={route.href} ref={wrap} className="nav-item-menu">
              <Link
                href={route.href}
                className="nav-link"
                aria-current={isCurrent ? "page" : undefined}
              >
                {route.label}
              </Link>
              <button
                type="button"
                className="nav-caret"
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={open ? "Hide project list" : "Show project list"}
                onClick={() => setOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <ul className={`nav-menu${open ? " is-open" : ""}`}>
                {projects.map((project) => (
                  <li key={project.name}>
                    <Link
                      href={`/projects?p=${encodeURIComponent(project.name)}`}
                      className="nav-menu-link"
                      onClick={() => setOpen(false)}
                    >
                      <span>{project.name}</span>
                      <span className="nav-menu-note">{project.descriptor}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
