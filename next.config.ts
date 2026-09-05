import type { NextConfig } from "next";

import { projects } from "./src/content/projects";

/* Each project used to be a query on one page: /projects?p=Rilo. They are
   real pages now, so the old URLs redirect to them permanently rather than
   landing on the index and dropping whoever followed one on the wrong
   project.

   The match is on the query value, since the path is the same /projects for
   all four. Next parses the query before matching, so "Redi%20AI" arrives
   decoded, but the pattern below accepts the raw encodings too rather than
   depending on that. `value` is compiled as an anchored regex, so the
   alternation has to be written as one. */
const nameQueryPattern = (name: string) =>
  name.split(" ").join("(%20|\\+|\\s)");

const nextConfig: NextConfig = {
  async redirects() {
    return projects.map((project) => ({
      source: "/projects",
      has: [
        {
          type: "query" as const,
          key: "p",
          value: nameQueryPattern(project.name),
        },
      ],
      destination: `/projects/${project.slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
