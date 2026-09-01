"use client";

import { useMemo, useState } from "react";

/* An interactive mockup of the Redi AI flow.

   Redi is a React Native app in development with nothing public to
   record, so this is a mockup rather than a capture, and it says so on
   the page. Everything here is deterministic: the questions come from
   templates keyed to the kind of role typed in, and the scores are
   fixed illustrative values. Nothing calls a model and nothing claims
   to be real output. */

type Kind = "job" | "scholarship" | "program";

const PRESETS = [
  "Software Engineering Intern",
  "President's Scholarship of Distinction",
  "Computer Science, Waterloo",
];

function kindOf(role: string): Kind {
  const r = role.toLowerCase();
  if (/scholar|award|bursar|grant/.test(r)) return "scholarship";
  if (/program|degree|university|college|school|admission/.test(r)) return "program";
  return "job";
}

const TEMPLATES: Record<Kind, (role: string) => string[]> = {
  job: (role) => [
    `Walk me through a project you would bring up in a ${role} interview.`,
    "Tell me about a time you shipped something before it felt finished. What broke?",
    "Describe a bug you could not reproduce. How did you get to the bottom of it?",
    "Where have you had to pick up a part of the stack you did not know?",
    "What would you want to be doing here in a year, and why this team?",
  ],
  scholarship: (role) => [
    `Why are you a strong candidate for the ${role}?`,
    "Describe something you started from nothing. What did it become?",
    "Tell me about a commitment you kept when it stopped being convenient.",
    "What have you done that you would still do with nobody watching?",
    "How would this change what you are able to take on next year?",
  ],
  program: (role) => [
    `Why ${role} specifically, over the alternatives you considered?`,
    "What have you built or organised outside of coursework?",
    "Describe a time you worked with people whose strengths were unlike yours.",
    "What part of this field do you expect to find hardest?",
    "Where do you want this to lead after graduation?",
  ],
};

/* Fixed illustrative values, not a real assessment. */
const RUBRIC = [
  { name: "Structure", score: 82, note: "Opens with the situation, ends with the result." },
  { name: "Specifics", score: 64, note: "Two claims land without a number behind them." },
  { name: "Delivery", score: 71, note: "Pace is steady. Four filler words in ninety seconds." },
];

export function RediDemo() {
  const [role, setRole] = useState(PRESETS[0]);
  const [draft, setDraft] = useState(PRESETS[0]);
  const [open, setOpen] = useState<number | null>(null);

  const questions = useMemo(() => TEMPLATES[kindOf(role)](role), [role]);

  const apply = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setRole(next);
    setDraft(next);
    setOpen(null);
  };

  return (
    <div className="redi">
      <div className="redi-bar">
        <span className="redi-mark">Redi AI</span>
        <span className="redi-tag">Mockup of the flow</span>
      </div>

      <form
        className="redi-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          apply(draft);
        }}
      >
        <label className="sr-only" htmlFor="redi-role">
          Describe a role
        </label>
        <input
          id="redi-role"
          className="redi-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Describe a role, a scholarship, or a program"
          autoComplete="off"
        />
        <button type="submit" className="redi-go">
          Generate
        </button>
      </form>

      <div className="redi-chips">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`redi-chip${preset === role ? " is-on" : ""}`}
            onClick={() => apply(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="redi-meta">
        {questions.length} questions for <strong>{role}</strong>. Change the role
        and the set regenerates.
      </p>

      <ol className="redi-questions">
        {questions.map((question, i) => (
          <li key={question}>
            <button
              type="button"
              className={`redi-question${open === i ? " is-open" : ""}`}
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="redi-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="redi-text">{question}</span>
            </button>

            {open === i ? (
              <div className="redi-score">
                <p className="redi-score-head">
                  How an answer gets scored
                  <span className="redi-illustrative">illustrative</span>
                </p>
                {RUBRIC.map((row) => (
                  <div key={row.name} className="redi-row">
                    <span className="redi-row-name">{row.name}</span>
                    <span className="redi-bar">
                      <span className="redi-fill" style={{ width: `${row.score}%` }} />
                    </span>
                    <span className="redi-row-note">{row.note}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
