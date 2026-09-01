"use client";

import { useEffect, useState } from "react";

import {
  RILO_DRAFTS,
  RILO_EMAIL,
  RILO_FILLER_ROWS,
  RILO_SCENARIO,
  RILO_STEP_1_OPTIONS,
  RILO_STEP_2_OPTIONS,
  type DemoOption,
} from "@/content/rilo-demo-script";

/* Rilo's own interactive demo, running here.

   riloai.app sends X-Frame-Options: SAMEORIGIN, so the live page cannot
   be embedded. This is the same flow ported out of the Rilo repo
   (website/components/demo/InteractiveDemo.tsx and its GmailStage and
   DashboardDemo children), rebuilt without Rilo's design system so it
   carries no dependencies.

   The flow is scripted, exactly as it is on riloai.app: no API key, no
   backend, nothing sent anywhere. It is a real walkthrough of the
   product, not a recording of one. */

type Step =
  | "inbox"
  | "thread"
  | "compose"
  | "rilo-open"
  | "scanning"
  | "path-1"
  | "path-2"
  | "generating"
  | "draft-ready";

const AUTO_ADVANCE: Partial<Record<Step, { to: Step; after: number }>> = {
  "rilo-open": { to: "scanning", after: 900 },
  scanning: { to: "path-1", after: 1400 },
  generating: { to: "draft-ready", after: 1300 },
};

const CAPTIONS: Record<Step, { text: string; action?: string }> = {
  inbox: { text: "A note from an old friend just landed.", action: "Open it" },
  thread: { text: "Priya asked a real question, and she wants an honest answer.", action: "Reply" },
  compose: { text: "The reply box is open. Rilo sits right beside Send.", action: "Ask Rilo" },
  "rilo-open": { text: "Rilo is opening" },
  scanning: { text: "Rilo is reading Priya's note" },
  "path-1": { text: "Pick where to take this reply." },
  "path-2": { text: "Now shape what it actually says, then generate." },
  generating: { text: "Writing a reply in your voice" },
  "draft-ready": { text: "Draft is ready. Read it back, then replay.", action: "Replay" },
};

const STATUS: Partial<Record<Step, string>> = {
  scanning: "Scanning",
  "path-1": "Options",
  "path-2": "Options",
  generating: "Drafting",
  "draft-ready": "Generated",
};

const GMAIL_STEPS: Step[] = ["inbox", "thread", "compose", "rilo-open"];

function Dots() {
  return (
    <span className="rd-dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function RiloDemo() {
  const [step, setStep] = useState<Step>("inbox");
  const [path, setPath] = useState<DemoOption[]>([]);

  useEffect(() => {
    const next = AUTO_ADVANCE[step];
    if (!next) return;
    const timer = setTimeout(() => setStep(next.to), next.after);
    return () => clearTimeout(timer);
  }, [step]);

  const replay = () => {
    setStep("inbox");
    setPath([]);
  };

  const primary = () => {
    if (step === "inbox") setStep("thread");
    else if (step === "thread") setStep("compose");
    else if (step === "compose") setStep("rilo-open");
    else if (step === "draft-ready") replay();
  };

  const choose = (option: DemoOption) => {
    if (step === "path-1") {
      setPath([option]);
      setStep("path-2");
    } else if (step === "path-2" && path.length < 2) {
      setPath((prev) => [...prev, option]);
    }
  };

  const back = () => {
    if (step !== "path-2" || !path.length) return;
    const next = path.slice(0, -1);
    setPath(next);
    if (!next.length) setStep("path-1");
  };

  const canGenerate = path.length >= 2;
  const goal = path[0]?.id ?? "send_regrets";
  const stepTwo = RILO_STEP_2_OPTIONS[goal] ?? RILO_STEP_2_OPTIONS.send_regrets;
  const options = step === "path-1" ? RILO_STEP_1_OPTIONS : step === "path-2" && !canGenerate ? stepTwo : null;
  const caption = CAPTIONS[step];
  const inGmail = GMAIL_STEPS.includes(step);

  return (
    <div className="rd">
      {/* Browser chrome, so the Gmail half reads as a real inbox. */}
      <div className="rd-chrome">
        <span className="rd-dot rd-dot-r" />
        <span className="rd-dot rd-dot-y" />
        <span className="rd-dot rd-dot-g" />
        <span className="rd-url">mail.google.com</span>
      </div>

      <div className="rd-stage">
        {inGmail ? (
          <div className="rd-gmail">
            <div className="rd-gmail-bar">
              <strong>Inbox</strong>
              <span>1 of 248</span>
            </div>

            {step === "inbox" ? (
              <div className="rd-list">
                <button type="button" className="rd-row rd-row-unread" onClick={primary}>
                  <span className="rd-unread" />
                  <span className="rd-row-body">
                    <span className="rd-row-top">
                      <strong>{RILO_EMAIL.senderName}</strong>
                      <span className="rd-time">{RILO_EMAIL.time}</span>
                    </span>
                    <span className="rd-subject">{RILO_EMAIL.subject}</span>
                    <span className="rd-preview">{RILO_EMAIL.preview}</span>
                  </span>
                </button>
                {RILO_FILLER_ROWS.map((row) => (
                  <div key={row.sender} className="rd-row rd-row-muted">
                    <span className="rd-unread rd-unread-off" />
                    <span className="rd-row-body">
                      <span className="rd-sender-muted">{row.sender}</span>
                      <span className="rd-preview">{row.subject}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rd-thread">
                <div className="rd-thread-head">
                  <span className="rd-avatar">{RILO_EMAIL.senderInitial}</span>
                  <span className="rd-row-body">
                    <span className="rd-row-top">
                      <strong>{RILO_EMAIL.senderName}</strong>
                      <span className="rd-time">{RILO_EMAIL.time}</span>
                    </span>
                    <span className="rd-subject">{RILO_EMAIL.subject}</span>
                  </span>
                </div>
                <p className="rd-body">{RILO_EMAIL.body}</p>

                {step === "thread" ? (
                  <div className="rd-thread-actions">
                    <button type="button" className="rd-reply" onClick={primary}>
                      Reply
                    </button>
                  </div>
                ) : (
                  <div className="rd-compose">
                    {step === "rilo-open" ? (
                      <div className="rd-opening">
                        <span className="rd-mascot" aria-hidden="true">
                          R
                        </span>
                        <span>
                          <strong>Reading the thread</strong>
                          <Dots />
                        </span>
                      </div>
                    ) : null}
                    <div className="rd-compose-head">New Message</div>
                    <div className="rd-compose-body">Type a reply...</div>
                    <div className="rd-compose-foot">
                      <span className="rd-send">Send</span>
                      <button
                        type="button"
                        className={`rd-rilo${step === "compose" ? " is-nudging" : ""}`}
                        onClick={primary}
                      >
                        Rilo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rd-dash">
            <header className="rd-dash-head">
              <span className="rd-brand">
                <span className="rd-brand-mark">R</span>
                Build your reply
              </span>
              <span className="rd-writing">
                Writing as <span className="rd-pill">{RILO_SCENARIO.writingAs}</span>
              </span>
              <span className="rd-status">{STATUS[step]}</span>
            </header>

            <div className="rd-dash-main">
              <aside className="rd-insights">
                <div className="rd-card">
                  <span className="rd-card-label">Rilo scanned the thread</span>
                  {step === "scanning" ? <Dots /> : <p>{RILO_SCENARIO.scanSummary}</p>}
                </div>
                {step !== "scanning" ? (
                  <div className="rd-card">
                    <span className="rd-card-label">Key details</span>
                    {RILO_SCENARIO.keyDetails.map((detail) => (
                      <p key={detail} className="rd-detail">
                        {detail}
                      </p>
                    ))}
                  </div>
                ) : null}
              </aside>

              <section className="rd-canvas">
                <div className="rd-path">
                  <span className="rd-card-label">Selected path</span>
                  {path.length ? (
                    <ol className="rd-crumbs">
                      {path.map((option) => (
                        <li key={option.id}>{option.label}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="rd-detail">
                      Start with one of Rilo&apos;s suggested actions, then narrow it step by step.
                    </p>
                  )}
                </div>

                {options ? (
                  <div className="rd-node">
                    <div className="rd-node-head">
                      <h3>{step === "path-1" ? "Choose the response goal" : "What should the reply say?"}</h3>
                      <button type="button" className="rd-mini" onClick={back} disabled={!path.length}>
                        Back
                      </button>
                    </div>
                    <p className="rd-detail">
                      {step === "path-1"
                        ? "Start with what this specific email needs."
                        : "Pick the content direction before choosing the vibe."}
                    </p>
                    <div className="rd-options">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="rd-option"
                          onClick={() => choose(option)}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {step === "generating" ? (
                  <div className="rd-node rd-node-center">
                    <Dots />
                  </div>
                ) : null}

                <div className="rd-generate">
                  <span>
                    {canGenerate || step === "generating" || step === "draft-ready"
                      ? "Turn this path into a polished email."
                      : "Choose another option to unlock drafting."}
                  </span>
                  <button
                    type="button"
                    className="rd-go"
                    onClick={() => canGenerate && setStep("generating")}
                    disabled={!canGenerate || step === "generating" || step === "draft-ready"}
                  >
                    {step === "generating" ? "Rilo is drafting..." : "Generate draft"}
                  </button>
                </div>

                {step === "draft-ready" ? (
                  <div className="rd-preview">
                    <span className="rd-card-label">Generated reply</span>
                    <p className="rd-draft">{RILO_DRAFTS[goal] ?? RILO_DRAFTS.send_regrets}</p>
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        )}
      </div>

      <div className="rd-caption">
        <span>{caption.text}</span>
        {caption.action ? (
          <button type="button" className="rd-action" onClick={primary}>
            {caption.action}
          </button>
        ) : (
          <button type="button" className="rd-action rd-action-quiet" onClick={replay}>
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
