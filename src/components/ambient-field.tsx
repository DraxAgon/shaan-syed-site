"use client";

import { useEffect, useState } from "react";

/* The marks that surface in the background.

   Not a decoration picked at random: they are the punctuation of the
   two things this site is about, code and the piano, set in the same
   mono face as the metadata and left at about a fifteenth of full ink,
   so they read as texture in the margin rather than as content. One
   drifts up and fades out every few seconds, never more than a few at
   a time, and never on a schedule you could set a watch by. */
const MARKS = [
  "{ }",
  "( )",
  "[ ]",
  "=>",
  "//",
  "&&",
  ";",
  "::",
  "</>",
  "♪",
  "♩",
  "𝄞",
];

type Mark = {
  id: number;
  glyph: string;
  /* Percentages of the viewport, so a resize never leaves one stranded
     off the edge. */
  left: number;
  top: number;
  size: number;
  drift: number;
  duration: number;
  peak: number;
};

const between = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

export function AmbientField() {
  /* Empty on the server and on the first client render: the positions
     are random, and a random first paint is a hydration mismatch. */
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let nextId = 0;
    const timers = new Set<number>();

    const spawn = () => {
      /* Below this the 1260px measure fills the window and there is no
         margin to put anything in, so a mark goes wherever it lands and
         the low opacity keeps it off the reader's way. */
      const wide = window.innerWidth >= 1500;
      const mark: Mark = {
        id: nextId++,
        glyph: pick(MARKS),
        /* On a wide window the text sits in a 1260px measure with room
           either side, so most marks go out into that margin where
           they can actually be seen. Narrow windows have no margin to
           speak of and take them anywhere. */
        left:
          wide && Math.random() < 0.72
            ? Math.random() < 0.5
              ? between(2, 15)
              : between(85, 97)
            : between(4, 92),
        top: between(12, 88),
        /* A wide range on purpose: the big ones read as a shape in the
           background, the small ones as a stray mark in the margin, and
           the mix is what keeps it from looking like a pattern. */
        size: between(14, 46),
        drift: between(14, 34),
        duration: between(7000, 12000),
        /* Measured against the plate: under about a tenth these do not
           register at all, and over about a fifth they start reading as
           text on the page rather than as grain behind it. */
        peak: between(0.1, 0.17),
      };

      setMarks((current) => [...current.slice(-3), mark]);

      const clear = window.setTimeout(() => {
        timers.delete(clear);
        setMarks((current) => current.filter((m) => m.id !== mark.id));
      }, mark.duration);
      timers.add(clear);
    };

    /* Every few seconds, but never the same few: a fixed interval reads
       as a metronome, which is the one thing this should not do. A
       hidden tab draws nothing and waits for the next turn. */
    const schedule = () => {
      const next = window.setTimeout(() => {
        timers.delete(next);
        if (!document.hidden) spawn();
        schedule();
      }, between(2200, 5400));
      timers.add(next);
    };

    const first = window.setTimeout(() => {
      timers.delete(first);
      spawn();
      schedule();
    }, 1200);
    timers.add(first);

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      {marks.map((mark) => (
        <span
          key={mark.id}
          className="ambient-mark"
          style={{
            left: `${mark.left}%`,
            top: `${mark.top}%`,
            fontSize: `${mark.size}px`,
            "--mark-drift": `${mark.drift}px`,
            "--mark-duration": `${mark.duration}ms`,
            "--mark-peak": mark.peak,
          } as React.CSSProperties}
        >
          {mark.glyph}
        </span>
      ))}
    </div>
  );
}
