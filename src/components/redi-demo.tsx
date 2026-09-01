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

  const kind: Kind = /scholarship|bursary|award|grant/.test(lower)
    ? "Scholarship"
    : /university|college|programme|program|graduate school|grad school|admission|degree|master|phd/.test(
          lower,
        )
      ? "Academic"
      : /intern|co.?op|placement|summer/.test(lower)
        ? "Internship"
        : "Job";

  /* "Software engineer at Shopify" and "Barista, Starbucks" are both common
     ways to write it, so both separators are read. */
  const first = text.split(/[.;]\s/)[0];
  const at = first.match(/^(.{2,60}?)\s+(?:at|with|for)\s+(.{2,40}?)$/i);
  const comma = first.match(/^(.{2,60}?),\s+(.{2,40}?)$/);
  const pair = at ?? comma;

  const rawTitle = (pair ? pair[1] : first).replace(/[,.]$/, "").trim();
  const organisation = pair ? pair[2].replace(/[,.]$/, "").trim() : null;

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
        kind === "Scholarship" ? "Nonprofit" : organisation ? "Large company" : "Not sure yet",
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
    guessed: !organisation,
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

const ANSWER =
  "Last spring I took over the payments migration after the lead left. There were about forty thousand stored cards and no rollback plan, so the first thing I did was write one, because I was not willing to cut over without it. I split the work into three stages, moved ten percent of traffic first, and watched the failure rate for a week. It sat at nought point two percent, which was lower than the old system. We finished two weeks ahead and nobody outside the team noticed it had happened, which was the goal.";

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
    caption: "One gold object per screen, and on Home it is the button that starts a session.",
  },
  {
    id: "compose",
    stop: "Add a role",
    caption:
      "One box. Type your own and the rest of the walkthrough follows it. The size of the field is the instruction.",
  },
  { id: "reading", caption: "No spinner anywhere in Redi. The line travels while it reads." },
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
  { id: "thinking", caption: "Redi thinking is the loading state. There is nothing else to watch." },
  {
    id: "report",
    stop: "The report",
    caption:
      "Six skills, each a range rather than a point, because the width of the range is how sure it is. There is no overall score anywhere in Redi.",
  },
];

const STOPS = STEPS.filter((s) => s.stop);

/* How long each transition holds before it moves itself on. */
const AUTO: Partial<Record<StepId, number>> = {
  reading: 1900,
  thinking: 1700,
};

export function RediDemo() {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState(EXAMPLE);
  const [applied, setApplied] = useState(EXAMPLE);
  const [openSkill, setOpenSkill] = useState<number | null>(3);

  const step = STEPS[index];
  const { role, guessed } = useMemo(() => readRole(applied), [applied]);

  const go = useCallback((id: StepId) => {
    const next = STEPS.findIndex((s) => s.id === id);
    if (next >= 0) setIndex(next);
  }, []);

  /* The two transition screens move themselves on, so the walkthrough reads as
     a flow rather than as nine slides. */
  useEffect(() => {
    const hold = AUTO[step.id];
    if (!hold) return;
    const timer = window.setTimeout(() => setIndex((i) => Math.min(i + 1, STEPS.length - 1)), hold);
    return () => window.clearTimeout(timer);
  }, [step.id]);

  const advance = () => {
    if (step.id === "compose") setApplied(draft);
    setIndex((i) => Math.min(i + 1, STEPS.length - 1));
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
                  onClick={() => setIndex(at)}
                >
                  <span className="rw-stop-mark" aria-hidden="true" />
                  <span className="rw-stop-name">{stop.stop}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="rw-caption" key={step.id}>
          {step.caption}
        </p>

        <div className="rw-controls">
          <button
            type="button"
            className="rw-nav"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="rw-nav is-primary"
            onClick={advance}
            disabled={index === STEPS.length - 1}
          >
            Next
          </button>
        </div>

        <p className="rw-note">
          The screens, the copy and the colours are the app&rsquo;s own. The scores are fixed and
          nothing here calls a model.
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

  return (
    <div className="rp" role="group" aria-label={`Redi AI, ${step.stop ?? step.id}`}>
      <div className="rp-screen">
        {/* The device status bar, so the app's own chrome reads as app chrome
            rather than as the panel's. */}
        <div className="rp-status" aria-hidden="true">
          <span className="rp-clock">9:41</span>
          <span className="rp-signal" />
        </div>

        <div className="rp-app" data-screen={step.id}>
          {step.id === "home" ? <Home role={role} onGo={onGo} onAdvance={onAdvance} /> : null}
          {step.id === "compose" ? (
            <Compose draft={draft} onDraft={onDraft} onAdvance={onAdvance} onGo={onGo} />
          ) : null}
          {step.id === "reading" ? <Reading /> : null}
          {step.id === "confirm" ? (
            <Confirm role={role} guessed={guessed} onAdvance={onAdvance} onGo={onGo} />
          ) : null}
          {session ? <Run step={step.id} role={role} onAdvance={onAdvance} /> : null}
          {step.id === "report" ? (
            <Report role={role} openSkill={openSkill} onOpenSkill={onOpenSkill} onGo={onGo} />
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
        <button type="button" className="ra-back" onClick={onBack} aria-label="Back">
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

function Header({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
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
function Coverage({ progress, label, dim = true }: { progress: number; label: string; dim?: boolean }) {
  return (
    <div className="ra-cov">
      <span className="ra-cov-gauge">
        <RediFilament state="hairline" progress={progress} height={2} dim={dim} />
      </span>
      <span className="ra-cov-label">{label}</span>
    </div>
  );
}

function Primary({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" className="ra-primary" onClick={onClick}>
      {label}
    </button>
  );
}

function Secondary({ label, onClick }: { label: string; onClick?: () => void }) {
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
    <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
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

function Home({ role, onGo, onAdvance }: { role: Role; onGo: (id: StepId) => void; onAdvance: () => void }) {
  return (
    <div className="ra-scroll">
      <Chrome mark />
      {/* The eyebrow is the greeting, read off the device clock. Four bands,
          because midnight is not morning. */}
      <Header eyebrow="Good evening" title="What are we working on?" />

      {/* Reserved whether or not there is a pass to name, so the gold button
          can never be pushed down the screen after the screen is live. */}
      <div className="ra-passslot" />

      <Primary label="Start a session" onClick={onAdvance} />

      <SectionHead label="Your roles" action="All roles" />
      <div className="ra-roles">
        <RoleCard
          title={role.title}
          org={role.organisation}
          progress={0.34}
          band="GETTING STARTED"
          onClick={onAdvance}
        />
        <RoleCard
          title="Schulich Leader Scholarship"
          org={null}
          progress={0}
          band="NOT STARTED"
          onClick={onAdvance}
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
          <span className="ra-drill-sub">One question. Unlimited, free forever.</span>
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
        The role, the company, what they said the round would cover. As much or as little as you
        like. The more you tell me, the better the questions get.
      </p>

      <label className="ra-field">
        <span className="ra-field-label">What you are interviewing for</span>
        <textarea
          className="ra-input"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          rows={6}
          maxLength={4000}
          spellCheck={false}
        />
      </label>

      <button type="button" className="ra-ghost" onClick={onAdvance}>
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
      </button>

      <div className="ra-footer">
        <Primary label="Continue" onClick={onAdvance} />
        {/* The app prints the reason a disabled button is disabled, rather than
            leaving somebody to work it out. */}
        {ready ? null : (
          <p className="ra-reason">Say what you are interviewing for to continue.</p>
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
              {isGuess ? <span className="ra-fact-guess">Best guess</span> : null}
            </span>
            <span className="ra-fact-value">
              {value}
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
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
        Adding this starts 24 questions being written around it. You will not see them until a
        session starts.
      </p>

      <div className="ra-escape">
        <Secondary label="Tell Redi more first" onClick={() => onGo("compose")} />
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

  const text = followup ? FOLLOW_UP : QUESTION;

  /* Redi's mouth is driven by the words as they land, so the face moves with
     the line rather than to a loop. The app feeds the same input from the
     playing clip's amplitude. */
  const { revealed, amplitude } = useSpokenWords(text, asking || followup);
  const level = useVoiceLevel(answering);

  const rediState: RediState = thinking
    ? "thinking"
    : answering
      ? "listening"
      : "speaking";

  return (
    <div className="ra-run">
      {/* One segment per question, at the very top. A follow up never takes a
          segment: it belongs to the question that earned it. */}
      <div className="ra-progress" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span
            key={i}
            className={`ra-seg${i < 2 ? " is-done" : i === 2 ? " is-now" : ""}`}
          />
        ))}
      </div>

      <div className="ra-run-chrome">
        <span className="ra-pause" aria-hidden="true">
          <span />
          <span />
        </span>
        <RediOrb size={44} state={rediState} amplitude={amplitude} className="ra-run-mark" />
        <span className="ra-elapsed">{answering ? "6:12" : "5:48"}</span>
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
          <div className="ra-lifeline">Take your time.</div>
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
      ) : (
        <div className="ra-mic-area">
          <p className="ra-answer-timer ra-answer-timer-empty" />
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
          <p className="ra-turn-line ra-turn-line-inline">Redi is speaking</p>
          <div className="ra-run-bottom" />
        </div>
      )}

      <span className="sr-only">
        Practising {role.title}
        {role.organisation ? ` at ${role.organisation}` : ""}. Question three of eight.
      </span>
    </div>
  );
}

/* The words arrive as he reaches them, and the mouth opens on the syllables.
   Both come off one clock so the caption and the face cannot drift, which in
   the app is the bug this shape exists to prevent. */
function useSpokenWords(text: string, active: boolean) {
  const words = useMemo(() => text.split(" "), [text]);
  const [count, setCount] = useState(active ? 0 : words.length);
  const [amplitude, setAmplitude] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) {
      setCount(words.length);
      setAmplitude(0);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(words.length);
      return;
    }

    setCount(0);
    const start = performance.now();
    /* About three words a second, which is close to Redi's own pace. */
    const perWord = 340;

    const tick = (now: number) => {
      const t = now - start;
      const spoken = Math.min(words.length, Math.floor(t / perWord) + 1);
      setCount(spoken);

      if (spoken >= words.length && t > words.length * perWord + 500) {
        setAmplitude(0);
        return;
      }

      /* An envelope rather than a sine: syllables inside a word, and a dip at
         the gap between words. */
      const phase = (t % perWord) / perWord;
      const shape = Math.sin(phase * Math.PI) ** 0.7;
      const wobble = 0.72 + 0.28 * Math.sin(t / 47);
      setAmplitude(shape * wobble);

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, active, words.length]);

  return { revealed: words.slice(0, count), amplitude };
}

/* A stand in for the microphone's output level, which is what drives the
   waveform and Redi's glow in the app. */
function useVoiceLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) {
      setLevel(0);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLevel(0.4);
      return;
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

  return level;
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

      <p className="ra-evidence">8 answers, 9:41 of talking, across 6 skills.</p>
      <p className="ra-summary">
        The migration answer was the strongest thing here: a situation, a decision that was yours,
        and a number at the end of it. Nothing you told me went wrong, so there is very little for
        me to read on failure.
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
                <span className="ra-skill-dot" style={{ background: skill.hue }} />
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
              You wrote the rollback plan because nobody had, and you said so without dressing it
              up.
            </span>
          </span>
        </div>
      </div>

      <div className="ra-footer">
        <Primary label="Run this interview again" onClick={() => onGo("asking")} />
      </div>
    </div>
  );
}
