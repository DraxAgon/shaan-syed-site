import { ProjectsIndex } from "@/components/projects-index";

/* Master and detail, split across a layout and its pages. The index on the
   left is the layout, so it stays mounted and keeps its place while only
   the panel on the right is swapped: the same "one surface updating"
   feeling the query param used to give, now with a URL per project. */
export default function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <div className="browser">
        <ProjectsIndex />
        {children}
      </div>
    </div>
  );
}
