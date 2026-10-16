import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { datasetSchema } from "../data/schema.ts";
import { formatDate, formatTer } from "../src/shared/lib/format.ts";

// Kreativy reklam A a B (brief kap. 9): Meta feed 4 : 5, 1080 × 1350. Vzhled jako landing page
// (tokens.css, Outfit + Plus Jakarta Sans, vlajky jako v hero, karty fondů, tlačítka kvízu, CTA).
// A = srovnání 4 fondů, B = výzva jednou otázkou. Tickery, index, TER a datum se čtou
// z data/etf.json – nic se nepíše ručně.
// `npm run build:ads` → ads/reklama-{a,b}.html (zdroj) a .png (pro Meta, přes headless Chrome).

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

const AD_A_FUND_IDS = ["voo", "ivv", "spym", "spy"]; // pořadí jako na stránce (tech-spec 4)
const AD_B_FUND_ID = "voo"; // fond v otázce reklamy B (první karta reklamy A i stránky)
const SIZE = { width: 1080, height: 1350 };
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const NBSP = " ";

const dataset = datasetSchema.parse(JSON.parse(read("data/etf.json")));
const verifiedAt = formatDate(dataset.verifiedAt);

// Barva dvojice podle evropského dvojčete, v pořadí jako na stránce (VOO→VUAA = 1, IVV→CSPX = 2,
// SPYM a SPY→SPYL = 3), takže karta má stejné pozadí a ticker jako na landing page.
const twinOf = (id: string) => dataset.funds.find((candidate) => candidate.id === id)?.relatedFundIds[0] ?? null;
const twinOrder = [...new Set(AD_A_FUND_IDS.map(twinOf))];

function fund(id: string) {
  const found = dataset.funds.find((candidate) => candidate.id === id);
  if (!found?.ter.value || !found.index.value) throw new Error(`Reklama: fond ${id} nemá ověřené TER nebo index`);
  const tone = twinOrder.indexOf(twinOf(id)) + 1;
  if (tone < 1 || tone > 3) throw new Error(`Reklama: fond ${id} nemá barvu dvojice`);
  return {
    ticker: found.listing.ticker.value ?? id.toUpperCase(),
    index: found.index.value,
    ter: formatTer(found.ter.value),
    tone,
  };
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const nbsp = (text: string) => text.replace(/ /g, NBSP);
const arrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

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

// Společný základ obou kreativ (pevné plátno 1080 px, ne responzivní stránka) – barvy, písma
// a rádiusy z tokens.css.
const baseCss = `
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
.flags { display: block; overflow: visible; }
.flag { filter: var(--shadow-flag); }
.white { fill: var(--color-flag-white); }
.us-red { fill: var(--color-flag-us-red); }
.us-blue { fill: var(--color-flag-us-blue); }
.eu-blue { fill: var(--color-flag-eu-blue); }
.eu-yellow { fill: var(--color-flag-eu-yellow); }
.frame { fill: none; stroke: var(--color-flag-white); stroke-width: 1.5; }
h1 {
  display: grid;
  font-family: var(--font-heading);
  line-height: var(--line-height-hero);
  letter-spacing: var(--letter-spacing-tight);
}
.line { display: flex; align-items: baseline; gap: 28px; }
.w1 { color: var(--color-hero-word-1); }
.w2 { color: var(--color-hero-word-2); }
.w3 { color: var(--color-hero-word-3); }
.w4 { color: var(--color-hero-word-4); }
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
/* Karta fondu – stejná v obou reklamách a jako na stránce (pozadí dvojice, ticker v tmavé verzi) */
.card {
  display: grid;
  gap: 12px;
  padding: 22px 30px;
  border: 2px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  background: var(--pair-bg);
}
.pair1 { --pair-bg: var(--color-pair-1); --pair-ink: var(--color-pair-1-ink); }
.pair2 { --pair-bg: var(--color-pair-2); --pair-ink: var(--color-pair-2-ink); }
.pair3 { --pair-bg: var(--color-pair-3); --pair-ink: var(--color-pair-3-ink); }
/* Ticker = tmavá verze pozadí dvojice, stejné tokeny jako karty na stránce */
.ticker {
  color: var(--pair-ink);
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
`;

/** Karta fondu: ticker, index, TER (z data/etf.json). */
function fundCard(item: ReturnType<typeof fund>, tag = "li"): string {
  return `<${tag} class="card pair${item.tone}">
      <p class="ticker">${escape(item.ticker)}</p>
      <p class="meta"><span class="index">${escape(nbsp(item.index))}</span><span class="ter">TER <strong>${item.ter}</strong></span></p>
    </${tag}>`;
}

function page(title: string, css: string, body: string): string {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>${escape(title)}</title>
<!-- Jen pro vykreslení kreativy (PNG); stránka sama písma servíruje přes next/font. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&display=block&subset=latin-ext">
<style>${baseCss}${css}</style>
</head>
<body>
<p class="brand">ETF Reality Check</p>
${body}
</body>
</html>
`;
}

// ── Reklama A – „Není ETF jako ETF“ (srovnání 4 fondů) ─────────────────────────────────────

const adAFunds = AD_A_FUND_IDS.map(fund);
if (adAFunds.some((item) => item.index !== adAFunds[0].index)) throw new Error("Reklama A: fondy nesledují stejný index");

const adACss = `
.flags { position: absolute; top: 250px; right: 56px; width: 270px; }
h1 { margin-top: -12px; }
.big { font-size: 184px; font-weight: var(--font-weight-black); }
.small { font-size: 92px; font-weight: var(--font-weight-bold); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; list-style: none; }
.claim { display: grid; gap: 4px; font-size: 38px; line-height: var(--line-height-snug); }
.claim strong { font-weight: var(--font-weight-black); }
.fact { color: var(--color-fact); }
.loss { color: var(--color-loss); }
/* Otázka bez karty (Tom 16. 10.): jen text a žluté tlačítko */
.question { display: grid; gap: 24px; margin-top: auto; }
.question h2 {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
`;

const adACards = adAFunds.map((item) => fundCard(item)).join("");

const adA = page(
  "Reklama A – Není ETF jako ETF",
  adACss,
  `${flagTwins()}
<h1 aria-label="Není ETF jako ETF">
  <span class="line"><span class="big w1">NENÍ</span><span class="small w2">ETF</span></span>
  <span class="line"><span class="small w3">JAKO</span><span class="big w4">ETF</span></span>
</h1>
<ul class="cards">${adACards}</ul>
<p class="claim">
  <span>Stejný index <strong class="fact">${escape(nbsp(adAFunds[0].index))}</strong>.</span>
  <span>Jiný ticker. Jiný <strong class="loss">poplatek</strong>.</span>
</p>
<section class="question">
  <h2>Které si koupíte v${NBSP}Česku?</h2>
  <p class="cta">Otestujte se jednou otázkou ${arrow}</p>
</section>
<p class="source">TER podle dokumentů správců, ověřeno ${verifiedAt}.</p>`,
);

// ── Reklama B – „Otestujte se“ (výzva jednou otázkou) ──────────────────────────────────────
// Tom 16. 10.: „Většina lidí odpoví špatně“ jen s daty z rc_answer – zatím nejsou, proto
// „Odpověď vás možná překvapí.“

const adBFund = fund(AD_B_FUND_ID);

const adBCss = `
h1 { gap: 24px; margin-top: 8px; }
.lead { font-size: 104px; font-weight: var(--font-weight-bold); }
/* Místo slova „VOO“ karta VOO – stejná jako v reklamě A a na stránce, jen větší */
h1 .card { justify-self: start; width: 640px; gap: 20px; padding: 32px 44px; font-family: var(--font-sans); letter-spacing: normal; line-height: var(--line-height-snug); }
h1 .ticker { font-size: 150px; }
h1 .meta { font-size: 40px; }
/* Tlačítka ANO / NE ve stylu kvízu na stránce (žlutá plocha, tmavý obrys), vlajky drobně vedle */
.answers { display: grid; grid-template-columns: 1fr 1fr 220px; align-items: center; gap: 24px; margin-top: 16px; }
.answer {
  display: grid;
  place-items: center;
  height: 168px;
  border: 4px solid var(--color-accent-fill-border);
  border-radius: var(--radius-md);
  background: var(--color-accent-fill);
  color: var(--color-on-accent-fill);
  font-size: 72px;
  font-weight: var(--font-weight-black);
  letter-spacing: var(--letter-spacing-caps);
}
.answers .flags { width: 220px; }
.hook {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
.bottom { display: grid; gap: 28px; margin-top: auto; }
/* CTA tmavé, aby se nepletlo se žlutými tlačítky odpovědí */
.bottom .cta {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: var(--color-on-dark);
}
`;

const adB = page(
  `Reklama B – Koupíte si ${adBFund.ticker} v Česku?`,
  adBCss,
  `<h1 aria-label="Koupíte si ${escape(adBFund.ticker)} v Česku?">
  <span class="line"><span class="lead w1">Koupíte${NBSP}si</span></span>
  ${fundCard(adBFund, "span")}
  <span class="line"><span class="lead w2">v${NBSP}Česku?</span></span>
</h1>
<div class="answers" aria-hidden="true">
  <span class="answer">ANO</span>
  <span class="answer">NE</span>
  ${flagTwins()}
</div>
<section class="bottom">
  <p class="hook">Odpověď vás možná překvapí.</p>
  <p class="cta">Ověřte si odpověď ${arrow}</p>
</section>
<p class="source">TER podle dokumentů správců, ověřeno ${verifiedAt}. Nejde o investiční doporučení.</p>`,
);

// ── Výstup ─────────────────────────────────────────────────────────────────────────────────

mkdirSync(`${root}/ads`, { recursive: true });
const chrome = existsSync(CHROME);
for (const [name, html] of [
  ["reklama-a", adA],
  ["reklama-b", adB],
] as const) {
  writeFileSync(`${root}/ads/${name}.html`, html);
  console.log(`ads/${name}.html`);
  if (!chrome) continue;
  execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${SIZE.width},${SIZE.height}`,
      "--virtual-time-budget=5000",
      `--screenshot=${root}/ads/${name}.png`,
      `file://${root}/ads/${name}.html`,
    ],
    { stdio: "ignore" },
  );
  console.log(`ads/${name}.png`);
}
if (!chrome) console.warn("Google Chrome nenalezen: PNG vytvořte otevřením ads/*.html v prohlížeči (1080 × 1350).");
