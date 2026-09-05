import type { CSSProperties } from "react";

/* The two rings behind the home page.

   Each is a spiral of small brass ticks wound out from a centre that
   sits off the edge of the window, so the window cuts it and what is
   left reads as an arc rather than as a circle drawn around the page:
   one out past the left edge, running up through the identity column,
   and a smaller one off the top right corner. At rest they are barely on
   the plate at all. A glow travels each spiral one tick at a time, then
   the ring is quiet for a few seconds and does it again, and it never
   stops doing that.

   The two run on different clocks — twelve and a half seconds against
   ten and a half — so they are never in step, and where they fall
   against each other keeps changing for as long as the page is open.

   Every number below is fixed, so this stays a server component: no
   script, no hydration, and the whole thing is one CSS animation per
   tick with a delay that says where in the wave that tick sits. */

type Ring = {
  /* Which of the two, for the CSS that places and clocks it. */
  name: "left" | "right";
  count: number;
  turns: number;
  /* Degrees. Where the sweep starts, and so which way the arc opens. */
  startAngle: number;
  inner: number;
  outer: number;
  /* Milliseconds from one tick lighting to the next. */
  step: number;
  /* Opacity waiting its turn, and lit, at the inner end and the outer.
     The outer end of each spiral runs over open plate and can afford
     more than the inner end, which passes behind the text. */
  rest: [number, number];
  peak: [number, number];
};

const RINGS: Ring[] = [
  {
    name: "left",
    count: 96,
    turns: 2.15,
    startAngle: -148,
    inner: 150,
    outer: 520,
    step: 46,
    rest: [0.035, 0.055],
    peak: [0.62, 0.86],
  },
  {
    /* Smaller, tighter, and quicker round: it has a corner to sit in
       rather than a column, and the work listed under it is the thing
       being read. */
    name: "right",
    count: 62,
    turns: 1.75,
    startAngle: 104,
    inner: 112,
    outer: 336,
    step: 42,
    rest: [0.03, 0.05],
    peak: [0.44, 0.66],
  },
];

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
   loading spinner, and a random one cannot be rendered on the server.
   The two rings are offset into different parts of those curves, so
   they break up differently. */
function buildTicks(ring: Ring, seed: number): Tick[] {
  const ticks: Tick[] = [];

  for (let i = 0; i < ring.count; i += 1) {
    const t = i / ring.count;
    const n = i + seed;
    if (Math.sin(n * 1.87) > 0.82 || Math.sin(n * 0.61 + 2) > 0.94) continue;

    ticks.push({
      angle: ring.startAngle + t * ring.turns * 360,
      radius: ring.inner + t * (ring.outer - ring.inner),
      length: 11 + t * 15 + Math.sin(n * 0.73) * 5,
      thickness: 3 + t * 1.6,
      delay: i * ring.step,
      rest: ring.rest[0] + t * (ring.rest[1] - ring.rest[0]),
      peak: ring.peak[0] + t * (ring.peak[1] - ring.peak[0]),
    });
  }

  return ticks;
}

export function AmbientHalo() {
  return (
    <div className="halo" aria-hidden="true">
      {RINGS.map((ring, r) => (
        <div key={ring.name} className={`halo-spiral is-${ring.name}`}>
          {buildTicks(ring, r * 37).map((tick, i) => (
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
      ))}
    </div>
  );
}
