/**
 * Audits the rendered site copy against the project's language rules.
 *
 * Run the production server first, then:
 *   node scripts/copy-audit.mjs
 *
 * Checks the RENDERED text of every route, plus meta descriptions,
 * titles and alt text, because those are user-facing copy too.
 */

import { spawn } from "node:child_process";

/* Server-rendered routes can be read straight off the wire. */
const FETCH_ROUTES = ["/", "/bio", "/awards", "/no-such-page"];

/* /projects renders its panels on the client, so these need a browser. One
   per project, because only the open panel is in the DOM. */
const DOM_ROUTES = [
  "/projects?p=Rilo",
  "/projects?p=Redi%20AI",
  "/projects?p=Phantom",
  "/projects?p=Loxbox",
];

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const CDP_PORT = 9533;

const BANNED_WORDS = [
  "delve", "leverage", "transformative", "game-changing", "seamless", "robust",
  "synergy", "best practices", "thought leader", "landscape", "paradigm",
  "harness", "unlock", "empower", "streamline", "holistic", "tapestry",
  "multifaceted", "nuanced", "foster", "cultivate", "facilitate", "utilize",
  "comprehensive", "albeit", "whilst", "superpower", "journey", "realm",
  "elevate", "essentially", "certainly", "typically", "various", "overall",
  "insights", "actionable", "cutting-edge", "innovative", "next-gen",
  "best-in-class", "scalable", "disruptive", "dynamic", "agile", "passionate",
  "driven", "world-class", "crucial", "essential", "incredibly", "significantly",
];

const BANNED_PHRASES = [
  "passionate about", "it's worth noting", "in today's", "when it comes to",
  "at the end of the day", "the truth is", "here's a breakdown",
  "a testament to", "below is", "not only", "it's important to note",
  "furthermore", "moreover", "in conclusion", "additionally",
  "i'll be honest", "to be real",
];

const BANNED_STRUCTURES = [
  [/\bit'?s not\b[^.]*?,\s*it'?s\b/i, "contrast negation (it's not X, it's Y)"],
  [/\b(don'?t|doesn'?t|didn'?t)\s+just\b/i, "contrast negation (don't just X)"],
  [/\bisn'?t\s+just\b/i, "contrast negation (isn't just X)"],
  [/\bwhy\?\s+because\b/i, "self-posed question transition"],
  [/\bnot only\b[^.]*\bbut also\b/i, "not only / but also"],
];

/* Words that mark a sentence as carrying something concrete. */
const CONCRETE = /\d|Shaan|Rilo|Redi|Phantom|Loxbox|Waterloo|Lazaridis|Laurier|Toronto|Gmail|Chrome|Stripe|Base44|Firebase|Gemini|Target Alpha|Strello|Sumo Dino|Northern|DECA|OFSAA|Google|NVIDIA|Azure|GitHub|Expo|Next\.js|React|Ignition|Canadian|Credly|Maestro|Linux|Netlify|Vercel|Python|Java|SQL|CPR|National Lifeguard|Royal Life|2Learn|Peer Tutor|Model United Nations|Junior Achievement|North Toronto/i;

function textFrom(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const metas = [];
  for (const m of html.matchAll(/<meta[^>]+name="description"[^>]*content="([^"]*)"/gi)) metas.push(m[1]);
  for (const m of html.matchAll(/<meta[^>]+property="og:[^"]*"[^>]*content="([^"]*)"/gi)) metas.push(m[1]);
  for (const m of html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)) metas.push(m[1]);
  for (const m of body.matchAll(/\salt="([^"]*)"/gi)) if (m[1].trim()) metas.push(m[1]);

  const visible = body
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&copy;/g, "(c)")
    .replace(/\s+/g, " ")
    .trim();

  return `${visible} ${metas.join(" ")}`;
}

const findings = {
  words: new Map(), phrases: new Map(), structures: new Map(),
  emDash: 0, enDash: 0, exclamation: 0,
  vague: [], repeatedOpeners: [],
};

/* Both of these have to be built with ordinary strings rather than a
   template literal. Inside a template literal `\b` is the backspace
   character, not a word boundary, so the word check silently matched
   nothing at all and reported every page clean. The replacement string
   needs its own backslash for the same reason: "$&" puts the character
   back unescaped, so a banned entry containing a regex metacharacter
   would build the wrong pattern. */
const META = /[-/\\^$*+?.()|[\]{}]/g;
const escapeRe = (s) => s.replace(META, "\\$&");
const wordRe = (w) => new RegExp("\\b" + escapeRe(w) + "\\b", "gi");

/* A check that cannot fail is worse than no check, so prove both halves
   still bite before trusting a clean run. */
if (!"a seamless thing".match(wordRe("seamless")) || "c++".replace(META, "\\$&") !== "c\\+\\+") {
  console.error("copy-audit: the word check is broken, so its result means nothing.");
  process.exit(2);
}

function audit(route, copy) {
  for (const w of BANNED_WORDS) {
    const hits = copy.match(wordRe(w));
    if (hits) findings.words.set(w, (findings.words.get(w) ?? 0) + hits.length);
  }

  for (const p of BANNED_PHRASES) {
    const re = new RegExp(escapeRe(p), "gi");
    const hits = copy.match(re);
    if (hits) findings.phrases.set(p, (findings.phrases.get(p) ?? 0) + hits.length);
  }

  for (const [re, label] of BANNED_STRUCTURES) {
    if (re.test(copy)) findings.structures.set(label, route);
  }

  findings.emDash += (copy.match(/—/g) ?? []).length;
  findings.enDash += (copy.match(/–/g) ?? []).length;
  findings.exclamation += (copy.match(/!/g) ?? []).length;

  const sentences = copy.split(/(?<=[.?])\s+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5);
  for (const s of sentences) if (!CONCRETE.test(s)) findings.vague.push(`${route}: ${s}`);

  for (let i = 1; i < sentences.length; i++) {
    const a = sentences[i - 1].split(/\s+/)[0]?.toLowerCase().replace(/[^a-z']/g, "");
    const b = sentences[i].split(/\s+/)[0]?.toLowerCase().replace(/[^a-z']/g, "");
    if (a && a === b) findings.repeatedOpeners.push(`${route}: "${a}" opens two sentences in a row`);
  }
}

for (const route of FETCH_ROUTES) {
  const res = await fetch(BASE + route);
  audit(route, textFrom(await res.text()));
}

/* /projects draws its panels on the client, so the served HTML carries a few
   hundred characters and none of the copy. Every demo caption, every guide
   step and the whole Redi walkthrough live behind that, which is most of the
   prose written this year. Reading it needs a browser. */
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${CDP_PORT}`, "--headless", "--disable-gpu",
  "--no-first-run", "--hide-scrollbars",
  "--user-data-dir=C:/Users/shaan/AppData/Local/Temp/claude-cdp-audit", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json()).webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(300);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (m, p = {}, s) =>
  new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });

const { result: target } = await send("Target.createTarget", { url: "about:blank" });
const { result: att } = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
const sess = att.sessionId;
await send("Page.enable", {}, sess);
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, sess);
const ev = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sess)).result?.result?.value;

const visible = () => `document.body.innerText.replace(/\\s+/g," ").trim()`;

for (const route of DOM_ROUTES) {
  let copy = "";
  let title = "";

  /* A first request to a cold server can outrun the 3.2s wait, and a guard
     that fails on a slow start is only marginally better than one that
     cannot fail at all. Give the panel a few chances to appear before
     calling it broken. */
  for (let attempt = 0; attempt < 4 && !title; attempt++) {
    await send("Page.navigate", { url: BASE + route }, sess);
    await sleep(3200 + attempt * 2000);

    copy = await ev(visible());

    /* The walkthrough shows one caption at a time, so the rail has to be
       walked before its copy has all been on screen. Accumulate rather than
       snapshot. */
    const stops = (await ev(`document.querySelectorAll('.rw-stop').length`)) ?? 0;
    for (let i = 0; i < stops; i++) {
      await ev(`document.querySelectorAll('.rw-stop')[${i}]?.click()`);
      await sleep(700);
      copy += " " + (await ev(visible()));
    }

    /* A pass that reads nothing reports clean, which is the failure mode this
       whole browser pass exists to fix. So prove the panel actually rendered
       rather than trusting a character count: its title and its prose both
       have to be in what was read. */
    const t = await ev(`document.querySelector('.browser-title')?.textContent ?? ""`);
    const prose = await ev(`document.querySelector('.browser-prose')?.textContent ?? ""`);
    if (t && prose && copy.includes(t) && copy.includes(prose.slice(0, 40))) title = t;
  }

  if (!title) {
    console.error(
      `copy-audit: ${route} did not render its panel, so its copy was never audited.`,
    );
    ws.close();
    chrome.kill();
    process.exit(2);
  }

  audit(route, copy);
  console.log(`  audited ${copy.length} characters of ${title}`);
}

ws.close();
chrome.kill();

const list = (m) => (m.size ? [...m.entries()].map(([k, v]) => `${k} (${v})`).join(", ") : "none");

console.log("COPY AUDIT");
console.log(`- Banned words found: ${list(findings.words)}`);
console.log(`- Banned phrasings found: ${list(findings.phrases)}`);
console.log(`- Banned structures found: ${findings.structures.size ? [...findings.structures].map(([k, v]) => `${k} @ ${v}`).join("; ") : "none"}`);
console.log(`- Em dashes / en dashes in copy: ${findings.emDash + findings.enDash} (em ${findings.emDash}, en ${findings.enDash}) [must be 0]`);
console.log(`- Exclamation points: ${findings.exclamation} [must be 0]`);
console.log(`- Sentences with no concrete noun, number, or name: ${findings.vague.length ? "" : "none"}`);
for (const v of findings.vague) console.log(`    ${v}`);
console.log(`- Back-to-back sentences with the same opener: ${findings.repeatedOpeners.length ? "" : "none"}`);
for (const r of findings.repeatedOpeners) console.log(`    ${r}`);

const hardFail =
  findings.words.size || findings.phrases.size || findings.structures.size ||
  findings.emDash || findings.enDash || findings.exclamation;
process.exit(hardFail ? 1 : 0);
