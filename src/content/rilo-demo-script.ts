/* The script behind Rilo's own demo, lifted from the shipped bundle on
   riloai.app rather than rewritten: the email, the filler inbox, both
   rounds of options, the scenario Rilo reports back, and the draft it
   writes. Every string here is the string the real demo shows.

   Reconstructed from the production chunk, since riloai.app ships no
   source maps and the Rilo repo is not checked out on this machine. */

export type DemoOption = { id: string; label: string; description: string };

export type Step =
  | "inbox"
  | "thread"
  | "compose"
  | "rilo-open"
  | "scanning"
  | "path-1"
  | "path-2"
  | "generating"
  | "draft-ready";

export const RILO_EMAIL = {
  senderName: "Priya Nair",
  senderInitial: "P",
  subject: "We're getting married in Lisbon, please say you'll come",
  preview:
    "It's official: Sam and I are doing a small wedding in Lisbon this September, and there's genuinely no version of that weekend I can picture without you there...",
  body: "It's official: Sam and I are doing a small wedding in Lisbon the third week of September, and there's genuinely no version of that weekend I can picture without you there. I know it's a big ask with the flights and taking the time off, so please don't feel you have to answer this second. Just tell me honestly whether there's any way we can make it work. Miss you loads, Priya",
  time: "8:12 AM",
};

export const RILO_FILLER_ROWS = [
  { sender: "Mum", subject: "Did you book the train home yet?" },
  { sender: "Goodreads", subject: "Your friends added 5 books this week" },
  { sender: "Strava", subject: "You're on a 3-week running streak" },
];

export const RILO_STEP_1_OPTIONS: DemoOption[] = [
  {
    id: "send_regrets",
    label: "Send my regrets",
    description: "Say I can't make it, warmly.",
  },
  {
    id: "say_yes",
    label: "Say yes, I'm in",
    description: "Accept and start planning.",
  },
  {
    id: "ask_details",
    label: "Ask about the details",
    description: "Get dates and costs before deciding.",
  },
  {
    id: "suggest_alt",
    label: "Suggest another way to celebrate",
    description: "Offer a plan B if I can't travel.",
  },
];

/* Round two branches on the goal picked in round one. */
export const RILO_STEP_2_OPTIONS: Record<string, DemoOption[]> = {
  send_regrets: [
    {
      id: "lead_congrats",
      label: "Lead with how happy I am",
      description: "Open on the good news.",
    },
    {
      id: "explain_why",
      label: "Explain why I can't come",
      description: "Give the honest reason.",
    },
    {
      id: "celebrate_later",
      label: "Offer to celebrate when they're back",
      description: "Propose a proper catch-up.",
    },
    {
      id: "send_gift",
      label: "Promise to send something",
      description: "A gift in lieu of being there.",
    },
  ],
  say_yes: [
    {
      id: "confirm_dates",
      label: "Confirm I'll be there",
      description: "Lock in the September dates.",
    },
    {
      id: "ask_logistics",
      label: "Ask what I should book",
      description: "Flights, hotel, anything they'd suggest.",
    },
    {
      id: "offer_help",
      label: "Offer to help with the planning",
      description: "Pitch in ahead of the day.",
    },
    {
      id: "share_excitement",
      label: "Gush about how excited I am",
      description: "Match her energy.",
    },
  ],
  ask_details: [
    {
      id: "ask_dates",
      label: "Pin down the exact dates",
      description: "So I can check the calendar.",
    },
    {
      id: "ask_cost",
      label: "Ask about travel and cost",
      description: "Understand the commitment first.",
    },
    {
      id: "ask_whos_going",
      label: "Ask who else is coming",
      description: "See who I'd know there.",
    },
    {
      id: "ask_timeline",
      label: "Ask when she needs an answer",
      description: "Buy a little time to decide.",
    },
  ],
  suggest_alt: [
    {
      id: "propose_visit",
      label: "Propose visiting another time",
      description: "See them when it's calmer.",
    },
    {
      id: "offer_video",
      label: "Offer to join by video",
      description: "Be there for the toast, at least.",
    },
    {
      id: "send_something",
      label: "Offer to send a gift instead",
      description: "Mark the day another way.",
    },
    {
      id: "host_local",
      label: "Offer to host a celebration here",
      description: "Throw something when they're home.",
    },
  ],
};

export const RILO_SCENARIO = {
  writingAs: "Jordan",
  scanSummary:
    "Priya invited you to her wedding in Lisbon this September and asked, honestly, whether you can be there.",
  keyDetails: [
    "Occasion: Priya & Sam's wedding, third week of September",
    "Where: Lisbon, flights and time off to weigh up",
    "She asked for an honest yes or no, no pressure",
  ],
  /* One draft, whatever path was walked, exactly as on riloai.app. */
  draft:
    "Priya! Congratulations, I actually got a little teary reading this. I'm so, so happy for you and Sam.\n\nI've turned September over every possible way, and I can't make Lisbon work this time. It lands right on top of something I can't move, and I'd rather tell you straight than leave you hoping.\n\nBut I'm not letting this slide by without a proper celebration. Let me take you both out the week you're back: first round's on me, and I want every single photo.\n\nAll my love,\nJordan",
};

export const RILO_STEPS: Step[] = [
  "inbox",
  "thread",
  "compose",
  "rilo-open",
  "scanning",
  "path-1",
  "path-2",
  "generating",
  "draft-ready",
];

/* The four steps drawn as Gmail. The rest are drawn as Rilo's panel. */
export const RILO_GMAIL_STEPS = new Set<Step>([
  "inbox",
  "thread",
  "compose",
  "rilo-open",
]);

/* The three steps that move on by themselves, and how long they hold. */
export const RILO_AUTO_ADVANCE: Partial<Record<Step, number>> = {
  "rilo-open": 700,
  scanning: 1200,
  generating: 1100,
};

export const RILO_CAPTIONS: Record<
  Step,
  { text: string; actionLabel?: string }
> = {
  inbox: {
    text: "A note from an old friend just landed.",
    actionLabel: "Open it",
  },
  thread: {
    text: "Priya asked a real question, and she wants an honest answer.",
    actionLabel: "Reply",
  },
  compose: {
    text: "The reply box is open. Rilo's right there beside Send.",
    actionLabel: "Ask Rilo",
  },
  "rilo-open": { text: "Rilo is opening..." },
  scanning: { text: "Rilo is reading Priya's note..." },
  "path-1": { text: "Pick where to take this reply." },
  "path-2": { text: "Now shape what it actually says, then generate." },
  generating: { text: "Writing a reply in your voice..." },
  "draft-ready": {
    text: "Draft's ready: read it back, then replay.",
    actionLabel: "Replay",
  },
};

export const RILO_STATUS: Partial<Record<Step, string>> = {
  scanning: "Scanning",
  "path-1": "Options",
  "path-2": "Options",
  generating: "Drafting",
  "draft-ready": "Generated",
};

/* Rilo's mascot changes pose as the panel works. The four poses the demo
   uses, downscaled to 256px from the transparent PNGs riloai.app serves. */
export const RILO_POSE: Record<Step, string> = {
  inbox: "/images/rilo-02.webp",
  thread: "/images/rilo-02.webp",
  compose: "/images/rilo-02.webp",
  "rilo-open": "/images/rilo-02.webp",
  scanning: "/images/rilo-01.webp",
  "path-1": "/images/rilo-05.webp",
  "path-2": "/images/rilo-05.webp",
  generating: "/images/rilo-02.webp",
  "draft-ready": "/images/rilo-07.webp",
};

/* Jumping straight to a later dot has to arrive with a path already
   walked, so the panel is never in a state the flow could not reach.
   These are the two the demo fills in: the first goal, and the third
   option under it. */
export const RILO_JUMP_STEP_1 = RILO_STEP_1_OPTIONS[0];
export const RILO_JUMP_STEP_2 = RILO_STEP_2_OPTIONS.send_regrets[2];
