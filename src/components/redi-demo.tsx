"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RediFilament } from "./redi-filament";
import { RediOrb, type RediState } from "./redi-orb";

/* A walkthrough of Redi AI, rebuilt screen by screen from the app itself.

   Redi is a React Native app with no public build, so this is not a capture.
   It is the real screens redrawn in the browser: the same layout, the same
   copy, the same colours out of `src/theme/color.ts`, the same 24 question
   promise, the same six skills with their own hues, and Redi's own face drawn
   from the ratios in `src/components/redi/rediConfig.ts`. What it cannot do is
   talk, so the audio is written on screen instead of spoken.

   Everything that would come from a model is fixed. The role you type is
   parsed by a few lines of regex below rather than sent anywhere, the scores
   are constants, and the panel says so. The transcript and the follow up are
   lifted verbatim out of the app's own QA log, so they are a real session's
   words rather than invented ones. */

/* ------------------------------------------------------------------ */
/* The role                                                            */
/* ------------------------------------------------------------------ */

type Kind = "Internship" | "Job" | "Scholarship" | "Academic";

type Role = {
  title: string;
  organisation: string | null;
  kind: Kind;
  setting: string;
  seniority: string;
  blurb: string;
};

/* The app's own worked example, from `QUESTIONS.md` role A. It is the text
   the placeholder asks for: the role, the company, what the round covers. */
const EXAMPLE =
  "Software engineering co-op at Shopify on the payments platform team. Backend work in Ruby and Go, plus some React on the merchant dashboard. I have done two prior internships: one building internal tooling in Python, one on a data pipeline with Kafka. Eight month term starting in January.";

const DEFAULT_ROLE: Role = {
  title: "Software Engineer",
  organisation: "Shopify",
  kind: "Internship",
  setting: "Large company",
  seniority: "Student",
  blurb:
    "Payments platform team at Shopify. Expect questions about backend engineering in Ruby and Go, plus building reliable merchant dashboards.",
};

/* The app sends this text to a model, which returns a title, an organisation,
   an interview type, a setting, a seniority and a blurb, each with its own
   confidence. Nothing is sent anywhere here, so this stands in: enough to make
   the walkthrough follow what you actually typed, and honest about being a
   guess when it is one. */
function readRole(input: string): { role: Role; guessed: boolean } {
  const text = input.trim().replace(/\s+/g, " ");
  if (!text || text === EXAMPLE) return { role: DEFAULT_ROLE, guessed: false };

  const lower = text.toLowerCase();

  /* Internship is tested before Academic, and every term carries word
     boundaries: unanchored "program" made a Program Manager a student, and
     unanchored "college" did the same to anyone working at one. */
  const kind: Kind = /scholarship|bursary|award|grant/.test(lower)
    ? "Scholarship"
    : /\bintern(ship)?s?\b|\bco.?op\b|\bplacement\b|\bsummer\b/.test(lower)
      ? "Internship"
      : /\b(university|grad(uate)? school|phd|doctorate|master'?s|admissions?|undergrad(uate)?|msc|mba)\b/.test(
            lower,
          )
        ? "Academic"
        : "Job";

  /* "Software engineer at Shopify" and "Barista, Starbucks" are both common
     ways to write it, so both separators are read. */
  const first = text.split(/[.;]\s/)[0];
  /* An employer is a couple of words, not the rest of the sentence, so the
     organisation stops at the first word that opens a new clause. Anchored to
     the end it read "Nike for the summer" out of "Marketing internship at
     Nike for the summer". */
  const at = first.match(
    /^(.{2,60}?)\s+(?:at|with|for)\s+(.{2,40}?)(?=$|,|\s+(?:on|in|for|from|during|working|starting|this|next|over)\b)/i,
  );
  const comma = first.match(/^(.{2,60}?),\s+(.{2,40}?)$/);
  const pair = at ?? comma;

  const rawTitle = (pair ? pair[1] : first).replace(/[,.]$/, "").trim();
  const organisation = pair ? pair[2].replace(/[,.]$/, "").trim() : null;

  /* Anything cut off the end was a clause, not the name, so this was a read
     rather than something typed plainly. The app marks that as a guess. */
  const trimmed = !!(at && at[0].length < first.length);

  const title = rawTitle
    .split(" ")
    .slice(0, 6)
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());

  return {
    role: {
      title: title || "Interview",
      organisation: kind === "Scholarship" ? null : organisation,
      kind,
      setting:
        kind === "Scholarship"
          ? "Nonprofit"
          : organisation
            ? "Large company"
            : "Not sure yet",
      seniority: kind === "Job" ? "Early career" : "Student",
      blurb:
        kind === "Scholarship"
          ? `Panel interview for the ${title}. Expect questions about what you have started yourself, and why it mattered enough to keep going.`
          : kind === "Academic"
            ? `${title}. Expect questions about why this programme over the others, and what you have built outside of coursework.`
            : `${title}${organisation ? ` at ${organisation}` : ""}. Expect questions about the work you have owned end to end, and what you did when it went wrong.`,
    },
    /* The app marks any field the model was unsure of. Typed input that did not
       name an organisation is exactly that case. */
    guessed: !organisation || trimmed,
  };
}

/* ------------------------------------------------------------------ */
/* The session                                                         */
/* ------------------------------------------------------------------ */

/* Two real turns out of the app's QA transcript: the question, the answer a
   test profile gives it, and the follow up that answer earns. A strong answer
   with a number in it draws "How did you measure that?" rather than one of the
   generic probes, which is the behaviour the follow up engine exists for. */
const QUESTION =
  "Tell me about something you were responsible for where the outcome was entirely down to you.";

/* The two sentences the follow up is a response to. The full answer runs to
   about a hundred words; this is the half of it with a figure in. */
const SAID =
  "I split the work into three stages, moved ten percent of traffic first, and watched the failure rate for a week. It sat at nought point two percent, which was lower than the old system.";

const FOLLOW_UP = "How did you measure that?";

/* ------------------------------------------------------------------ */
/* The six skills                                                      */
/* ------------------------------------------------------------------ */

/* Names from `src/shared/skills.ts`, hues from `SKILL_HUES` in
   `src/theme/color.ts`. Redi never prints a point score for a skill and never
   totals them into one number, so these are ranges, and the width of the range
   is how sure it is. */
const SKILLS = [
  {
    name: "Storytelling and Structure",
    hue: "#C667BC",
    low: 58,
    high: 74,
    note: "3 answers, 3:41. The migration answer opened on the situation and closed on the number.",
  },
  {
    name: "Ownership and Impact",
    hue: "#A986CB",
    low: 64,
    high: 80,
    note: "2 answers, 2:33. You said what you did rather than what the team did.",
  },
  {
    name: "Conflict and Interpersonal",
    hue: "#4E9AD9",
    low: 41,
    high: 63,
    note: "1 answer, 1:01. Enough to point at, not enough to bank.",
  },
  {
    name: "Failure and Growth",
    hue: "#D4708F",
    low: 24,
    high: 44,
    note: "1 answer, 0:52. Nothing went wrong in any of these, so there was little to read.",
    emphasis: true,
  },
  {
    name: "Motivation and Fit",
    hue: "#7B87E0",
    low: 55,
    high: 71,
    note: "1 answer, 0:48. You named the queue rewrite post, which is specific to them.",
  },
  {
    name: "Delivery and Presence",
    hue: "#3FAAA4",
    low: 62,
    high: 78,
    note: "You held your volume all the way through, including the ends of sentences.",
    measured: true,
  },
] as const;

/* `scoreBand` in `src/theme/index.ts`. */
function band(score: number) {
  if (score <= 50) return "WEAK";
  if (score <= 70) return "DEVELOPING";
  if (score <= 85) return "SOLID";
  return "STRONG";
}

/* ------------------------------------------------------------------ */
/* The walkthrough                                                     */
/* ------------------------------------------------------------------ */

type StepId =
  | "home"
  | "compose"
  | "reading"
  | "confirm"
  | "asking"
  | "answering"
  | "followup"
  | "thinking"
  | "report";

type Step = {
  id: StepId;
  /* Only the named stops appear in the rail. The three transitions run on a
     timer between them, the way they do in the app. */
  stop?: string;
  caption: string;
};

const STEPS: Step[] = [
  {
    id: "home",
    stop: "Home",
    caption:
      "One gold object per screen, and on Home it is the button that starts a session.",
  },
  {
    id: "compose",
    stop: "Add a role",
    caption:
      "One box. Type your own and the rest of the walkthrough follows it. The size of the field is the instruction.",
  },
  {
    id: "reading",
    caption: "No spinner anywhere in Redi. The line travels while it reads.",
  },
  {
    id: "confirm",
    stop: "What it worked out",
    caption:
      "It pulls the role apart and shows you, so a wrong guess is one tap to fix before any question is written.",
  },
  {
    id: "asking",
    stop: "The question",
    caption:
      "Redi says it out loud and the words appear as he reaches them. From here he is a 44px mark: the question is the product.",
  },
  {
    id: "answering",
    caption:
      "You answer out loud. The line under the mic is the same object as the hairline on the role card, now carrying your voice.",
  },
  {
    id: "followup",
    stop: "The follow up",
    caption:
      "The answer named a figure, so the follow up asks about the figure. A thin answer gets a different probe, and a strong one gets none.",
  },
  {
    id: "thinking",
    caption:
      "Redi thinking is the loading state. There is nothing else to watch. That was the eighth question, so what he is writing is the report.",
  },
  {
    id: "report",
    stop: "The report",
    caption:
      "Six skills, each a range rather than a point, because the width of the range is how sure it is. Redi never totals them into one number.",
  },
];

const STOPS = STEPS.filter((s) => s.stop);

/* How long each transition holds before it moves itself on. */
const AUTO: Partial<Record<StepId, number>> = {
  reading: 1900,
  thinking: 1700,
};

const COMPOSE = STEPS.findIndex((s) => s.id === "compose");

export function RediDemo() {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState(EXAMPLE);
  const [applied, setApplied] = useState(EXAMPLE);
  const [openSkill, setOpenSkill] = useState<number | null>(null);

  const step = STEPS[index];
  const { role, guessed } = useMemo(() => readRole(applied), [applied]);

  /* Every move past the compose screen commits the box, not just the phone's
     own Continue. Jumping through the rail used to leave `applied` at the
     example, so the confirm screen disagreed with the words still sitting in
     the textarea behind it. */
  const jump = useCallback(
    (next: number) => {
      const to = Math.max(0, Math.min(next, STEPS.length - 1));
      if (to > COMPOSE) setApplied(draft);
      setIndex(to);
    },
    [draft],
  );

  const go = useCallback(
    (id: StepId) => {
      const next = STEPS.findIndex((s) => s.id === id);
      if (next >= 0) jump(next);
    },
    [jump],
  );

  /* The two transition screens move themselves on, so the walkthrough reads as
     a flow rather than as nine slides. */
  useEffect(() => {
    const hold = AUTO[step.id];
    if (!hold) return;
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, STEPS.length - 1)),
      hold,
    );
    return () => window.clearTimeout(timer);
  }, [step.id]);

  const advance = () => jump(index + 1);

  const atEnd = index === STEPS.length - 1;

  const restart = () => {
    setIndex(0);
    setOpenSkill(null);
  };

  return (
    <div className="rw">
      <div className="rw-phone-holder">
        <Phone
          step={step}
          role={role}
          guessed={guessed}
          draft={draft}
          onDraft={setDraft}
          openSkill={openSkill}
          onOpenSkill={setOpenSkill}
          onAdvance={advance}
          onGo={go}
        />
      </div>

      <div className="rw-side">
        <div className="rw-head">
          <span className="rw-mark">Redi AI</span>
          <span className="rw-tag">Rebuilt from the app</span>
        </div>

        <ol className="rw-stops">
          {STOPS.map((stop) => {
            const at = STEPS.findIndex((s) => s.id === stop.id);
            const on = index >= at;
            const here = step.id === stop.id;
            return (
              <li key={stop.id}>
                <button
                  type="button"
                  className={`rw-stop${here ? " is-here" : ""}${on ? " is-done" : ""}`}
                  aria-current={here ? "step" : undefined}
                  onClick={() => jump(at)}
                >
                  <span className="rw-stop-mark" aria-hidden="true" />
                  <span className="rw-stop-name">{stop.stop}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rw-say">
          {/* A stable region, deliberately not the caption below: that one
              carries key={step.id} to replay its animation, and a region that
              remounts announces nothing. This is also the only thing that
              speaks on the two screens that advance themselves. */}
          <p className="sr-only" aria-live="polite">
            {step.stop ?? "Transition"}. {step.caption}
          </p>
          <p className="rw-caption" key={step.id}>
            {step.caption}
          </p>

          {/* The run screen shows a waveform and nothing else while somebody
              talks, so the words go here rather than on the phone. This is the
              part of the answer the follow up is about. */}
          {step.id === "answering" || step.id === "followup" ? (
            <blockquote className="rw-said">
              <span className="rw-said-label">What was said</span>
              {SAID}
            </blockquote>
          ) : null}
        </div>

        <div className="rw-controls">
          <button
            type="button"
            className="rw-nav"
            onClick={() => {
              /* The transitions move themselves on, so stepping back into one
                 just throws you forward again. Back walks past them to the
                 last screen the visitor actually chose. */
              let next = index - 1;
              while (next > 0 && AUTO[STEPS[next].id]) next -= 1;
              jump(next);
            }}
            disabled={index === 0}
          >
            Back
          </button>
          {/* The report is the end of the loop, so the forward control stops
              being Next and becomes the way back to the top. The role you
              typed is kept: the second run through is worth more with your own
              words in it than with the example back. */}
          <button
            type="button"
            className="rw-nav is-primary"
            onClick={atEnd ? restart : advance}
          >
            {atEnd ? "Start again" : "Next"}
          </button>
        </div>

        <p className="rw-note">
          The screens, the copy and the colours are the app&rsquo;s own. The
          scores are fixed and nothing here calls a model.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The device                                                          */
/* ------------------------------------------------------------------ */

function Phone({
  step,
  role,
  guessed,
  draft,
  onDraft,
  openSkill,
  onOpenSkill,
  onAdvance,
  onGo,
}: {
  step: Step;
  role: Role;
  guessed: boolean;
  draft: string;
  onDraft: (value: string) => void;
  openSkill: number | null;
  onOpenSkill: (i: number | null) => void;
  onAdvance: () => void;
  onGo: (id: StepId) => void;
}) {
  const session =
    step.id === "asking" ||
    step.id === "answering" ||
    step.id === "followup" ||
    step.id === "thinking";

  /* The phone's own controls replace the screen under whoever pressed them, so
     the screen that arrives takes the focus the old one lost. Skipping the
     first mount keeps the panel from stealing focus on page load, and
     preventScroll matters because .rp is transform-scaled. */
  const screen = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    screen.current?.focus({ preventScroll: true });
  }, [step.id]);

  return (
    <div
      className="rp"
      role="group"
      aria-label={`Redi AI, ${step.stop ?? step.id}`}
    >
      <div className="rp-screen">
        {/* The device status bar, so the app's own chrome reads as app chrome
            rather than as the panel's. */}
        <div className="rp-status" aria-hidden="true">
          <span className="rp-clock">9:41</span>
          <svg className="rp-signal" viewBox="0 0 66 14" width="66" height="14">
            <path
              d="M1 10.5v2.5M5.5 8v5M10 5.5v7.5M14.5 3v10"
              stroke="#F4F1EA"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M23 5.5a9 9 0 0 1 11 0M25.5 9a5.5 5.5 0 0 1 6 0"
              fill="none"
              stroke="#F4F1EA"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <circle cx="28.5" cy="12" r="1.5" fill="#F4F1EA" />
            <rect
              x="42"
              y="3"
              width="21"
              height="10"
              rx="3"
              fill="none"
              stroke="#F4F1EA"
              strokeOpacity="0.5"
            />
            <rect x="44" y="5" width="15" height="6" rx="1.5" fill="#F4F1EA" />
            <path
              d="M64.5 6.5v3"
              stroke="#F4F1EA"
              strokeOpacity="0.5"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        <div
          className="rp-app"
          data-screen={step.id}
          ref={screen}
          tabIndex={-1}
        >
          {step.id === "home" ? <Home role={role} onGo={onGo} /> : null}
          {step.id === "compose" ? (
            <Compose
              draft={draft}
              onDraft={onDraft}
              onAdvance={onAdvance}
              onGo={onGo}
            />
          ) : null}
          {step.id === "reading" ? <Reading /> : null}
          {step.id === "confirm" ? (
            <Confirm
              role={role}
              guessed={guessed}
              onAdvance={onAdvance}
              onGo={onGo}
            />
          ) : null}
          {session ? (
            <Run step={step.id} role={role} onAdvance={onAdvance} />
          ) : null}
          {step.id === "report" ? (
            <Report
              role={role}
              openSkill={openSkill}
              onOpenSkill={onOpenSkill}
              onGo={onGo}
            />
          ) : null}
        </div>

        {/* The tab bar is on the four tab screens and nowhere else. Everything
            in the role and session stacks is a full screen push. */}
        {step.id === "home" ? <TabBar /> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared app furniture                                                */
/* ------------------------------------------------------------------ */

function Chrome({
  onBack,
  mark = false,
  right,
}: {
  onBack?: () => void;
  mark?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div className="ra-chrome">
      {onBack ? (
        <button
          type="button"
          className="ra-back"
          onClick={onBack}
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M15 5 8 12l7 7"
              fill="none"
              stroke="#E9B33B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <span className="ra-back is-empty" aria-hidden="true" />
      )}
      {right ?? null}
      {/* 44px, top right, never larger. It is a signature, not a control. */}
      {mark ? <RediOrb size={44} state="idle" className="ra-mark" /> : null}
    </div>
  );
}

function Header({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="ra-header">
      <p className="ra-eyebrow">{eyebrow}</p>
      <h3 className="ra-title">{title}</h3>
    </div>
  );
}

function SectionHead({ label, action }: { label: string; action?: string }) {
  return (
    <div className="ra-sect">
      <span className="ra-sect-rule" aria-hidden="true" />
      <span className="ra-sect-label">{label}</span>
      {action ? (
        <span className="ra-sect-action">
          {action}
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="m9 5 7 7-7 7"
              fill="none"
              stroke="#9C9891"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
    </div>
  );
}

/* The coverage gauge on a role card. 96dp of track, gold to the band's
   fraction, and the band's name beside it. A brand new role draws no gold at
   all rather than a stub, because a stub is progress that is not there. */
function Coverage({
  progress,
  label,
  dim = true,
}: {
  progress: number;
  label: string;
  dim?: boolean;
}) {
  return (
    <div className="ra-cov">
      <span className="ra-cov-gauge">
        <RediFilament
          state="hairline"
          progress={progress}
          height={2}
          dim={dim}
        />
      </span>
      <span className="ra-cov-label">{label}</span>
    </div>
  );
}

function Primary({
  label,
  onClick,
  disabled,
  describedBy,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      className="ra-primary"
      onClick={onClick}
      disabled={disabled}
      aria-describedby={describedBy}
    >
      {label}
    </button>
  );
}

function Secondary({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="ra-secondary" onClick={onClick}>
      {label}
    </button>
  );
}

function TabBar() {
  const tabs = ["Home", "Roles", "Stats", "Settings"];
  return (
    <div className="ra-tabs" aria-hidden="true">
      <span className="ra-tabs-mark" />
      {tabs.map((tab, i) => (
        <span key={tab} className={`ra-tab${i === 0 ? " is-on" : ""}`}>
          <span className="ra-tab-icon">{TAB_ICONS[i]}</span>
          {tab}
        </span>
      ))}
    </div>
  );
}

const TAB_ICONS = [
  <svg key="h" viewBox="0 0 24 24" width="20" height="20">
    <path
      d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>,
  <svg key="r" viewBox="0 0 24 24" width="20" height="20">
    <path
      d="M4 6h16M4 12h16M4 18h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="s" viewBox="0 0 24 24" width="20" height="20">
    <path
      d="M5 19V11M12 19V5M19 19v-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="g" viewBox="0 0 24 24" width="20" height="20">
    <circle
      cx="12"
      cy="12"
      r="3.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>,
];

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function Home({ role, onGo }: { role: Role; onGo: (id: StepId) => void }) {
  return (
    <div className="ra-scroll">
      <Chrome mark />
      {/* The eyebrow is the greeting, read off the device clock. Four bands,
          because midnight is not morning. */}
      <Header eyebrow="Good evening" title="What are we working on?" />

      {/* Reserved whether or not there is a pass to name, so the gold button
          can never be pushed down the screen after the screen is live. */}
      <div className="ra-passslot" />

      {/* The phone's own controls do what they do in the app, which is why
          this one goes to a question rather than to the next slide. The rail
          beside it is the walkthrough. */}
      <Primary label="Start a session" onClick={() => onGo("asking")} />

      <SectionHead label="Your roles" action="All roles" />
      <div className="ra-roles">
        <RoleCard
          title={role.title}
          org={role.organisation}
          progress={0.34}
          band="GETTING STARTED"
          onClick={() => onGo("asking")}
        />
        <RoleCard
          title="Schulich Leader Scholarship"
          org={null}
          progress={0}
          band="NOT STARTED"
          onClick={() => onGo("asking")}
        />
      </div>

      <SectionHead label="One question" />
      <button type="button" className="ra-drill" onClick={() => onGo("asking")}>
        <span className="ra-drill-tile">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M13 2 4 14h6l-1 8 9-12h-6z"
              fill="none"
              stroke="#9C9891"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="ra-drill-body">
          <span className="ra-drill-name">Start drill</span>
          <span className="ra-drill-sub">
            One question. Unlimited, free forever.
          </span>
        </span>
      </button>
    </div>
  );
}

function RoleCard({
  title,
  org,
  progress,
  band: bandLabel,
  onClick,
}: {
  title: string;
  org: string | null;
  progress: number;
  band: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="ra-role" onClick={onClick}>
      <span className="ra-role-name">{title}</span>
      {org ? <span className="ra-role-org">{org}</span> : null}
      <Coverage progress={progress} label={bandLabel} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Add a role                                                          */
/* ------------------------------------------------------------------ */

function Compose({
  draft,
  onDraft,
  onAdvance,
  onGo,
}: {
  draft: string;
  onDraft: (v: string) => void;
  onAdvance: () => void;
  onGo: (id: StepId) => void;
}) {
  const ready = draft.trim().length >= 3;

  return (
    <div className="ra-scroll has-footer">
      <Chrome onBack={() => onGo("home")} />
      <Header
        eyebrow="Add role · Step 1 of 2"
        title={
          <>
            What are you
            <br />
            interviewing for?
          </>
        }
      />

      <p className="ra-lead">
        The role, the company, what they said the round would cover. As much or
        as little as you like. The more you tell me, the better the questions
        get.
      </p>

      <label className="ra-field">
        <span className="ra-field-label">What you are interviewing for</span>
        <textarea
          id="ra-role-input"
          className="ra-input"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          rows={6}
          maxLength={4000}
          spellCheck={false}
          aria-describedby={ready ? undefined : "ra-role-reason"}
        />
      </label>

      {/* Part of the screen rather than part of the walkthrough: the app opens
          a file picker here and this does not attach anything, so it is drawn
          and not wired. */}
      <span className="ra-ghost">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path
            d="M20 11 11.5 19.5a4.6 4.6 0 0 1-6.5-6.5L13 5a3 3 0 0 1 4.3 4.3l-8 8a1.4 1.4 0 0 1-2-2l7.6-7.6"
            fill="none"
            stroke="#9C9891"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Attach a document
      </span>

      <div className="ra-footer">
        <Primary
          label="Continue"
          onClick={onAdvance}
          disabled={!ready}
          describedBy={ready ? undefined : "ra-role-reason"}
        />
        {/* The app prints the reason a disabled button is disabled, rather than
            leaving somebody to work it out. The button is genuinely disabled:
            an empty box used to advance and quietly reinstate the example role
            as though it were what the visitor had typed. */}
        {ready ? null : (
          <p className="ra-reason" id="ra-role-reason" role="status">
            Say what you are interviewing for to continue.
          </p>
        )}
      </div>
    </div>
  );
}

function Reading() {
  return (
    <div className="ra-scroll">
      <Chrome />
      <Header eyebrow="Add role · Step 1 of 2" title="Reading it" />
      <div className="ra-reading">
        <RediFilament state="travel" height={8} />
        <p className="ra-reading-line">Working out what this is</p>
      </div>
    </div>
  );
}

function Confirm({
  role,
  guessed,
  onAdvance,
  onGo,
}: {
  role: Role;
  guessed: boolean;
  onAdvance: () => void;
  onGo: (id: StepId) => void;
}) {
  const rows: Array<[string, string, boolean]> = [
    ["Type", role.kind, false],
    ["Company", role.organisation ?? "Not named", guessed],
    ["Setting", role.setting, guessed],
    ["Seniority", role.seniority, guessed],
  ];

  return (
    <div className="ra-scroll has-footer">
      <Chrome onBack={() => onGo("compose")} />
      <Header eyebrow="Add role · Step 2 of 2" title={role.title} />

      {role.organisation ? <p className="ra-org">{role.organisation}</p> : null}

      <div className="ra-confirm-cov">
        <Coverage progress={0} label="NOT STARTED" />
      </div>

      <p className="ra-blurb">{role.blurb}</p>

      <hr className="ra-rule" />
      <p className="ra-eyebrow ra-eyebrow-sect">What I worked out</p>
      <div className="ra-facts">
        {rows.map(([label, value, isGuess]) => (
          <div key={label} className="ra-fact">
            <span className="ra-fact-name">
              {label}
              {isGuess ? (
                <span className="ra-fact-guess">Best guess</span>
              ) : null}
            </span>
            <span className="ra-fact-value">
              {value}
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                aria-hidden="true"
              >
                <path
                  d="m9 5 7 7-7 7"
                  fill="none"
                  stroke="#66635E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ))}
      </div>

      <hr className="ra-rule" />
      {/* Tense matters here: nothing has been written yet. */}
      <p className="ra-promise">
        Adding this starts 24 questions being written around it. You will not
        see them until a session starts.
      </p>

      <div className="ra-escape">
        <Secondary
          label="Tell Redi more first"
          onClick={() => onGo("compose")}
        />
      </div>

      <div className="ra-footer">
        <Primary label="Add role" onClick={onAdvance} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The session                                                         */
/* ------------------------------------------------------------------ */

function Run({
  step,
  role,
  onAdvance,
}: {
  step: StepId;
  role: Role;
  onAdvance: () => void;
}) {
  const asking = step === "asking";
  const answering = step === "answering";
  const followup = step === "followup";
  const thinking = step === "thinking";

  /* The thinking screen is what follows the follow up, and the app holds the
     last spoken line on screen while Redi works. Reverting to the original
     question here would re-mount the paragraph and replay its fade. */
  const text = followup || thinking ? FOLLOW_UP : QUESTION;

  /* Redi's mouth is driven by the words as they land, so the face moves with
     the line rather than to a loop. The app feeds the same input from the
     playing clip's amplitude. */
  const { revealed, amplitude, done } = useSpokenWords(
    text,
    asking || followup,
  );
  const level = useVoiceLevel(answering);

  /* Speaking and grace are two phases of one screen, and the app draws them
     differently: while he is talking there is no mic at all, only the line and
     the words. The mic arrives when he stops, which is what makes tapping it
     feel like answering a person rather than starting a recording. */
  const speaking = (asking || followup) && !done;
  const grace = (asking || followup) && done;

  /* The clock belongs to the session rather than to the screen, so it runs on
     across the four of them. Where it lands is where the report's own "10:22
     of talking" has to have come from. */
  /* The session clock is the distance from startedAt, so it only ever goes
     forward, and the answering reading has to sit a full answer after the
     asking one: 13:18 plus the 0:47 the answer timer shows. It read 13:42,
     which put the start of the answer 23 seconds before the question. */
  const elapsed = thinking
    ? "15:06"
    : followup
      ? "14:31"
      : answering
        ? "14:05"
        : "13:18";

  const rediState: RediState = thinking
    ? "thinking"
    : answering
      ? "listening"
      : speaking
        ? "speaking"
        : "idle";

  return (
    <div className="ra-run">
      {/* One segment per question, at the very top. A follow up never takes a
          segment: it belongs to the question that earned it. The walkthrough
          stands on the last of the eight, so the report is the next screen
          rather than something it skips five questions to reach. */}
      <div className="ra-progress" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span key={i} className={`ra-seg${i < 7 ? " is-done" : " is-now"}`} />
        ))}
      </div>

      <div className="ra-run-chrome">
        <span className="ra-pause" aria-hidden="true">
          <span />
          <span />
        </span>
        <RediOrb
          size={44}
          state={rediState}
          amplitude={amplitude}
          className="ra-run-mark"
        />
        <span className="ra-elapsed">{elapsed}</span>
      </div>

      <div className="ra-pill-slot">
        {thinking ? null : (
          <span className="ra-pill">
            <span className="ra-pill-rule" />
            {followup ? "Follow up" : "Question"}
            <span className="ra-pill-rule" />
          </span>
        )}
      </div>

      {/* The question is always the largest thing on the screen it is on. */}
      <p className={`ra-question${answering ? " is-receded" : ""}`}>
        {revealed.map((word, i) => (
          <span key={`${word}-${i}`} className="ra-word">
            {word}{" "}
          </span>
        ))}
      </p>

      <div className="ra-run-spacer" />

      {answering ? (
        <div className="ra-mic-area">
          <p className="ra-answer-timer">0:47</p>
          <button
            type="button"
            className="ra-mic is-live"
            onClick={onAdvance}
            aria-label="Stop answering"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <rect x="9" y="2.5" width="6" height="11" rx="3" fill="#E9B33B" />
              <path
                d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"
                fill="none"
                stroke="#E9B33B"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="ra-caption-row" />
          <div className="ra-turn-filament">
            <RediFilament state="wave" amplitude={level} height={24} />
          </div>
          {/* The app puts "Take your time." in this row after twelve seconds
              of silence. The waveform here is moving, so the row is reserved
              and left empty rather than saying it. */}
          <div className="ra-lifeline" />
          <div className="ra-run-bottom">
            <Secondary label="Done" onClick={onAdvance} />
          </div>
        </div>
      ) : thinking ? (
        <div className="ra-turn-status">
          <div className="ra-turn-filament">
            <RediFilament state="pulse" height={24} />
          </div>
          <p className="ra-turn-line">Thinking about that</p>
        </div>
      ) : grace ? (
        <div className="ra-mic-area">
          {/* Reserved, like the caption row and the lifeline beneath it. It
              held a transparent "0:00" that no sighted visitor could see and
              every screen reader read out as a running timer. */}
          <p className="ra-answer-timer" />
          <button
            type="button"
            className="ra-mic"
            onClick={onAdvance}
            aria-label="Tap to answer"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <rect x="9" y="2.5" width="6" height="11" rx="3" fill="#E9B33B" />
              <path
                d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"
                fill="none"
                stroke="#E9B33B"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="ra-caption-row">Tap to answer</div>
          <div className="ra-turn-filament">
            <RediFilament state="hairline" progress={1} height={24} dim />
          </div>
          <div className="ra-lifeline" />
          <div className="ra-run-bottom" />
        </div>
      ) : (
        /* While he is talking there is no control at all: the line and the
           words are the whole screen. */
        <div className="ra-turn-status">
          <div className="ra-turn-filament">
            <RediFilament state="hairline" progress={1} height={24} dim />
          </div>
          <p className="ra-turn-line">Redi is speaking</p>
        </div>
      )}

      <span className="sr-only">
        Practising {role.title}
        {role.organisation ? ` at ${role.organisation}` : ""}. Question eight of
        eight, the last one.
      </span>
    </div>
  );
}

/* The words arrive as he reaches them, and the mouth opens on the syllables.
   Both come off one clock so the caption and the face cannot drift, which in
   the app is the bug this shape exists to prevent. */
function useSpokenWords(text: string, active: boolean) {
  const words = useMemo(() => text.split(" "), [text]);

  /* One state object, written only from inside the frame callback. Nothing
     resets it on the way in: the line it belongs to is part of the value, so
     a line that has not started yet is read as not started rather than being
     set back to zero by an effect. */
  const [frame, setFrame] = useState({
    line: "",
    count: 0,
    amplitude: 0,
    done: false,
  });
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      /* One frame, straight to the rest pose. Every loop is skipped. */
      raf.current = requestAnimationFrame(() =>
        setFrame({ line: text, count: words.length, amplitude: 0, done: true }),
      );
      return () => cancelAnimationFrame(raf.current);
    }

    const start = performance.now();
    /* About three words a second, which is close to Redi's own pace. */
    const perWord = 340;

    const tick = (now: number) => {
      const t = now - start;
      const spoken = Math.min(words.length, Math.floor(t / perWord) + 1);

      if (spoken >= words.length && t > words.length * perWord + 500) {
        setFrame({ line: text, count: words.length, amplitude: 0, done: true });
        return;
      }

      /* An envelope rather than a sine: syllables inside a word, and a dip at
         the gap between words. */
      const phase = (t % perWord) / perWord;
      const shape = Math.sin(phase * Math.PI) ** 0.7;
      const wobble = 0.72 + 0.28 * Math.sin(t / 47);

      setFrame({
        line: text,
        count: spoken,
        amplitude: shape * wobble,
        done: false,
      });
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, active, words.length]);

  const started = frame.line === text;

  if (!active) return { revealed: words, amplitude: 0, done: true };
  if (!started) return { revealed: [] as string[], amplitude: 0, done: false };
  return {
    revealed: words.slice(0, frame.count),
    amplitude: frame.amplitude,
    done: frame.done,
  };
}

/* A stand in for the microphone's output level, which is what drives the
   waveform and Redi's glow in the app. */
function useVoiceLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      /* The waveform holds a still reading rather than running. */
      raf.current = requestAnimationFrame(() => setLevel(0.4));
      return () => cancelAnimationFrame(raf.current);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      /* Speech, not a tone: a slow phrase envelope with syllables riding on it,
         and real gaps where somebody draws breath. */
      const phrase = Math.max(0, Math.sin(t * 0.62) * 0.5 + 0.5) ** 0.8;
      const syllable = 0.55 + 0.45 * Math.sin(t * 11.4);
      setLevel(Math.max(0.04, phrase * syllable));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return active ? level : 0;
}

/* ------------------------------------------------------------------ */
/* The report                                                          */
/* ------------------------------------------------------------------ */

function Report({
  role,
  openSkill,
  onOpenSkill,
  onGo,
}: {
  role: Role;
  openSkill: number | null;
  onOpenSkill: (i: number | null) => void;
  onGo: (id: StepId) => void;
}) {
  return (
    <div className="ra-scroll has-footer">
      <Chrome onBack={() => onGo("home")} mark />
      <Header eyebrow="Report · 22 Aug" title={role.title} />

      {/* Length is the fraction of the six skills this session put evidence
          behind. It is the same object as the hairline on the role card, and
          at 40 percent because the footer's button is this screen's gold. */}
      <div className="ra-report-fil">
        <RediFilament state="hairline" progress={1} height={8} dim />
      </div>

      {/* The app sums the five content skills and leaves Delivery out, since it
          is a second reading of the same answers. 3:41 + 2:33 + 1:01 + 0:52 +
          0:48 is 8:55, so that is what the headline says. */}
      <p className="ra-evidence">
        8 answers, 8:55 of talking, across 6 skills.
      </p>
      <p className="ra-summary">
        The migration answer was the strongest thing here. Nothing you told me
        went wrong, so there was very little for me to read on failure.
      </p>

      <hr className="ra-rule" />
      <p className="ra-eyebrow ra-eyebrow-sect">What I saw</p>

      <div className="ra-skills">
        {SKILLS.map((skill, i) => {
          const open = openSkill === i;
          const mid = Math.round((skill.low + skill.high) / 2);
          return (
            <div
              key={skill.name}
              className={`ra-skill${"emphasis" in skill && skill.emphasis ? " is-emphasis" : ""}`}
            >
              {"emphasis" in skill && skill.emphasis ? (
                <p className="ra-skill-eyebrow">Work on this first</p>
              ) : null}
              {"measured" in skill && skill.measured ? (
                <p className="ra-skill-measured">Measured across the session</p>
              ) : null}

              <button
                type="button"
                className="ra-skill-head"
                aria-expanded={open}
                onClick={() => onOpenSkill(open ? null : i)}
              >
                <span
                  className="ra-skill-dot"
                  style={{ background: skill.hue }}
                />
                <span className="ra-skill-name">{skill.name}</span>
                <span className="ra-skill-range">
                  {skill.low} to {skill.high}
                </span>
              </button>

              {/* The bar is a band from low to high, and its width is the
                  confidence. A point score would claim more than Redi knows. */}
              <span className="ra-skill-track">
                <span
                  className="ra-skill-band"
                  style={{
                    left: `${skill.low}%`,
                    width: `${skill.high - skill.low}%`,
                    background: skill.hue,
                  }}
                />
              </span>

              {open ? (
                <p className="ra-skill-note">
                  <span className="ra-skill-band-word">{band(mid)}</span>
                  {skill.note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Strengths before deficits, always. */}
      <div className="ra-worked">
        <p className="ra-worked-eyebrow">What worked</p>
        <div className="ra-worked-row">
          <span className="ra-worked-rail" style={{ background: "#A986CB" }} />
          <span className="ra-worked-body">
            <span className="ra-worked-skill" style={{ color: "#A986CB" }}>
              OWNERSHIP AND IMPACT
            </span>
            <span className="ra-worked-text">
              You wrote the rollback plan because nobody had, and you said so
              without dressing it up.
            </span>
          </span>
        </div>
      </div>

      <div className="ra-footer">
        <Primary
          label="Run this interview again"
          onClick={() => onGo("asking")}
        />
      </div>
    </div>
  );
}
