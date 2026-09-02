"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";

import { RiloDemo } from "@/components/rilo-demo";

type Mode = "play" | "live" | "scroll";

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

   play    the product's own flow, rebuilt and playable in place
   live    the real app in an iframe, for apps that allow framing
   scroll  a full-page capture with the page's own buttons on top,
           for sites that refuse to be framed

   There is deliberately no recording mode. Every project here is either
   framable live or rebuilt in the browser, and a video of something the
   visitor could be clicking is the worse version of it.

   Which modes exist depends on the project, and the switcher only
   shows the ones it has. Beside them, pageUrl is the way out to the real
   page at full size, for a visitor who wants it in its own tab. */
export function ProjectDemo({
  playable,
  liveUrl,
  liveLabel,
  liveZoom,
  guide,
  scrollImage,
  scrollImageWidth,
  scrollImageHeight,
  scrollLabel,
  hotspots,
  pageUrl,
  pageLabel,
  defaultMode,
}: {
  playable?: { component: "rilo"; label: string };
  liveUrl?: string;
  liveLabel?: string;
  liveZoom?: number;
  guide?: { title: string; steps: string[] };
  scrollImage?: string;
  scrollImageWidth?: number;
  scrollImageHeight?: number;
  scrollLabel?: string;
  hotspots?: Hotspot[];
  pageUrl?: string;
  pageLabel?: string;
  defaultMode?: Mode;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const modes: { id: Mode; tab: string; caption: string }[] = [];
  if (playable)
    modes.push({
      id: "play",
      tab: "The demo",
      caption: playable.label,
    });
  if (liveUrl)
    modes.push({
      id: "live",
      tab: "Live app",
      caption: liveLabel ?? "Live app",
    });
  if (scrollImage)
    modes.push({
      id: "scroll",
      tab: "The page",
      caption: scrollLabel ?? "The full page",
    });

  const [mode, setMode] = useState<Mode>(defaultMode ?? modes[0]?.id ?? "live");
  const [frameLoaded, setFrameLoaded] = useState(false);

  const current = modes.find((m) => m.id === mode) ?? modes[0];

  const showGuide = guide && mode === "live";

  return (
    <figure className="demo">
      <div className={"demo-body" + (showGuide ? " has-guide" : "")}>
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
                <p className="demo-waking">
                  Waking the app, this can take a moment
                </p>
              ) : null}
              {/* When a zoom is set the frame is drawn 1/zoom larger and scaled
                back down, so the app still lays out at its own desktop width
                and the whole section fits the panel in one view. */}
              <div
                className={"demo-frame-fit" + (liveZoom ? " is-zoomed" : "")}
                style={
                  liveZoom
                    ? ({ "--frame-zoom": liveZoom } as CSSProperties)
                    : undefined
                }
              >
                <iframe
                  className="demo-frame"
                  src={liveUrl}
                  title={liveLabel ?? "Live app"}
                  loading="lazy"
                  onLoad={() => setFrameLoaded(true)}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
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
                            behavior: window.matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
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
          ) : null}
        </div>

        {/* Phantom's interesting state cannot be reached by URL, so the panel
          says what to click instead of leaving a visitor on a list of
          illustrative projects wondering what they are looking at. */}
        {showGuide ? (
          <aside className="demo-guide" aria-label={guide.title}>
            <h3 className="demo-guide-title">{guide.title}</h3>
            <ol className="demo-guide-steps">
              {guide.steps.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

      <figcaption className="demo-caption">
        <span className="demo-caption-text">
          {/* Every remaining mode is the real thing rather than a picture of
              it, so the dot is always the live one. */}
          <span className="demo-dot is-real" aria-hidden="true" />
          {current?.caption}
        </span>

        {modes.length > 1 || pageUrl ? (
          <span
            className="demo-modes"
            role="group"
            aria-label="How to view this project"
          >
            {modes.length > 1
              ? modes.map((m) => (
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
                ))
              : null}

            {/* The panel already is the real page, so this is not another
                view of it: it is the way out to the page itself. */}
            {pageUrl ? (
              <a
                className="demo-mode demo-open"
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pageLabel ?? "View the page"}
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : null}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
