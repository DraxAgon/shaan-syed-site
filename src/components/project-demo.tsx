"use client";

import { useEffect, useRef, useState } from "react";

/* A recorded run of the live product, with an optional switch to the
   real thing.

   The recording is what loads first, on purpose. It starts instantly,
   costs one small file, and never shows a cold start. The live app is
   only fetched when someone asks for it, which matters when the app is
   on a free tier that sleeps.

   Not every app can be framed: riloai.app sends
   X-Frame-Options: SAMEORIGIN, so it has no live mode and the button
   is simply absent. */
export function ProjectDemo({
  src,
  poster,
  label,
  liveUrl,
  liveLabel,
}: {
  src: string;
  poster: string;
  label: string;
  liveUrl?: string;
  liveLabel?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || live) return;

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
  }, [live]);

  return (
    <figure className="demo">
      <div className="demo-stage">
        {live && liveUrl ? (
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
            className={`demo-dot${!live && playing ? " is-live" : ""}${live ? " is-real" : ""}`}
            aria-hidden="true"
          />
          {live ? (liveLabel ?? "Live app") : label}
        </span>

        {liveUrl ? (
          <button
            type="button"
            className="demo-toggle"
            onClick={() => {
              setLive((v) => !v);
              setFrameLoaded(false);
            }}
          >
            {live ? "Back to the recording" : "Open the live app"}
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
