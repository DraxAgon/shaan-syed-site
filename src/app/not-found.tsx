import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist on shaansyed.dev.",
};

export default function NotFound() {
  return (
    <div className="rail hero">
      <div className="rail-side" aria-hidden="true" />
      <div className="rail-main">
        <h1 className="page-heading">Page not found</h1>
        <p className="prose-text mt-5">
          That page does not exist. The site has four:{" "}
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
          , and{" "}
          <Link className="link" href="/resume">
            Resume
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
