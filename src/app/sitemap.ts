import type { MetadataRoute } from "next";

import { profile } from "@/content/profile";

const routes = [
  { path: "", priority: 1 },
  { path: "/bio", priority: 0.8 },
  { path: "/projects", priority: 0.8 },
  { path: "/resume", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${profile.siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));
}
