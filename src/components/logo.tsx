import Image from "next/image";

/* Draws the organisation's real logo when one exists. When it does
   not, draws a monogram tile instead, so a missing asset still reads
   as a deliberate mark rather than an empty box. */
export function OrgLogo({
  src,
  name,
  size = 22,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={256}
        height={256}
        className="org-logo"
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
