import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectsBrowser } from "@/components/projects-browser";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Rilo, an AI reply assistant for Gmail on the Chrome Web Store. Redi AI, interview prep generated per role. Phantom, an independent check on forest carbon credits. Loxbox, group photos locked until reveal day.",
};

export default function ProjectsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <Suspense fallback={null}>
        <ProjectsBrowser />
      </Suspense>
    </div>
  );
}
