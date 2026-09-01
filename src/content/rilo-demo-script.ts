/* Content for the Rilo demo, ported from the Rilo repo
   (website/lib/interactive-demo/script.ts).

   It is the same scenario the live site runs, so the demo here shows
   the real product flow rather than an approximation of it. Nothing
   calls a model: the flow is scripted on the real extension's own
   option sets, which is exactly how riloai.app runs it too.

   If the scenario on riloai.app changes, re-copy this file. */

export type DemoOption = {
  id: string;
  label: string;
  description: string;
};

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
  { id: "send_regrets", label: "Send my regrets", description: "Say I can't make it, warmly." },
  { id: "say_yes", label: "Say yes, I'm in", description: "Accept and start planning." },
  { id: "ask_details", label: "Ask about the details", description: "Get dates and costs before deciding." },
  { id: "suggest_alt", label: "Suggest another way to celebrate", description: "Offer a plan B if I can't travel." },
];

/* Step two forks on the step-one choice, so every goal leads somewhere
   coherent rather than into one flat list. */
export const RILO_STEP_2_OPTIONS: Record<string, DemoOption[]> = {
  send_regrets: [
    { id: "lead_congrats", label: "Lead with how happy I am", description: "Open on the good news." },
    { id: "explain_why", label: "Explain why I can't come", description: "Give the honest reason." },
    { id: "celebrate_later", label: "Offer to celebrate when they're back", description: "Propose a proper catch-up." },
    { id: "send_gift", label: "Promise to send something", description: "A gift in lieu of being there." },
  ],
  say_yes: [
    { id: "confirm_dates", label: "Confirm I'll be there", description: "Lock in the September dates." },
    { id: "ask_logistics", label: "Ask what I should book", description: "Flights, hotel, anything they'd suggest." },
    { id: "offer_help", label: "Offer to help with the planning", description: "Pitch in ahead of the day." },
    { id: "share_excitement", label: "Gush about how excited I am", description: "Match her energy." },
  ],
  ask_details: [
    { id: "ask_dates", label: "Pin down the exact dates", description: "So I can check the calendar." },
    { id: "ask_cost", label: "Ask about travel and cost", description: "Understand the commitment first." },
    { id: "ask_whos_going", label: "Ask who else is coming", description: "See who I'd know there." },
    { id: "ask_timeline", label: "Ask when she needs an answer", description: "Buy a little time to decide." },
  ],
  suggest_alt: [
    { id: "propose_visit", label: "Propose visiting another time", description: "See them when it's calmer." },
    { id: "offer_video", label: "Offer to join by video", description: "Be there for the toast, at least." },
    { id: "send_something", label: "Offer to send a gift instead", description: "Mark the day another way." },
    { id: "host_local", label: "Offer to host a celebration here", description: "Throw something when they're home." },
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
};

/* One draft per step-one goal, so the reply that comes back actually
   matches the path taken rather than always landing on a decline. */
export const RILO_DRAFTS: Record<string, string> = {
  send_regrets:
    "Priya! Congratulations, I actually got a little teary reading this. I'm so, so happy for you and Sam.\n\nI've turned September over every possible way, and I can't make Lisbon work this time. It lands right on top of something I can't move, and I'd rather tell you straight than leave you hoping.\n\nBut I'm not letting this slide by without a proper celebration. Let me take you both out the week you're back: first round's on me, and I want every single photo.\n\nAll my love,\nJordan",
  say_yes:
    "Priya! Yes. Absolutely yes. I read this twice and grinned at my screen both times.\n\nCount me in for the third week of September. Send me the dates the moment you have them and I'll get the flights booked before I talk myself into overthinking it.\n\nTell me what you need me to bring, wear, or carry across Europe. I'm so happy for you both.\n\nAll my love,\nJordan",
  ask_details:
    "Priya! Congratulations, this is the best news I've had all month. I'm so happy for you and Sam.\n\nI want to say yes properly rather than half-commit, so can I ask a couple of things first? Which dates exactly in that third week, and roughly what should I budget for flights and somewhere to stay?\n\nAnd when do you need to know by? I'll work around it if I possibly can.\n\nAll my love,\nJordan",
  suggest_alt:
    "Priya! Congratulations, I'm so happy for you and Sam. This is lovely news.\n\nI'm going to be honest with you: Lisbon in September is a stretch I'm not sure I can make. Before I say no outright, though, can we find another way to mark it?\n\nI'd love to have you both over for a proper dinner the week you're back, or join by video for the toast if that's something you'd want. Tell me which and I'll make it happen.\n\nAll my love,\nJordan",
};
