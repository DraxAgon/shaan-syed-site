import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/project-detail";
import { projectBySlug, projectSlugs } from "@/content/projects";

type Params = { params: Promise<{ slug: string }> };

/* The four slugs are the whole set, so the whole set is prerendered and
   nothing else is served: an unknown slug is a 404 rather than a page
   built on the spot for a project that does not exist. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);

  if (!project) return {};

  /* The layout's template appends ", Shaan Syed". The descriptor rides in
     the title because it is the line that tells a search result what the
     name means. */
  const title = `${project.name}, ${project.descriptor}`;
  const path = `/projects/${project.slug}`;

  return {
    title,
    description: project.metaDescription,
    /* One canonical per project, so the old query URL and the index do not
       compete with the page they point at. */
    alternates: { canonical: path },
    /* openGraph replaces the root's rather than merging into it, so the
       fields worth keeping are restated here. The share card itself comes
       from the opengraph-image beside this file, which is why images is
       left unset. */
    openGraph: {
      type: "article",
      siteName: "Shaan Syed",
      locale: "en_CA",
      title,
      description: project.metaDescription,
      url: path,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);

  if (!project) notFound();

  return <ProjectDetail key={project.slug} project={project} />;
}
