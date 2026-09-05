import type { Metadata } from "next";
import { Suspense } from "react";

import { AmbientHalo } from "@/components/ambient-halo";
import { ProjectsBrowser } from "@/components/projects-browser";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Rilo, an AI reply assistant for Gmail on the Chrome Web Store. Redi AI, interview prep generated per role. Phantom, an independent check on forest carbon credits. Loxbox, group photos locked until reveal day.",
};

export default function ProjectsPage() {
  return (
    <>
      {/* Sibling of the page rather than a child of it: .page carries the
          load animation, and a transform on an ancestor is what a fixed
          layer would be positioned against. */}
      <AmbientHalo page="projects" />

      <div className="page">
        <h1 className="page-title">Projects</h1>
        <Suspense fallback={null}>
          <ProjectsBrowser />
        </Suspense>
      </div>
    </>
  );
}
