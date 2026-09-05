import type { Metadata } from "next";

import { ProjectDetail } from "@/components/project-detail";
import { projects } from "@/content/projects";

/* The index keeps the four-in-one description, because the page is the
   four of them. Each project's own page says only its own thing. */
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Rilo, an AI reply assistant for Gmail on the Chrome Web Store. Redi AI, interview prep generated per role. Phantom, an independent check on forest carbon credits. Loxbox, group photos locked until reveal day.",
  alternates: { canonical: "/projects" },
};

/* The index lists all four in the rail beside it, and opens on the first,
   which is what /projects has always done. */
export default function ProjectsPage() {
  const project = projects[0];

  return <ProjectDetail key={project.slug} project={project} />;
}
