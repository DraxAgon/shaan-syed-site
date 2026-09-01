"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { RiloDemo } from "./rilo-demo";

type Mode = "play" | "video" | "live" | "scroll";

export type Hotspot = {
  label: string;
  kind: "external" | "site" | "anchor";
  href?: string;
  /* For anchors: where to scroll the panel, as a percentage of the
     full capture height. */
  scrollPct?: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

/* One panel, several ways to look at a project.

   play    the product's real flow, ported and running here
   video   a recording, instant and never a cold start
   live    the real app in an iframe, for apps that allow framing
   scroll  a full-page capture with the page's own buttons on top,
           for sites that refuse to be framed

   Which modes exist depends on the project, and the switcher only
   shows the ones it has. */
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
  hotspots,
  playable,
  defaultMode,
}: {
  src?: string;
  poster?: string;
  label?: string;
  liveUrl?: string;
  liveLabel?: string;
  scrollImage?: string;
  scrollImageWidth?: number;
  scrollImageHeight?: number;
  scrollLabel?: string;
  hotspots?: Hotspot[];
  playable?: { component: "rilo"; label: string };
  defaultMode?: Mode;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const modes: { id: Mode; tab: string; caption: string }[] = [];
  if (playable) modes.push({ id: "play", tab: "Try it", caption: playable.label });
  if (src) modes.push({ id: "video", tab: "Recording", caption: label ?? "Screen recording" });
  if (liveUrl) modes.push({ id: "live", tab: "Live app", caption: liveLabel ?? "Live app" });
  if (scrollImage) modes.push({ id: "scroll", tab: "The page", caption: scrollLabel ?? "The full page" });

  const [mode, setMode] = useState<Mode>(defaultMode ?? modes[0]?.id ?? "video");
  const [playing, setPlaying] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);

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

  const current = modes.find((m) => m.id === mode) ?? modes[0];

  return (
    <figure className="demo">
      <div
        className={
          "demo-stage" +
          (mode === "scroll" ? " is-scroll" : "") +
          (mode === "live" ? " is-live" : "") +
          (mode === "play" ? " is-play" : "")
        }
      >
        {mode === "play" && playable ? (
          <RiloDemo />
        ) : mode === "live" && liveUrl ? (
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
          <div
            className="demo-scroll"
            ref={scroller}
            tabIndex={0}
            role="group"
            aria-label={scrollLabel ?? "The full page"}
          >
            <div className="demo-scroll-inner">
              <Image
                src={scrollImage}
                alt={scrollLabel ?? "The full page"}
                width={scrollImageWidth ?? 1280}
                height={scrollImageHeight ?? 5846}
                className="demo-scroll-img"
                unoptimized
              />

              {/* The capture is flat, so the page's own buttons are put
                  back as an overlay: real links out, and in-page
                  anchors that scroll this panel rather than leaving. */}
              {(hotspots ?? []).map((spot, i) => {
                const style = {
                  left: `${spot.left}%`,
                  top: `${spot.top}%`,
                  width: `${spot.width}%`,
                  height: `${spot.height}%`,
                };

                if (spot.kind === "anchor") {
                  return (
                    <button
                      key={`${spot.label}-${i}`}
                      type="button"
                      className="demo-hotspot"
                      style={style}
                      aria-label={`${spot.label}, scroll to that section`}
                      onClick={() => {
                        const el = scroller.current;
                        if (!el || spot.scrollPct == null) return;
                        el.scrollTo({
                          top: (spot.scrollPct / 100) * el.scrollHeight,
                          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? "auto"
                            : "smooth",
                        });
                      }}
                    />
                  );
                }

                return (
                  <a
                    key={`${spot.label}-${i}`}
                    className="demo-hotspot"
                    style={style}
                    href={spot.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${spot.label}, opens in a new tab`}
                  />
                );
              })}
            </div>
          </div>
        ) : src ? (
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
        ) : null}
      </div>

      <figcaption className="demo-caption">
        <span className="demo-caption-text">
          <span
            className={
              "demo-dot" +
              (mode === "video" && playing ? " is-live" : "") +
              (mode === "live" || mode === "scroll" || mode === "play" ? " is-real" : "")
            }
            aria-hidden="true"
          />
          {current?.caption}
        </span>

        {modes.length > 1 ? (
          <span className="demo-modes" role="group" aria-label="How to view this project">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`demo-mode${m.id === mode ? " is-on" : ""}`}
                aria-pressed={m.id === mode}
                onClick={() => {
                  setMode(m.id);
                  setFrameLoaded(false);
                }}
              >
                {m.tab}
              </button>
            ))}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
