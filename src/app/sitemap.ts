import type { MetadataRoute } from "next";

import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

const routes = [
  { path: "", priority: 1 },
  { path: "/bio", priority: 0.8 },
  { path: "/projects", priority: 0.8 },
  /* One entry per project, generated from the same slugs the routes are.
     Adding a project adds its URL here without anyone remembering to.
     Below the index, which is the page that leads to all four. */
  ...projects.map((project) => ({
    path: `/projects/${project.slug}`,
    priority: 0.7,
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
