"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  RILO_AUTO_ADVANCE,
  RILO_CAPTIONS,
  RILO_EMAIL,
  RILO_FILLER_ROWS,
  RILO_GMAIL_STEPS,
  RILO_JUMP_STEP_1,
  RILO_JUMP_STEP_2,
  RILO_POSE,
  RILO_SCENARIO,
  RILO_STATUS,
  RILO_STEP_1_OPTIONS,
  RILO_STEP_2_OPTIONS,
  RILO_STEPS,
  type DemoOption,
  type Step,
} from "@/content/rilo-demo-script";

/* Rilo's own demo, rebuilt here bar for bar.

   riloai.app sends X-Frame-Options: SAMEORIGIN on the app, and framing
   the marketing page meant scaling a cross-origin document down until
   its body text stopped being readable. So the demo section is rebuilt
   instead: same flow, same copy, same type, same colours, same spacing,
   same mascot art, down to the browser chrome around it.

   It was reconstructed from the production bundle riloai.app serves,
   because the site ships no source maps and the Rilo repo is not on this
   machine. Rilo splits the work the same way this file does: the Gmail
   half is written in utilities, and Rilo's own panel in a stylesheet of
   its own. The panel's rules in globals.css are that stylesheet, copied
   across unchanged, class names and all.

   The flow is scripted, exactly as it is on riloai.app: no API key, no
   backend, nothing sent anywhere. It is a real walkthrough of the
   product, not a recording of one. */

/* Rilo draws its icons from lucide. These are those five, at lucide's own
   24px grid and stroke, so the shapes match rather than resemble. */
function LucideIcon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const Lock = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </LucideIcon>
);

const Paperclip = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
  </LucideIcon>
);

const Smile = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" x2="9.01" y1="9" y2="9" />
    <line x1="15" x2="15.01" y1="9" y2="9" />
  </LucideIcon>
);

const Sparkles = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </LucideIcon>
);

const X = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </LucideIcon>
);

const RotateCcw = ({ className }: { className?: string }) => (
  <LucideIcon className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </LucideIcon>
);

function Mascot({ step, size }: { step: Step; size: number }) {
  return (
    <Image
      src={RILO_POSE[step]}
      alt=""
      width={size}
      height={size}
      className="rl-mascot"
      draggable={false}
    />
  );
}

/* The browser Rilo draws around the demo: traffic lights, a Gmail tab,
   and the address bar. */
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rl-frame">
      <div className="rl-frame-top">
        <div className="rl-frame-lights">
          <span className="rl-light rl-light-r" />
          <span className="rl-light rl-light-y" />
          <span className="rl-light rl-light-g" />
        </div>
        <div className="rl-frame-tabs">
          <div className="rl-frame-tab">
            <span className="rl-gmail-mark" />
            Gmail
          </div>
        </div>
      </div>
      <div className="rl-frame-urlbar">
        <div className="rl-frame-url">
          <Lock className="rl-icon-3" />
          mail.google.com
        </div>
      </div>
      <div className="rl-frame-body">{children}</div>
    </div>
  );
}

function RiloPopover({ step }: { step: Step }) {
  return (
    <div className="rl-popover">
      <div className="rl-popover-row">
        <Mascot step={step} size={40} />
        <div className="rl-popover-body">
          <p className="rl-popover-title">Reading the thread...</p>
          <span className="rl-popover-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}

function GmailStage({
  step,
  onRiloButtonClick,
}: {
  step: Step;
  onRiloButtonClick: () => void;
}) {
  return (
    <div className="rl-gmail">
      <div className="rl-gmail-bar">
        <span className="rl-gmail-bar-label">Inbox</span>
        <span>1 of 248</span>
      </div>

      <div className="rl-gmail-view">
        {step === "inbox" ? (
          <div className="rl-list rl-fade" key="inbox">
            <div className="rl-row rl-row-lead">
              <span className="rl-bullet" />
              <div className="rl-row-body">
                <div className="rl-row-top">
                  <p className="rl-row-name">{RILO_EMAIL.senderName}</p>
                  <span className="rl-row-time">{RILO_EMAIL.time}</span>
                </div>
                <p className="rl-row-subject">{RILO_EMAIL.subject}</p>
                <p className="rl-row-preview">{RILO_EMAIL.preview}</p>
              </div>
            </div>
            {RILO_FILLER_ROWS.map((row) => (
              <div key={row.sender} className="rl-row rl-row-muted">
                <span className="rl-bullet rl-bullet-off" />
                <div className="rl-row-body">
                  <p className="rl-row-filler-name">{row.sender}</p>
                  <p className="rl-row-filler-subject">{row.subject}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rl-thread rl-fade" key="thread">
            <div className="rl-thread-head">
              <div className="rl-thread-head-row">
                <div className="rl-avatar">{RILO_EMAIL.senderInitial}</div>
                <div className="rl-row-body">
                  <div className="rl-row-top">
                    <p className="rl-row-name">{RILO_EMAIL.senderName}</p>
                    <span className="rl-row-time">{RILO_EMAIL.time}</span>
                  </div>
                  <p className="rl-thread-subject">{RILO_EMAIL.subject}</p>
                </div>
              </div>
              <p className="rl-thread-body">{RILO_EMAIL.body}</p>
            </div>

            <div className="rl-thread-foot">
              {step === "compose" || step === "rilo-open" ? (
                <div className="rl-compose">
                  {step === "rilo-open" ? <RiloPopover step={step} /> : null}
                  <div className="rl-compose-head">New Message</div>
                  <div className="rl-compose-body">
                    <span className="rl-compose-placeholder">
                      Type a reply...
                    </span>
                  </div>
                  <div className="rl-compose-foot">
                    <div className="rl-compose-left">
                      <button type="button" className="rl-send">
                        Send
                      </button>
                      <Paperclip className="rl-compose-icon" />
                      <Smile className="rl-compose-icon" />
                    </div>
                    <button
                      type="button"
                      onClick={onRiloButtonClick}
                      className={
                        "rl-ask" + (step === "compose" ? " is-pulsing" : "")
                      }
                    >
                      <Sparkles className="rl-icon-35" />
                      Rilo
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTED_PATH_EMPTY =
  "Start with one of Rilo's suggested actions, then narrow it step by step.";

function DashboardDemo({
  step,
  selectedPath,
  onSelectOption,
  onBack,
  onRestart,
  onGenerate,
  onClose,
  step2Options,
}: {
  step: Step;
  selectedPath: DemoOption[];
  onSelectOption: (option: DemoOption) => void;
  onBack: () => void;
  onRestart: () => void;
  onGenerate: () => void;
  onClose: () => void;
  step2Options: DemoOption[];
}) {
  const scanning = step === "scanning";
  const canGenerate = selectedPath.length >= 2;
  const options =
    step === "path-1"
      ? RILO_STEP_1_OPTIONS
      : step !== "path-2" || canGenerate
        ? null
        : step2Options;

  return (
    <div className="demo-shell">
      <header className="demo-header">
        <div className="demo-brand">
          <span className="demo-brand-mark">R</span>
          <h2>Build your reply</h2>
        </div>
        <div className="demo-identity">
          <span>Writing as</span>
          <span className="demo-identity-pill">{RILO_SCENARIO.writingAs}</span>
        </div>
        <span className="demo-status">{RILO_STATUS[step]}</span>
        <button
          type="button"
          className="demo-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="rl-icon-3" />
        </button>
      </header>

      <div className="demo-main">
        <aside className="demo-insights">
          <div className="demo-card">
            <span>Rilo scanned the thread</span>
            {scanning ? (
              <span
                className="demo-dots"
                style={{ marginTop: 6 }}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
              </span>
            ) : (
              <h3>{RILO_SCENARIO.scanSummary}</h3>
            )}
          </div>
          {!scanning ? (
            <div className="demo-card">
              <span>Key details</span>
              {RILO_SCENARIO.keyDetails.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          ) : null}
          <div className="demo-mascot-panel">
            <Mascot step={step} size={96} />
          </div>
        </aside>

        <section className="demo-canvas">
          <div className="demo-suggested-path">
            <div>
              <span>Selected path</span>
              {selectedPath.length ? (
                <ol className="demo-path-crumbs">
                  {selectedPath.map((option, i) => (
                    <li
                      key={option.id}
                      className={`demo-path-crumb demo-crumb-${i % 3}`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{SUGGESTED_PATH_EMPTY}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onRestart}
              disabled={!selectedPath.length}
            >
              Restart
            </button>
          </div>

          {options ? (
            <div className="demo-node-open">
              <div className="demo-node-heading">
                <span>Options</span>
                <div className="demo-flow-actions">
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={!selectedPath.length}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={onRestart}
                    disabled={!selectedPath.length}
                  >
                    Clear
                  </button>
                  <button type="button" disabled>
                    Generate more options
                  </button>
                </div>
              </div>
              <h3>
                {step === "path-1"
                  ? "Choose the response goal"
                  : "What should the reply say?"}
              </h3>
              <p>
                {step === "path-1"
                  ? "Start with what this specific email needs."
                  : "Pick the content direction before choosing the vibe."}
              </p>
              <div className="demo-option-web">
                {options.map((option) => {
                  const depth = step === "path-1" ? 1 : 2;
                  const selected =
                    selectedPath.length === depth &&
                    selectedPath[depth - 1]?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        "demo-option-card" + (selected ? " selected" : "")
                      }
                      onClick={() => onSelectOption(option)}
                    >
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : step === "path-2" && canGenerate ? (
            <div className="demo-node-open">
              <div className="demo-node-heading">
                <span>Ready</span>
              </div>
              <h3>Ready to draft</h3>
              <p>Generate now, or restart if you want a different path.</p>
            </div>
          ) : null}

          {step === "generating" ? (
            <div
              className="demo-node-open"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px 12px",
              }}
            >
              <span className="demo-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : null}

          <div className="demo-generate-node">
            <div>
              <span>Generate node</span>
              <strong>
                {canGenerate || step === "generating" || step === "draft-ready"
                  ? "Turn this path into a polished email."
                  : "Choose another option to unlock drafting."}
              </strong>
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || step === "generating"}
            >
              {step === "generating" ? "Rilo is drafting..." : "Generate draft"}
            </button>
          </div>

          {step === "draft-ready" ? (
            <div className="demo-preview">
              <div className="demo-preview-header">
                <span>Generated reply</span>
              </div>
              <div className="demo-preview-body">{RILO_SCENARIO.draft}</div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function RiloDemo() {
  const [step, setStep] = useState<Step>("inbox");
  const [path, setPath] = useState<DemoOption[]>([]);

  /* Three steps carry themselves forward. The rest wait to be clicked. */
  useEffect(() => {
    const hold = RILO_AUTO_ADVANCE[step];
    if (!hold) return;
    const timer = setTimeout(() => {
      setStep((current) =>
        current === "rilo-open"
          ? "scanning"
          : current === "scanning"
            ? "path-1"
            : current === "generating"
              ? "draft-ready"
              : current,
      );
    }, hold);
    return () => clearTimeout(timer);
  }, [step]);

  const restart = () => {
    setStep("inbox");
    setPath([]);
  };

  const advance = () => {
    if (step === "inbox") setStep("thread");
    else if (step === "thread") setStep("compose");
    else if (step === "compose") setStep("rilo-open");
    else if (step === "draft-ready") restart();
  };

  const caption = RILO_CAPTIONS[step];
  const auto = !!RILO_AUTO_ADVANCE[step];
  const choosing = step === "path-1" || (step === "path-2" && path.length < 2);
  const step2Options =
    RILO_STEP_2_OPTIONS[path[0]?.id ?? ""] ?? RILO_STEP_2_OPTIONS.send_regrets;

  return (
    <div className="rl-demo">
      <div className="rl-head">
        <span className="rl-eyebrow">Live demo</span>
        <h2 className="rl-heading">Try it yourself</h2>
        <p className="rl-sub">
          Click through the exact flow: open the email, ask Rilo, build the
          path, generate. No sign-up needed.
        </p>
      </div>

      <div className="rl-card">
        <BrowserFrame>
          <div className="rl-stage">
            {RILO_GMAIL_STEPS.has(step) ? (
              <GmailStage step={step} onRiloButtonClick={advance} />
            ) : (
              <DashboardDemo
                step={step}
                selectedPath={path}
                step2Options={step2Options}
                onSelectOption={(option) => {
                  if (step === "path-1") {
                    setPath([option]);
                    setStep("path-2");
                  } else if (step === "path-2" && path.length < 2) {
                    setPath((prev) => [...prev, option]);
                  }
                }}
                onBack={() => {
                  if (step !== "path-2" || !path.length) return;
                  const next = path.slice(0, -1);
                  setPath(next);
                  if (!next.length) setStep("path-1");
                }}
                onRestart={() => {
                  setPath([]);
                  setStep("path-1");
                }}
                onGenerate={() => {
                  if (path.length >= 2) setStep("generating");
                }}
                onClose={restart}
              />
            )}
          </div>
        </BrowserFrame>

        <div className="rl-below">
          <div className="rl-tabs" role="tablist" aria-label="Demo steps">
            {RILO_STEPS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === step}
                aria-label={`Jump to ${id} step`}
                onClick={() => {
                  setStep(id);
                  if (id === "path-2") setPath([RILO_JUMP_STEP_1]);
                  else if (id === "generating" || id === "draft-ready")
                    setPath([RILO_JUMP_STEP_1, RILO_JUMP_STEP_2]);
                  else setPath([]);
                }}
                className={"rl-tab" + (id === step ? " is-current" : "")}
              />
            ))}
          </div>

          <p className="rl-caption">{caption.text}</p>

          {!choosing && !auto && caption.actionLabel ? (
            <button
              type="button"
              onClick={advance}
              className={
                "rl-btn " +
                (step === "draft-ready" ? "rl-btn-secondary" : "rl-btn-primary")
              }
            >
              {step === "draft-ready" ? <RotateCcw className="rl-icon-4" /> : null}
              {caption.actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
