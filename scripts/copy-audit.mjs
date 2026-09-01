/**
 * Audits the rendered site copy against the project's language rules.
 *
 * Run the production server first, then:
 *   node scripts/copy-audit.mjs
 *
 * Checks the RENDERED text of every route, plus meta descriptions,
 * titles and alt text, because those are user-facing copy too.
 */

const ROUTES = ["/", "/bio", "/projects", "/awards", "/no-such-page"];
const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";

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

for (const route of ROUTES) {
  const res = await fetch(BASE + route);
  const copy = textFrom(await res.text());

  for (const w of BANNED_WORDS) {
    const re = new RegExp(`\b${w.replace(/[-/\^$*+?.()|[\]{}]/g, "\$&")}\b`, "gi");
    const hits = copy.match(re);
    if (hits) findings.words.set(w, (findings.words.get(w) ?? 0) + hits.length);
  }

  for (const p of BANNED_PHRASES) {
    const re = new RegExp(p.replace(/[-/\^$*+?.()|[\]{}]/g, "\$&"), "gi");
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
