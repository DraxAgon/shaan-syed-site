import type { CSSProperties } from "react";

/* The rings behind the pages.

   A ring is a spiral of small brass ticks wound out from a centre that
   sits off an edge of the window, so the window cuts it and what is left
   reads as an arc rather than as a circle drawn around the page. At rest
   they are barely on the plate at all. A glow travels each spiral one
   tick at a time, then the ring is quiet for a few seconds and does it
   again, and it never stops doing that.

   Every page gets its own pair, and no two pages get the same one: the
   corners they hang off, their size, their wind and how often they come
   round all change from page to page, so moving through the site is not
   the same flourish four times. Within a page the two rings run on
   clocks that share no beat, so they are never in step twice running.

   Every number below is fixed, so this stays a server component: no
   script, no hydration, and the whole thing is one CSS animation per
   tick with a delay that says where in the wave that tick sits. */

/* Which edge or corner the centre hangs off. The offsets live in the
   CSS beside everything else that knows about the window. */
type Place =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type Ring = {
  place: Place;
  count: number;
  turns: number;
  /* Degrees. Where the sweep starts, and so which way the arc opens. */
  startAngle: number;
  inner: number;
  outer: number;
  /* Milliseconds from one tick lighting to the next. */
  step: number;
  /* Seconds for a whole turn of the ring: the sweep, then the wait. */
  cycle: number;
  /* Opacity waiting its turn, and lit, at the inner end and the outer.
     The outer end of a spiral runs over open plate and can afford more
     than the inner end, which is the one passing behind the text. */
  rest: [number, number];
  peak: [number, number];
};

export type HaloPage = "home" | "bio" | "projects" | "awards" | "notFound";

const ARRANGEMENTS: Record<HaloPage, Ring[]> = {
  /* The long arc up the identity column, and a tight one in the corner
     over the top of the work. */
  home: [
    {
      place: "left",
      count: 96,
      turns: 2.15,
      startAngle: -148,
      inner: 150,
      outer: 520,
      step: 46,
      cycle: 12.5,
      rest: [0.035, 0.055],
      peak: [0.62, 0.86],
    },
    {
      place: "top-right",
      count: 62,
      turns: 1.75,
      startAngle: 104,
      inner: 112,
      outer: 336,
      step: 42,
      cycle: 10.5,
      rest: [0.03, 0.05],
      peak: [0.44, 0.66],
    },
  ],

  /* The photo rail owns the left of this page, so the big ring goes to
     the bottom right, under the lists, and the small one clips the top
     left above the rail. */
  bio: [
    {
      place: "bottom-right",
      count: 88,
      turns: 2.05,
      startAngle: 22,
      inner: 140,
      outer: 480,
      step: 48,
      cycle: 13.5,
      rest: [0.03, 0.05],
      peak: [0.5, 0.74],
    },
    {
      place: "top-left",
      count: 54,
      turns: 1.6,
      startAngle: -64,
      inner: 100,
      outer: 300,
      step: 40,
      cycle: 9.5,
      rest: [0.03, 0.045],
      peak: [0.42, 0.6],
    },
  ],

  /* Everything on this page happens in the panel on the right, so the
     ring that carries the page is on the left of it, high, and the
     quick one is tucked into the far bottom corner. */
  projects: [
    {
      place: "top-left",
      count: 74,
      turns: 1.95,
      startAngle: -26,
      inner: 124,
      outer: 410,
      step: 44,
      cycle: 11.5,
      rest: [0.03, 0.05],
      peak: [0.46, 0.68],
    },
    {
      place: "bottom-right",
      count: 48,
      turns: 1.45,
      startAngle: 152,
      inner: 96,
      outer: 276,
      step: 38,
      cycle: 14.5,
      rest: [0.028, 0.045],
      peak: [0.4, 0.58],
    },
  ],

  /* A short page with a lot of white under it: the big ring comes in
     from the right at the height of the lists, the other off the bottom
     left where there is nothing else to look at. */
  awards: [
    {
      place: "right",
      count: 78,
      turns: 2.1,
      startAngle: -8,
      inner: 132,
      outer: 448,
      step: 45,
      cycle: 10,
      rest: [0.03, 0.05],
      peak: [0.48, 0.7],
    },
    {
      place: "bottom-left",
      count: 52,
      turns: 1.55,
      startAngle: 64,
      inner: 104,
      outer: 296,
      step: 41,
      cycle: 13,
      rest: [0.03, 0.045],
      peak: [0.44, 0.62],
    },
  ],

  /* One ring, low and wide, on a page with four words on it. */
  notFound: [
    {
      place: "bottom-left",
      count: 82,
      turns: 2,
      startAngle: 40,
      inner: 136,
      outer: 460,
      step: 47,
      cycle: 11,
      rest: [0.035, 0.055],
      peak: [0.54, 0.78],
    },
  ],
};

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
   Each ring is offset into a different part of those curves, so no two
   break up the same way. */
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

export function AmbientHalo({ page }: { page: HaloPage }) {
  return (
    <div className="halo" aria-hidden="true">
      {ARRANGEMENTS[page].map((ring, r) => (
        <div
          key={ring.place}
          className={`halo-spiral is-${ring.place}`}
          style={{ "--cycle": `${ring.cycle}s` } as CSSProperties}
        >
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
