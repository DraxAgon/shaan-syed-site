import type { NextConfig } from "next";

import { projects, projectsHref } from "./src/content/projects";

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
    return [
      ...projects.map((project) => ({
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
      })),
      /* The index itself. It always rendered the first project, so
         /projects and that project's own URL were the same page under
         two addresses and only one of them said which project you were
         reading. Last in the list, because the four above share this
         source and Next takes the first match: a query goes to the
         project it names, everything else lands here.

         Only /projects exactly. The source is a literal path rather than
         a pattern, so /projects/loxbox does not match it and there is no
         loop back through this rule. */
      {
        source: "/projects",
        destination: projectsHref,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
