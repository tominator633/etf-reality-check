import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { datasetSchema } from "../data/schema.ts";
import { formatDate, formatTer } from "../src/shared/lib/format.ts";

// Kreativa reklamy A (brief kap. 9): Meta feed 4 : 5, 1080 × 1350. Vzhled jako landing page
// (tokens.css, Outfit + Plus Jakarta Sans, hero „NENÍ etf / jako ETF“, vlajky, karty, navy karta
// s otázkou, žluté CTA). Tickery, index a TER se čtou z data/etf.json – nic se nepíše ručně.
// `npm run build:ads` → ads/reklama-a.html (zdroj) a ads/reklama-a.png (pro Meta, přes headless Chrome).

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

const AD_FUND_IDS = ["voo", "ivv", "spym", "spy"]; // pořadí jako na stránce (tech-spec 4)
const SIZE = { width: 1080, height: 1350 };
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const dataset = datasetSchema.parse(JSON.parse(read("data/etf.json")));
const funds = AD_FUND_IDS.map((id) => {
  const fund = dataset.funds.find((candidate) => candidate.id === id);
  if (!fund?.ter.value || !fund.index.value) throw new Error(`Reklama A: fond ${id} nemá ověřené TER nebo index`);
  return { ticker: fund.listing.ticker.value ?? id.toUpperCase(), index: fund.index.value, ter: formatTer(fund.ter.value) };
});
const indexName = funds[0].index.replace(" ", " ");
if (funds.some((fund) => fund.index !== funds[0].index)) throw new Error("Reklama A: fondy nesledují stejný index");

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Vlajky jako v hero (features/etf-reality-check/components/flag-twins), bez animace. */
function flagTwins(): string {
  const US = { x: 6, y: 8, width: 72, height: 48 };
  const EU = { x: 40, y: 50, width: 74, height: 50 };
  const stripes = 7;
  const stripe = US.height / stripes;
  const canton = { width: US.width * 0.42, height: stripe * 4 };
  const eu = { x: EU.x + EU.width / 2, y: EU.y + EU.height / 2 };
  const star = (cx: number, cy: number, outer: number, inner = outer * 0.42) =>
    `M${Array.from({ length: 10 }, (_, index) => {
      const radius = index % 2 === 0 ? outer : inner;
      const angle = (Math.PI / 5) * index - Math.PI / 2;
      return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
    }).join("L")}Z`;

  const usStripes = Array.from(
    { length: Math.ceil(stripes / 2) },
    (_, index) => `<rect class="us-red" x="${US.x}" y="${US.y + index * 2 * stripe}" width="${US.width}" height="${stripe}"/>`,
  ).join("");
  const usStars = Array.from(
    { length: 9 },
    (_, index) =>
      `<circle class="white" cx="${US.x + 5 + (index % 3) * ((canton.width - 10) / 2)}" cy="${US.y + 4.5 + Math.floor(index / 3) * ((canton.height - 9) / 2)}" r="1.4"/>`,
  ).join("");
  const euStars = Array.from({ length: 12 }, (_, index) => {
    const angle = (2 * Math.PI * index) / 12;
    return `<path class="eu-yellow" d="${star(eu.x + 15 * Math.sin(angle), eu.y - 15 * Math.cos(angle), 2.6)}"/>`;
  }).join("");

  return `<svg class="flags" viewBox="0 0 120 106" aria-hidden="true">
  <g class="flag" transform="rotate(-8 ${US.x + US.width / 2} ${US.y + US.height / 2})">
    <rect class="white" x="${US.x}" y="${US.y}" width="${US.width}" height="${US.height}" rx="3"/>${usStripes}
    <rect class="us-blue" x="${US.x}" y="${US.y}" width="${canton.width}" height="${canton.height}"/>${usStars}
    <rect class="frame" x="${US.x}" y="${US.y}" width="${US.width}" height="${US.height}" rx="3"/>
  </g>
  <g class="flag" transform="rotate(6 ${eu.x} ${eu.y})">
    <rect class="eu-blue" x="${EU.x}" y="${EU.y}" width="${EU.width}" height="${EU.height}" rx="3"/>${euStars}
    <rect class="frame" x="${EU.x}" y="${EU.y}" width="${EU.width}" height="${EU.height}" rx="3"/>
  </g>
</svg>`;
}

const cards = funds
  .map(
    (fund) => `<li class="card">
      <p class="ticker">${escape(fund.ticker)}</p>
      <p class="meta"><span class="index">${escape(fund.index.replace(" ", " "))}</span><span class="ter">TER <strong>${fund.ter}</strong></span></p>
    </li>`,
  )
  .join("");

// Vlastní míry kreativy (pevné plátno 1080 px, ne responzivní stránka) – barvy, písma a rádiusy z tokens.css.
const css = `
${read("src/shared/styles/tokens.css")}
:root {
  --font-plus-jakarta-sans: "Plus Jakarta Sans";
  --font-outfit: "Outfit";
  --ad-pad: 88px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${SIZE.width}px; height: ${SIZE.height}px; }
body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 72px var(--ad-pad) 64px;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}
.brand {
  color: var(--color-ink-muted);
  font-size: 26px;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
}
.flags { position: absolute; top: 250px; right: 56px; width: 270px; overflow: visible; }
.flag { filter: var(--shadow-flag); }
.white { fill: var(--color-flag-white); }
.us-red { fill: var(--color-flag-us-red); }
.us-blue { fill: var(--color-flag-us-blue); }
.eu-blue { fill: var(--color-flag-eu-blue); }
.eu-yellow { fill: var(--color-flag-eu-yellow); }
.frame { fill: none; stroke: var(--color-flag-white); stroke-width: 1.5; }
h1 {
  display: grid;
  margin-top: -12px;
  font-family: var(--font-heading);
  line-height: var(--line-height-hero);
  letter-spacing: var(--letter-spacing-tight);
}
.line { display: flex; align-items: baseline; gap: 28px; }
.big { font-size: 184px; font-weight: var(--font-weight-black); }
.small { font-size: 92px; font-weight: var(--font-weight-bold); }
.w1 { color: var(--color-hero-word-1); }
.w2 { color: var(--color-hero-word-2); }
.w3 { color: var(--color-hero-word-3); }
.w4 { color: var(--color-hero-word-4); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; list-style: none; }
.card {
  display: grid;
  gap: 12px;
  padding: 22px 30px;
  border: 2px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  background: var(--color-pair-1);
}
.card:nth-child(2) { background: var(--color-pair-2); }
.card:nth-child(n + 3) { background: var(--color-pair-3); }
.ticker {
  color: var(--color-fact);
  font-family: var(--font-heading);
  font-size: 68px;
  font-weight: var(--font-weight-black);
  line-height: 1;
  letter-spacing: var(--letter-spacing-tight);
}
.meta { display: flex; justify-content: space-between; align-items: baseline; font-size: 28px; }
.index { color: var(--color-ink-muted); font-weight: var(--font-weight-bold); }
.ter { color: var(--color-ink); }
.ter strong { color: var(--color-loss); font-weight: var(--font-weight-black); }
.claim { display: grid; gap: 4px; font-size: 38px; line-height: var(--line-height-snug); }
.claim strong { font-weight: var(--font-weight-black); }
.fact { color: var(--color-fact); }
.loss { color: var(--color-loss); }
.question {
  display: grid;
  gap: 24px;
  margin-top: auto;
  padding: 36px 44px 40px;
  border-radius: var(--radius-lg);
  background-color: var(--color-quiz-bg);
  background-image:
    radial-gradient(circle at 100% 0%, var(--color-quiz-glow), transparent 60%),
    linear-gradient(var(--color-quiz-grid) 2px, transparent 2px),
    linear-gradient(90deg, var(--color-quiz-grid) 2px, transparent 2px);
  background-size: 100% 100%, 48px 48px, 48px 48px;
  color: var(--color-on-dark);
}
.question h2 {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
.cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 32px;
  border: 4px solid var(--color-accent-fill-border);
  border-radius: var(--radius-md);
  background: var(--color-accent-fill);
  color: var(--color-on-accent-fill);
  font-size: 34px;
  font-weight: var(--font-weight-black);
  letter-spacing: var(--letter-spacing-caps);
  text-transform: uppercase;
}
.cta svg { width: 44px; height: 44px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.source { color: var(--color-ink-muted); font-size: 22px; margin-top: -12px; }
`;

const html = `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>Reklama A – Není ETF jako ETF</title>
<!-- Jen pro vykreslení kreativy (PNG); stránka sama písma servíruje přes next/font. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&display=block&subset=latin-ext">
<style>${css}</style>
</head>
<body>
<p class="brand">ETF Reality Check</p>
${flagTwins()}
<h1 aria-label="Není ETF jako ETF">
  <span class="line"><span class="big w1">NENÍ</span><span class="small w2">ETF</span></span>
  <span class="line"><span class="small w3">JAKO</span><span class="big w4">ETF</span></span>
</h1>
<ul class="cards">${cards}</ul>
<p class="claim">
  <span>Stejný index <strong class="fact">${escape(indexName)}</strong>.</span>
  <span>Jiný ticker. Jiný <strong class="loss">poplatek</strong>.</span>
</p>
<section class="question">
  <h2>Které si koupíte v&nbsp;Česku?</h2>
  <p class="cta">Otestujte se jednou otázkou <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></p>
</section>
<p class="source">TER podle dokumentů správců, ověřeno ${formatDate(dataset.verifiedAt)}.</p>
</body>
</html>
`;

mkdirSync(`${root}/ads`, { recursive: true });
writeFileSync(`${root}/ads/reklama-a.html`, html);
console.log("ads/reklama-a.html");

if (existsSync(CHROME)) {
  execFileSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${SIZE.width},${SIZE.height}`,
    "--virtual-time-budget=5000",
    `--screenshot=${root}/ads/reklama-a.png`,
    `file://${root}/ads/reklama-a.html`,
  ], { stdio: "ignore" });
  console.log("ads/reklama-a.png");
} else {
  console.warn("Google Chrome nenalezen: PNG vytvořte otevřením ads/reklama-a.html v prohlížeči (1080 × 1350).");
}
