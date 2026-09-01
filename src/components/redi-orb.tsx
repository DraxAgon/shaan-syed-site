"use client";

import { useEffect, useRef } from "react";

/* Redi's face, drawn from the app's own numbers.

   Every ratio below is copied from `src/components/redi/rediConfig.ts` in the
   Redi repo, and the mouth is the same two-quadratic lens that
   `src/components/redi/mouthPath.ts` builds. The app draws him in React Native
   SVG at any size from a 22px header mark to a 200px session orb; this draws
   the same shape in browser SVG so the walkthrough shows the real character
   rather than a picture of one.

   Two rules from that file carry over and are not style choices: the curve is
   clamped at zero, so he never frowns, and the eyes stay upright ovals rather
   than circles or slits. */

const ORB = {
  gradientCenterX: 0.4,
  gradientCenterY: 0.35,
  highlight: "#FFE066",
  core: "#FFC933",
  edge: "#F5A623",
  rimColor: "#FFF0A0",
  rimOpacity: 0.4,
  rimWidthRatio: 0.015,
};

const FACE = {
  color: "#2A1F05",
  eyeRadiusXRatio: 0.066,
  eyeRadiusYRatio: 0.094,
  eyeSpacingRatio: 0.19,
  eyeHeightRatio: 0.095,
  mouthCenterRatio: 0.17,
  mouthWidthRatio: 0.34,
  mouthMinThicknessRatio: 0.022,
  mouthMaxThicknessRatio: 0.22,
};

const MOUTH = {
  restingCurve: 0.5,
  curveDepthRatio: 0.42,
  speakingMinOpenness: 0.05,
  speakingMaxOpenness: 0.65,
};

const BLINK = {
  minIntervalSeconds: 3,
  maxIntervalSeconds: 6,
  durationMs: 120,
  closedScaleY: 0.05,
  widenFactor: 1.12,
};

const MOTION = {
  breathScale: 1.02,
  breathPeriodSeconds: 3.5,
  speakingBobRatio: 0.012,
  speakingBobPeriodSeconds: 1.4,
  stateTransitionMs: 420,
};

export type RediState = "idle" | "speaking" | "listening" | "thinking";

/* The resting mouth per state, from `restingMouth()`. Speaking openness comes
   from amplitude instead and this is only its floor. */
const RESTING: Record<RediState, { openness: number; curve: number }> = {
  idle: { openness: 0.06, curve: MOUTH.restingCurve },
  speaking: { openness: 0.06, curve: 0.4 },
  listening: { openness: 0.04, curve: 0.45 },
  thinking: { openness: 0, curve: 0.15 },
};

/* Listening opens the eyes a little wider. Attentive, not startled. */
const LISTENING_EYE_SCALE = 1.15;

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function geometry(size: number) {
  const half = size / 2;
  return {
    size,
    cx: half,
    cy: half,
    radius: half,
    rimWidth: size * ORB.rimWidthRatio,
    eyeRadiusX: size * FACE.eyeRadiusXRatio,
    eyeRadiusY: size * FACE.eyeRadiusYRatio,
    leftEyeX: half - size * FACE.eyeSpacingRatio,
    rightEyeX: half + size * FACE.eyeSpacingRatio,
    eyeY: half - size * FACE.eyeHeightRatio,
    mouthY: half + size * FACE.mouthCenterRatio,
    mouthWidth: size * FACE.mouthWidthRatio,
    mouthMinThickness: size * FACE.mouthMinThicknessRatio,
    mouthMaxThickness: size * FACE.mouthMaxThicknessRatio,
  };
}

type Geometry = ReturnType<typeof geometry>;

/* A lens: two quadratics meeting at the corners, thickest in the middle. One
   path for every state, so shapes interpolate instead of cutting. */
function mouthPath(openness: number, curve: number, g: Geometry) {
  const o = clamp(openness, 0, 1);
  /* The clamp that matters. Below zero would be a frown. */
  const c = clamp(curve, 0, 1);

  const halfWidth = g.mouthWidth / 2;
  const thickness = g.mouthMinThickness + (g.mouthMaxThickness - g.mouthMinThickness) * o;
  const bow = g.mouthWidth * MOUTH.curveDepthRatio * c;

  const leftX = r2(g.cx - halfWidth);
  const rightX = r2(g.cx + halfWidth);
  const cornerY = r2(g.mouthY - bow / 2);
  const topControlY = r2(g.mouthY - bow / 2 + bow * 2);
  const bottomControlY = r2(g.mouthY - bow / 2 + bow * 2 + thickness * 2);
  const controlX = r2(g.cx);

  return (
    `M${leftX} ${cornerY}` +
    `Q${controlX} ${topControlY} ${rightX} ${cornerY}` +
    `Q${controlX} ${bottomControlY} ${leftX} ${cornerY}` +
    "Z"
  );
}

export function RediOrb({
  size = 96,
  state = "idle",
  /* 0 to 1. While speaking this drives the mouth, and the walkthrough feeds it
     a synthetic envelope keyed to the words being revealed, the way the app
     feeds it the live output level. */
  amplitude = 0,
  className,
}: {
  size?: number;
  state?: RediState;
  amplitude?: number;
  className?: string;
}) {
  const g = geometry(size);

  const mouth = useRef<SVGPathElement>(null);
  const leftEye = useRef<SVGEllipseElement>(null);
  const rightEye = useRef<SVGEllipseElement>(null);
  const body = useRef<SVGGElement>(null);

  /* The animated inputs live in refs, not state: this runs at frame rate and
     re-rendering React sixty times a second to move a mouth is the wrong
     trade. The refs are read by one loop and written by the effects. */
  const target = useRef({ state, amplitude });
  target.current = { state, amplitude };

  /* Smoothed openness, so the mouth eases rather than snapping between
     frames. The app runs a five frame rolling average and then a spring; this
     is the same idea with one lag term. */
  const eased = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      /* Every loop is skipped and the face holds its rest pose. */
      const rest = RESTING[target.current.state];
      mouth.current?.setAttribute("d", mouthPath(rest.openness, rest.curve, g));
      return;
    }

    let frame = 0;
    const start = performance.now();
    let nextBlink = start + (BLINK.minIntervalSeconds + Math.random() * 2) * 1000;
    let blinkStart = -1;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const { state: s, amplitude: amp } = target.current;
      const rest = RESTING[s];

      /* Mouth. Speaking maps amplitude into the openness band; every other
         state holds its resting pose. */
      const wanted =
        s === "speaking"
          ? MOUTH.speakingMinOpenness +
            (MOUTH.speakingMaxOpenness - MOUTH.speakingMinOpenness) * clamp(amp, 0, 1)
          : rest.openness;

      eased.current += (wanted - eased.current) * 0.22;
      mouth.current?.setAttribute("d", mouthPath(eased.current, rest.curve, g));

      /* Blink. Not a state: it fires over any of them. */
      if (blinkStart < 0 && now >= nextBlink) blinkStart = now;

      let blinkScale = 1;
      let widen = 1;
      if (blinkStart >= 0) {
        const p = (now - blinkStart) / BLINK.durationMs;
        if (p >= 1) {
          blinkStart = -1;
          nextBlink =
            now +
            (BLINK.minIntervalSeconds +
              Math.random() * (BLINK.maxIntervalSeconds - BLINK.minIntervalSeconds)) *
              1000;
        } else {
          /* Close and reopen, and widen slightly on the way, which reads as
             organic rather than mechanical. */
          const closed = 1 - Math.abs(1 - p * 2);
          blinkScale = 1 - closed * (1 - BLINK.closedScaleY);
          widen = 1 + closed * (BLINK.widenFactor - 1);
        }
      }

      const stateScale = s === "listening" ? LISTENING_EYE_SCALE : 1;
      const ry = r2(g.eyeRadiusY * stateScale * blinkScale);
      const rx = r2(g.eyeRadiusX * widen);
      for (const eye of [leftEye.current, rightEye.current]) {
        eye?.setAttribute("rx", String(rx));
        eye?.setAttribute("ry", String(ry));
      }

      /* Idle breathing, plus a small bob while he talks. Transform only, never
         layout. */
      const breath =
        1 + (MOTION.breathScale - 1) * (0.5 - 0.5 * Math.cos((t / MOTION.breathPeriodSeconds) * Math.PI * 2));
      const bob =
        s === "speaking"
          ? Math.sin((t / MOTION.speakingBobPeriodSeconds) * Math.PI * 2) * size * MOTION.speakingBobRatio
          : 0;

      body.current?.setAttribute(
        "transform",
        `translate(${r2(g.cx)} ${r2(g.cy + bob)}) scale(${r2(breath)}) translate(${r2(-g.cx)} ${r2(-g.cy)})`,
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    /* Cancel on unmount. A loop still writing to a detached node is the web
       version of the app's InvocationTargetException. */
    return () => cancelAnimationFrame(frame);
  }, [g, size]);

  const rest = RESTING[state];
  const gradientId = `redi-orb-${size}`;

  return (
    <span
      className={className ? `redi-orb ${className}` : "redi-orb"}
      style={{ width: size, height: size }}
      /* The glow is a CSS layer behind him rather than three SVG gradients:
         the app draws the ambient at twice his diameter, which as an SVG
         viewport would be a 4x box of empty space in the layout. */
      data-state={state}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient
            id={gradientId}
            cx={ORB.gradientCenterX}
            cy={ORB.gradientCenterY}
            r="0.72"
          >
            <stop offset="0%" stopColor={ORB.highlight} />
            <stop offset="55%" stopColor={ORB.core} />
            <stop offset="100%" stopColor={ORB.edge} />
          </radialGradient>
        </defs>

        <g ref={body}>
          <circle cx={g.cx} cy={g.cy} r={g.radius - g.rimWidth / 2} fill={`url(#${gradientId})`} />
          {/* The rim lifts him off the dark canvas. */}
          <circle
            cx={g.cx}
            cy={g.cy}
            r={g.radius - g.rimWidth / 2}
            fill="none"
            stroke={ORB.rimColor}
            strokeOpacity={ORB.rimOpacity}
            strokeWidth={g.rimWidth}
          />
          <ellipse
            ref={leftEye}
            cx={g.leftEyeX}
            cy={g.eyeY}
            rx={r2(g.eyeRadiusX)}
            ry={r2(g.eyeRadiusY)}
            fill={FACE.color}
          />
          <ellipse
            ref={rightEye}
            cx={g.rightEyeX}
            cy={g.eyeY}
            rx={r2(g.eyeRadiusX)}
            ry={r2(g.eyeRadiusY)}
            fill={FACE.color}
          />
          <path ref={mouth} d={mouthPath(rest.openness, rest.curve, g)} fill={FACE.color} />
        </g>
      </svg>
    </span>
  );
}

export { MOTION as rediMotion };
