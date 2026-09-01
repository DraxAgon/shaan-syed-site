"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Mode = "video" | "live" | "scroll";

/* A recorded run of the live product, plus a hands-on mode.

   The recording always loads first: it starts instantly, costs one
   small file, and never shows a cold start. The hands-on mode is only
   fetched when someone asks for it, which matters when the app is on a
   free tier that sleeps.

   Which hands-on mode a project gets depends on whether it can be
   framed. Phantom sends no X-Frame-Options, so it embeds live and is
   fully clickable. riloai.app sends X-Frame-Options: SAMEORIGIN, so it
   gets a scrollable capture of the whole page instead. */
export function ProjectDemo({
  src,
  poster,
  label,
  liveUrl,
  liveLabel,
  scrollImage,
  scrollImageWidth,
  scrollImageHeight,
  scrollLabel,
}: {
  src: string;
  poster: string;
  label: string;
  liveUrl?: string;
  liveLabel?: string;
  scrollImage?: string;
  scrollImageWidth?: number;
  scrollImageHeight?: number;
  scrollLabel?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("video");
  const [playing, setPlaying] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const altMode: Mode | null = liveUrl ? "live" : scrollImage ? "scroll" : null;

  useEffect(() => {
    const el = video.current;
    if (!el || mode !== "video") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Play only while on screen, so an off-screen demo is not decoding
       frames for nothing. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  const toggleLabel =
    mode !== "video"
      ? "Back to the recording"
      : altMode === "live"
        ? "Open the live app"
        : "Scroll the real page";

  const captionText =
    mode === "live"
      ? (liveLabel ?? "Live app")
      : mode === "scroll"
        ? (scrollLabel ?? "The real page, scroll inside it")
        : label;

  return (
    <figure className="demo">
      <div className={`demo-stage${mode === "scroll" ? " is-scroll" : ""}`}>
        {mode === "live" && liveUrl ? (
          <>
            {!frameLoaded ? (
              <p className="demo-waking">Waking the app, this can take a moment</p>
            ) : null}
            <iframe
              className="demo-frame"
              src={liveUrl}
              title={liveLabel ?? "Live app"}
              loading="lazy"
              onLoad={() => setFrameLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </>
        ) : mode === "scroll" && scrollImage ? (
          <div className="demo-scroll" tabIndex={0} role="group" aria-label={scrollLabel ?? "The full page"}>
            <Image
              src={scrollImage}
              alt={scrollLabel ?? "The full page"}
              width={scrollImageWidth ?? 1280}
              height={scrollImageHeight ?? 5846}
              className="demo-scroll-img"
              unoptimized
            />
          </div>
        ) : (
          <video
            ref={video}
            className="demo-video"
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={label}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}
      </div>

      <figcaption className="demo-caption">
        <span className="demo-caption-text">
          <span
            className={
              "demo-dot" +
              (mode === "video" && playing ? " is-live" : "") +
              (mode !== "video" ? " is-real" : "")
            }
            aria-hidden="true"
          />
          {captionText}
        </span>

        {altMode ? (
          <button
            type="button"
            className="demo-toggle"
            onClick={() => {
              setMode((m) => (m === "video" ? altMode : "video"));
              setFrameLoaded(false);
            }}
          >
            {toggleLabel}
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
