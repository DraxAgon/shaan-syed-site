import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page does not exist. Shaan Syed's site has a home page, a bio, projects, and awards.",
};

export default function NotFound() {
  return (
    <div className="rail hero">
      <div className="rail-side" aria-hidden="true" />
      <div className="rail-main">
        <h1 className="page-heading">Page not found</h1>
        <p className="prose-text mt-5">
          That page does not exist. Try{" "}
          <Link className="link" href="/">
            Home
          </Link>
          ,{" "}
          <Link className="link" href="/bio">
            Bio
          </Link>
          ,{" "}
          <Link className="link" href="/projects">
            Projects
          </Link>
          , or{" "}
          <Link className="link" href="/awards">
            Awards
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
