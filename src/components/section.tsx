import type { ElementType, ReactNode } from "react";

/* The shared rail primitive.

   A section is ONE grid. Rows contribute their two cells as direct
   grid children (Row returns a fragment), so the section heading,
   every org logo and every date all right-align to the same vertical
   axis, and that axis is the measure's left edge. Nesting a second
   .rail inside .rail-main would indent it into the measure and break
   the alignment, which is the whole design. */
export function Section({
  heading,
  id,
  children,
}: {
  heading: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <section className="section rail" aria-labelledby={id}>
      <h2 id={id} className="rail-side section-heading">
        {heading}
      </h2>
      {/* Holds the heading row open on desktop. Hidden on mobile,
          where a single column would turn it into a stray gap. */}
      <div className="rail-main hidden md:block" aria-hidden="true" />
      {children}
    </section>
  );
}

export function Row({
  side,
  children,
  as: Tag = "div",
}: {
  side?: ReactNode;
  children: ReactNode;
  as?: ElementType;
}) {
  return (
    <>
      <div className="rail-side">{side}</div>
      <Tag className="rail-main">{children}</Tag>
    </>
  );
}
