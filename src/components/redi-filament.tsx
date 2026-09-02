"use client";

import { useEffect, useId, useRef } from "react";

/* The Filament, the one memorable thing in Redi.

   From `src/components/ui/v2/Filament.tsx` in the Redi repo: one continuous
   2px gold element that persists across the app and changes state rather than
   being replaced.

     hairline   a rule under a role, length is how much of it has been drilled
     travel     a segment running left to right while something is being read
     wave       one stroked path, amplitude from the live input level
     pulse      collapsed to a point, about 0.7Hz, while it thinks

   The app's waveform is one stroked path sampled at 33 points with round
   joins, not a row of bars. That is written down there as a fix rather than a
   preference: 24 separate 2px bars on a 420px slot is an 11 percent duty
   cycle, which reads as a comb and not as a voice. Same path here. */

const WAVE_POINTS = 33;
const WAVE_SHOULDER = 0.12;
/* Radians of amplitude ripple across the width, and one cycle of centre-line
   travel under it. */
const WAVE_RIPPLE = 9;
const WAVE_SNAKE = Math.PI * 2;
const TRAVEL_SEGMENT = 0.28;

export type FilamentState = "hairline" | "travel" | "wave" | "pulse";

const GOLD = "#E9B33B";
const TRACK = "#353531";

export function RediFilament({
  state,
  progress = 1,
  amplitude = 0,
  height = 12,
  /* The app dims the Filament to 40 percent on any screen whose gold hero is
     a button, so two golds never compete. */
  dim = false,
  className,
}: {
  state: FilamentState;
  progress?: number;
  amplitude?: number;
  height?: number;
  dim?: boolean;
  className?: string;
}) {
  const wave = useRef<SVGPathElement>(null);
  const segment = useRef<SVGRectElement>(null);
  const point = useRef<SVGCircleElement>(null);
  /* Per instance: two travelling Filaments on one page would otherwise share
     a gradient id. */
  const travelId = `redi-travel${useId()}`;

  /* Seeded with the first props, written only here, read by the loop below. */
  const live = useRef({ state, amplitude });
  useEffect(() => {
    live.current = { state, amplitude };
  }, [state, amplitude]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Reduce motion holds each state at its rest pose: the travelling segment
       sits still at 20 percent, the waveform holds its silence floor, the
       point holds mid pulse. */
    if (reduced) {
      segment.current?.setAttribute("x", "20");
      wave.current?.setAttribute("d", wavePath(0));
      point.current?.setAttribute("opacity", "0.7");
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const { state: s, amplitude: amp } = live.current;

      if (s === "travel") {
        /* Loops across the width, tail dimming behind it. */
        const x = (t / 1.1) % 1;
        segment.current?.setAttribute(
          "x",
          String(x * 100 - TRAVEL_SEGMENT * 100),
        );
      } else if (s === "wave") {
        wave.current?.setAttribute("d", wavePath(amp, t));
      } else if (s === "pulse") {
        /* About 0.7Hz. */
        const p = 0.5 - 0.5 * Math.cos(t * 0.7 * Math.PI * 2);
        point.current?.setAttribute("opacity", String(0.35 + p * 0.65));
        point.current?.setAttribute("r", String(1.4 + p * 1.1));
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const opacity = dim ? 0.4 : 1;

  /* The viewBox is 12 units tall and stretched to fill `height`, so a rule
     written as 2 user units renders 2 * height / 12 px: a third of a pixel
     in the role card's 2px slot. Expressing it in user units keeps the one
     continuous 2px element 2px in every slot. The wave gets the same
     protection below from vectorEffect="non-scaling-stroke". */
  const rule = 24 / height;
  const ruleY = 6 - rule / 2;

  return (
    <span
      className={className ? `redi-filament ${className}` : "redi-filament"}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        {state === "hairline" ? (
          <>
            <rect
              x="0"
              y={ruleY}
              width="100"
              height={rule}
              fill={TRACK}
              rx="1"
              ry={rule / 2}
            />
            <rect
              x="0"
              y={ruleY}
              width={Math.max(0, Math.min(1, progress)) * 100}
              height={rule}
              fill={GOLD}
              opacity={opacity}
              rx="1"
              ry={rule / 2}
            />
          </>
        ) : null}

        {state === "travel" ? (
          <>
            <defs>
              <linearGradient id={travelId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y={ruleY}
              width="100"
              height={rule}
              fill={TRACK}
              rx="1"
              ry={rule / 2}
            />
            <rect
              ref={segment}
              x="-28"
              y={ruleY}
              width={TRAVEL_SEGMENT * 100}
              height={rule}
              fill={`url(#${travelId})`}
              opacity={opacity}
              rx="1"
              ry={rule / 2}
            />
          </>
        ) : null}

        {state === "wave" ? (
          <path
            ref={wave}
            d={wavePath(0)}
            fill="none"
            stroke={GOLD}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {state === "pulse" ? (
          <circle
            ref={point}
            cx="50"
            cy="6"
            r="2"
            fill={GOLD}
            opacity={opacity}
          />
        ) : null}
      </svg>
    </span>
  );
}

/* One path, sampled at WAVE_POINTS. The shoulders ease both ends back to the
   centre line so silence closes to a needle point rather than a hard cap. */
function wavePath(amplitude: number, t = 0) {
  const amp = Math.max(0, Math.min(1, amplitude));
  const points: string[] = [];

  for (let i = 0; i < WAVE_POINTS; i += 1) {
    const u = i / (WAVE_POINTS - 1);
    const x = u * 100;

    const shoulder =
      u < WAVE_SHOULDER
        ? u / WAVE_SHOULDER
        : u > 1 - WAVE_SHOULDER
          ? (1 - u) / WAVE_SHOULDER
          : 1;

    const ripple = Math.sin(u * WAVE_RIPPLE + t * 7);
    const snake = Math.sin(u * WAVE_SNAKE + t * 2.4);

    /* At silence the band runs even across its width at the 2px floor, which
       is what stops the shape from vanishing between words. */
    const swing = (0.6 + 0.4 * ripple) * amp * 4.4 * shoulder;
    const y = 6 + snake * 0.35 * shoulder - swing;

    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join("");
}
