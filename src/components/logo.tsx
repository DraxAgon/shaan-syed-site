import Image from "next/image";

/* Draws the organisation's real logo when one exists. When it does
   not, draws a monogram tile instead, so a missing asset still reads
   as a deliberate mark rather than an empty box.

   plate is the light tile behind the image. Organisation logos are
   drawn for white and need it, or they read as dark squares on this
   ground. The project marks ship their own ground and their own corner
   radius, so they pass plate={false} and are drawn full bleed rather
   than boxed inside a second, paler square. */
export function OrgLogo({
  src,
  name,
  size = 22,
  plate = true,
}: {
  src: string | null;
  name: string;
  size?: number;
  plate?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={256}
        height={256}
        className={plate ? "org-logo" : "org-logo is-bare"}
        style={{ width: size, height: size }}
      />
    );
  }

  const monogram = name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <span
      className="org-logo org-monogram"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {monogram}
    </span>
  );
}
