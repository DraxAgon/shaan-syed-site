import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";

export const alt = "Shaan Syed, Computer Science at Waterloo and BBA at Laurier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Tokens mirrored from globals.css. No stock imagery: the card is the
   site's own rail, drawn at poster scale. */
const PLATE = "#17120E";
const INK = "#F0EAE1";
const INK_MUTED = "#A29790";
const BRASS = "#D9A441";

export default function OpengraphImage() {
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
            {profile.name}
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
            {profile.subtitle}
          </div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: INK_MUTED,
            }}
          >
            {profile.location}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
