"use client";

import { useEffect, useRef, useState } from "react";

/* A recorded scroll-through of the live product.

   Autoplays muted and loops, which is what a silent product demo
   should do, but never under prefers-reduced-motion: there it stays on
   the poster until the viewer presses play. Controls are always
   present so playback is never something the page decides alone. */
export function DemoVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    /* Only play while it is on screen, so an off-screen demo is not
       decoding frames for nothing. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="demo">
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
      <figcaption className="demo-caption">
        <span className={`demo-dot${playing ? " is-live" : ""}`} aria-hidden="true" />
        {label}
      </figcaption>
    </figure>
  );
}
