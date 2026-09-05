import type { MetadataRoute } from "next";

import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

const routes = [
  { path: "", priority: 1 },
  { path: "/bio", priority: 0.8 },
  /* One entry per project, generated from the same slugs the routes are.
     Adding a project adds its URL here without anyone remembering to.
     No /projects above them: it redirects to the first of the four, and
     a sitemap that lists a redirect asks to be crawled to a page it has
     already said is somewhere else. The first project carries the weight
     the index used to, since it is where the section now opens. */
  ...projects.map((project, i) => ({
    path: `/projects/${project.slug}`,
    priority: i === 0 ? 0.8 : 0.7,
  })),
  { path: "/awards", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${profile.siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));
}
