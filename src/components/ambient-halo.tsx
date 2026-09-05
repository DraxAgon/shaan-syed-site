import type { CSSProperties } from "react";

/* The ring behind the home page.

   A spiral of small brass ticks, wound out from a centre off the left
   edge of the window so most of it is cut off and what is left reads as
   an arc through the left column rather than as a circle drawn around
   the page. At rest they are barely on the plate at all. A glow travels
   the spiral one tick at a time, takes about five seconds to get all the
   way round, and then the ring is quiet for fifteen before it starts
   again — and it never stops doing that.

   Every number below is fixed, so this stays a server component: no
   script, no hydration, and the whole thing is one CSS animation per
   tick with a delay that says where in the wave that tick sits. */

const COUNT = 96;
const TURNS = 2.15;
const START_ANGLE = -148; /* degrees; the sweep opens at the bottom left */
const INNER = 150; /* px from the centre to the first tick */
const OUTER = 520;
const STEP_MS = 52; /* one tick to the next, so the sweep is COUNT * this */

type Tick = {
  angle: number;
  radius: number;
  length: number;
  thickness: number;
  delay: number;
  rest: number;
  peak: number;
};

/* Gaps and uneven lengths, from a couple of sine terms rather than from
   Math.random: a spiral of identical ticks at even spacing reads as a
   loading spinner, and a random one cannot be rendered on the server. */
const ticks: Tick[] = [];
for (let i = 0; i < COUNT; i += 1) {
  const t = i / COUNT;
  if (Math.sin(i * 1.87) > 0.82 || Math.sin(i * 0.61 + 2) > 0.94) continue;

  ticks.push({
    angle: START_ANGLE + t * TURNS * 360,
    radius: INNER + t * (OUTER - INNER),
    length: 11 + t * 15 + Math.sin(i * 0.73) * 5,
    thickness: 3 + t * 1.6,
    delay: i * STEP_MS,
    /* Two very different numbers on purpose. At rest the ring is meant
       to be missed: a few hundredths, which on the plate is barely a
       mark. Lit, it is the brightest thing in the margin. The outer end
       runs over open plate and can afford more than the inner end,
       which passes behind the portrait and the name. */
    rest: 0.035 + t * 0.02,
    peak: 0.62 + t * 0.24,
  });
}

export function AmbientHalo() {
  return (
    <div className="halo" aria-hidden="true">
      <div className="halo-spiral">
        {ticks.map((tick, i) => (
          <span
            key={i}
            className="halo-tick"
            style={
              {
                width: `${tick.length.toFixed(1)}px`,
                height: `${tick.thickness.toFixed(2)}px`,
                transform: `rotate(${tick.angle.toFixed(2)}deg) translate(${tick.radius.toFixed(1)}px) translateY(-50%)`,
                "--tick-delay": `${tick.delay}ms`,
                "--tick-rest": tick.rest.toFixed(3),
                "--tick-peak": tick.peak.toFixed(3),
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
