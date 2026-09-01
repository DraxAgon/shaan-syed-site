"use client";

import { useId, useState } from "react";

import { OrgLogo } from "./logo";

/* A compact one-line row that expands to show its detail.
   The whole row is the button, the chevron marks it as openable, and
   the panel animates on grid-template-rows so the height transition
   works without measuring anything. */
export function DisclosureRow({
  logo,
  title,
  aside,
  meta,
  children,
  defaultOpen = false,
}: {
  logo?: string | null;
  title: string;
  aside?: string;
  meta?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={`disclosure${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="disclosure-head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {logo !== undefined ? (
          <span className="disclosure-mark">
            <OrgLogo src={logo} name={title} size={20} />
          </span>
        ) : null}

        <span className="disclosure-title">{title}</span>
        {aside ? <span className="disclosure-aside">{aside}</span> : null}

        <svg
          className="disclosure-chevron"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Not [hidden]: display:none cannot animate. The panel closes
          with grid-template-rows and the inner uses visibility, which
          also takes it out of the tab order and the a11y tree. */}
      <div className="disclosure-panel" id={panelId}>
        <div className="disclosure-panel-inner">
          {meta ? <p className="disclosure-meta">{meta}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
