import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";
import { projectBySlug } from "@/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Tokens mirrored from globals.css, as on the site card. The project card
   is that same card with the project's name in the measure, so a shared
   link reads as this site rather than as a second visual system. */
const PLATE = "#17120E";
const INK = "#F0EAE1";
const INK_MUTED = "#A29790";
const BRASS = "#D9A441";

/* Here only for the alt text: it is the one hook that sees the slug, so it
   is the only way each card can describe the project it is actually of
   rather than repeating one line four times.

   The id is fixed. It names the image within the segment, not the project,
   which the path already carries; and Next collects these ids once with no
   params in hand, so an id read off the slug would come back empty there. */
export function generateImageMetadata({
  params,
}: {
  params?: { slug?: string };
}) {
  const project = params?.slug ? projectBySlug(params.slug) : undefined;

  return [
    {
      id: "card",
      alt: project
        ? `${project.name}, ${project.descriptor}`
        : `${profile.name}, ${profile.subtitle.join(" and ")}`,
      size,
      contentType,
    },
  ];
}

export default async function ProjectOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PLATE,
          padding: "96px 100px",
        }}
      >
        {/* The rail. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: 180,
            paddingTop: 14,
          }}
        >
          <div style={{ display: "flex", width: 56, height: 3, backgroundColor: BRASS }} />
        </div>

        {/* The gap, then the measure. */}
        <div style={{ display: "flex", width: 56 }} />

        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: INK,
            }}
          >
            {project?.name ?? profile.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.35,
              color: INK_MUTED,
            }}
          >
            {project?.descriptor ?? profile.subtitle.join(", ")}
          </div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          {/* The site card closes on the location. A project card closes on
              whose project it is, which is the thing the name above no
              longer says. */}
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: INK_MUTED,
            }}
          >
            {profile.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
