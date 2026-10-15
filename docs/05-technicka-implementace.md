# 💻 5. TECHNICKÁ IMPLEMENTACE A FUNKČNOST (verze 3.1)

**Pro koho:** pro Claude Code (a pro Toma jako zadavatele). Technická specifikace landing page **ETF Reality Check** (zadání B pro Clientelo, termín 16. 10. 2026).
**Vztah k ostatním dokumentům:** *co* a *proč* (cílovka, texty, pořadí sekcí, reklamy) je v `brief.md`. Tady je *jak*. Při rozporu platí `brief.md`; rozpor zapiš do `docs/decisions.md`.
**Stav:** 15. 10. 2026. Tarify služeb třetích stran (Vercel, Neon, Umami, Resend) se mění, před nasazením je ověř.

**Změny proti verzi 2:** koncept kalkulačka + srovnávač nahrazen kvízem ETF Reality Check (původně 2 otázky, páry NYSE ↔ UCITS, 3 jezdce). Přepsány sekce 3, 4.3, 4.5, 5, 6, 9, 10, 13, 14, 15. Zrušen hypotetický fond s TER 0,40 %, jednorázový vklad a zamčené (rozmazané) sekce. Eventy mají prefix `rc_`. Stack, formulář, API, databáze a bezpečnost beze změny.

**Změny ve verzi 3.1 (15. 10. 2026):** zrušena otázka 2 (pruh alokace, `index-weights.json`, `allocation-bar`, event `rc_q2_answer`, sloupec `quiz_q2`). Kvíz má jedinou otázku, formulář následuje hned po odhalení.

---

## 🧭 0. PRAVIDLA PRO CLAUDE CODE (ČTI JAKO PRVNÍ)

Tato pravidla mají přednost před vším ostatním v dokumentu:

1. **Žádná finanční data z paměti.** TER, AUM, ISIN, tickery, burzy, váhy indexů ani výkonnost nikdy nedoplňuj z vlastních znalostí. Hodnoty dodává Tom, nebo je dohledáš na stránce emitenta a zapíšeš URL + datum ověření. Neznámá hodnota = `null` se stavem `"unverified"`, nikdy odhad.
2. **Žádná ručně psaná čísla v textech.** Částky v Kč počítá `projection.ts` z `data/`. Do `content/` se píšou jen šablony s proměnnými. Čísla z mockupů a poznámek **nepřebírej** (byla spočítaná jiným vzorcem).
3. **Žádný falešný úspěch.** Formulář smí ukázat „Hotovo“ jen tehdy, když server potvrdil uložení leadu. Chybějící konfigurace v produkci = viditelná chyba, ne tichý „úspěch“.
4. **Žádné živé API pro tržní data.** Data jsou statická v `data/`.
5. **Žádný lorem ipsum.** Texty se berou z `content/`. Chybí-li text, vlož viditelný placeholder `[[CHYBÍ TEXT: …]]` a nahlas ho.
6. **Model ≠ fakt.** Každý výsledek výpočtu je v UI označen jako modelový. Ověřená fakta mají u sebe zdroj a datum.
7. **Žádné doporučení.** Nikdy „doporučujeme“, „kupte“, „ten si koupíte“. Jen fakta („nejnižší TER“).
8. **Design jen přes tokeny** z `tokens.css`. Žádné UI knihovny.
9. **Malé commity** po každém kroku plánu (sekce 14). Historie commitů je součástí hodnocení.
10. Když si nejsi jistý, rozhodni, zapiš do `docs/decisions.md` (jedna věta: co, proč) a pokračuj.
11. Čeština všude v UI, vykání, české formáty čísel (`0,07 %`, `4 557 Kč`, nedělitelné mezery).

---

## 🏗️ 1. TECHNOLOGICKÝ STACK

| Vrstva | Volba | Proč |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Nativní na Vercelu, statické generování + serverová route pro formulář |
| Styly | CSS Modules + design tokeny (CSS custom properties) | Nulový runtime, každá hodnota záměrná → nepůsobí jako generický výstup AI. Tom je zná z Joinella |
| Validace | Zod | Jedno schéma pro klienta, server i kontrolu dat |
| Databáze | Neon (Postgres), free tarif | Tom ho zná z Joinella, integrace s Vercelem |
| Přístup k DB | `@neondatabase/serverless`, čisté SQL, bez ORM | Jedna tabulka a jeden INSERT; tagged template parametrizuje hodnoty |
| Příjem formuláře | Route Handler `POST /api/lead` (ne Server Action) | Explicitní HTTP kódy, snadné mockování v Playwrightu |
| Analytika | Umami Cloud, tarif Hobby | Bez cookies, vlastní eventy, funnely, UTM reporty zdarma |
| PDF tahák | `@react-pdf/renderer` ve skriptu při buildu | PDF ze stejných dat jako stránka → nemůže vzniknout rozpor |
| E-mail (volitelně) | Resend | Jen s ověřenou vlastní doménou (7.4) |
| Testy | Vitest (unit), Playwright (e2e, mobilní viewport) | Výpočet a formulář musí být prokazatelně funkční |
| Hosting | Vercel, tarif Hobby | Požadavek zadání |

- Verze balíčků aktuální stabilní, zapsané v `package.json` (žádné `latest`). Další knihovny jen s důvodem v `docs/decisions.md`.
- **Nepoužíváme:** Tailwind, shadcn/MUI ani jiné UI knihovny, ORM, Zustand/Redux, knihovny pro grafy, animace, ikony a slidery (jezdce = nativní `<input type="range">` s vlastním stylem).
- **Proč ne Vercel Web Analytics:** na Hobby nepodporuje vlastní eventy. Umami Cloud Hobby: 1 web, 100 tis. eventů měsíčně, funnely a UTM. Každá vlastnost eventu se počítá jako další event → drž je nízko.
- **Vercel Hobby** je pro nekomerční projekty. Pro ukázku stačí; v README jednou větou: ostrá kampaň by běžela na Pro.

---

## 🎨 2. STYLY A DESIGN TOKENY

- `src/shared/styles/tokens.css` – jediné místo pro barvy, typografickou škálu, řádkování, mezery, rádiusy, stíny, délky přechodů.
- `src/app/globals.css` – reset, `@import` tokenů, základní typografie, `:focus-visible`, `prefers-reduced-motion`.
- Každá komponenta má vlastní `<nazev>.module.css` a používá jen `var(--…)`. Natvrdo zapsaná barva nebo px mimo tokeny = chyba při review.
- Mobile-first: základ 360 px, rozšíření `@media (min-width: 640px)` a `(min-width: 1024px)`.
- Vizuální směr: `brief.md` kap. 13 (off-white podklad, tmavý inkoust, oranžový akcent na poplatky a CTA, zelená jen pro odznak „nejnižší TER“, americké karty zašedlé, ale v kontrastu AA). Konkrétní hex hodnoty a fonty dodá Tom; do té doby platí pravidla kontrastu z 11.2.
- Čísla: `font-variant-numeric: tabular-nums`.
- Jezdce: vlastní styl `<input type="range">` (track + thumb přes tokeny), thumb min. 44 × 44 px dotyková plocha.

---

## 📁 3. STRUKTURA REPOZITÁŘE

```
/
├── src/
│   ├── app/                                  # jen routy, tenké stránky skládající features
│   │   ├── layout.tsx                        # fonty, metadata, Umami skript
│   │   ├── globals.css
│   │   ├── page.tsx, page.module.css         # landing (varianta A)
│   │   ├── v/[variant]/page.tsx              # hero pro reklamu A/B (staticky generované)
│   │   ├── metodika/page.tsx                 # zdroje, vzorec, předpoklady
│   │   ├── zasady-ochrany-udaju/page.tsx
│   │   └── api/lead/route.ts                 # příjem formuláře
│   ├── features/
│   │   ├── etf-reality-check/
│   │   │   ├── components/
│   │   │   │   ├── etf-reality-check/        # kontejner, drží stav (odpověď, jezdce)
│   │   │   │   ├── hero/                     # H1 + podnadpis dle varianty + čipy tickerů
│   │   │   │   ├── quiz-step/                # otázka + tlačítka ANO/NE
│   │   │   │   ├── answer-reveal/            # výsledek odpovědi + vysvětlení + zdroj
│   │   │   │   ├── fund-pair-grid/           # 2 sloupce NYSE ↔ UCITS
│   │   │   │   ├── fund-card/                # ticker, správce, ACC/DIST, TER, poplatky v Kč
│   │   │   │   └── projection-sliders/       # 3 jezdce + souhrnná věta
│   │   │   ├── lib/
│   │   │   │   ├── projection.ts             # čisté funkce výpočtu
│   │   │   │   ├── projection.test.ts
│   │   │   │   ├── pairs.ts                  # sestaví páry z etf.json (relatedFundIds)
│   │   │   │   └── pairs.test.ts
│   │   │   └── index.ts                      # veřejné API: EtfRealityCheck
│   │   ├── lead/
│   │   │   ├── components/{lead-capture,lead-success,sticky-cta}/
│   │   │   ├── hooks/use-lead-status.ts      # „už odesláno“ v localStorage (try/catch)
│   │   │   ├── services/save-lead.ts         # import "server-only", SQL do Neonu
│   │   │   └── index.ts                      # veřejné API: LeadCapture, StickyCta
│   │   └── analytics/
│   │       ├── lib/{track.ts,utm.ts}
│   │       └── index.ts                      # veřejné API: track, getUtm
│   ├── shared/
│   │   ├── components/ui/                    # button, source-note, disclaimer, badge, details…
│   │   ├── components/icons/                 # vlastní SVG komponenty
│   │   ├── lib/{format.ts,format.test.ts,fonts.ts}
│   │   ├── schemas/lead.schema.ts            # Zod
│   │   └── styles/tokens.css
│   └── middleware.ts                         # utm_content → varianta hero (viz 8)
├── data/
│   ├── etf.json                              # fondy + kótace + zdroje (jediný zdroj pravdy)
│   ├── assumptions.json                      # modelové předpoklady a rozsahy jezdců
│   └── schema.ts                             # Zod schéma všech datových souborů
├── content/
│   ├── copy.ts                               # všechny texty (otázky, odhalení, lead, FAQ, patička)
│   └── hero-variants.ts                      # H1 + podnadpis pro A a B
├── db/schema.sql
├── scripts/
│   ├── check-data.ts                         # validace dat (prebuild)
│   ├── build-pdf.tsx                         # generuje public/tahak-etf-2026.pdf
│   └── db-setup.ts
├── public/{tahak-etf-2026.pdf, fonts/}
├── ads/{reklama-a.md, reklama-b.md, obrázky kreativ}
├── tests/e2e/                                # Playwright
├── docs/{05-technicka-implementace.md, decisions.md}
├── ai-log/                                   # exporty /export z Claude Code
├── brief.md
├── CLAUDE.md
└── README.md
```

### 3.1 Jmenná a architektonická pravidla

- Soubory a složky **kebab-case** (i ikony: `arrow-icon.tsx`, export `ArrowIcon`).
- Komponenta = složka se stejně pojmenovaným `.tsx` a `.module.css`. Žádná komponenta mimo vlastní složku.
- Feature neimportuje z jiné feature, jen ze `shared/`, `data/`, `content/` a z veřejného API jiné feature přes její `index.ts`. Skládání dělá `src/app/`.
- Komunikace mezi features (např. sticky CTA se má ukázat po odhalení) **ne přes sdílený stav**, ale přes DOM kotvy: `etf-reality-check` vykreslí `<div id="reveal-start">`, `sticky-cta` ho sleduje přes `IntersectionObserver`.
- Serverový kód v `services/` začíná `import "server-only"`.
- Unit testy vedle kódu. Žádné prázdné složky a nic „na později“.

---

## 🗃️ 4. DATOVÝ MODEL

### 4.1 Princip

- Dvě úrovně: **fond** (třída akcií: TER, index, ACC/DIST, ISIN) a **kótace** (ticker + burza + měna).
- Každá zobrazená hodnota nese hodnotu, jednotku, zdroj (název + URL), `asOf`, `verifiedAt` a typ (`fact` / `historical` / `model`).
- Americké (NYSE Arca) fondy a UCITS dvojčata jsou samostatné záznamy propojené `relatedFundIds`. Nikdy je neslučuj.

### 4.2 Schéma (TypeScript / Zod – závazné)

```ts
type Sourced<T> = {
  value: T | null;               // null = zatím neověřeno
  unit?: "%" | "USD" | "EUR" | "CZK" | "bn USD";
  status: "verified" | "unverified";
  type: "fact" | "historical" | "model";
  source: { label: string; url: string } | null;
  asOf: string | null;           // ISO datum, ke kterému údaj platí
  verifiedAt: string | null;     // ISO datum, kdy jsme údaj zkontrolovali
  note?: string;
};

type Fund = {
  id: string;                    // "voo", "vuaa"
  name: string;
  issuer: string;                // "Vanguard", "iShares", "State Street"
  domicile: "US" | "IE" | "LU";
  regime: "US-registered" | "UCITS";
  isin: Sourced<string>;
  index: Sourced<string>;
  ter: Sourced<number>;          // v procentech, 0.03 = 0,03 %
  aum: Sourced<number>;
  distribution: Sourced<"ACC" | "DIST">;
  baseCurrency: Sourced<"USD" | "EUR">;
  hedged: boolean;
  kidAvailableForEURetail: Sourced<boolean>;
  relatedFundIds: string[];
  role: "quiz-pair" | "guide-only";   // zobrazit v kvízu, nebo jen v taháku
  previousTicker?: string;           // např. SPYM: "SPLG" – jen pokud ověřeno
};

type Listing = {
  fundId: string;
  ticker: string;
  exchange: Sourced<string>;
  tradingCurrency: Sourced<"USD" | "EUR" | "GBP">;
};

type Dataset = { datasetVersion: string; funds: Fund[]; listings: Listing[] };
```

### 4.3 Výběr fondů

| Role | Fondy | Proč |
|---|---|---|
| `quiz-pair` (stránka, zdarma) | **VOO → VUAA, IVV → CSPX, SPYM → SPYL, SPY → SPY5** | Páry podle správce: kdo zná ticker z videa, hned vidí „svůj“ fond a jeho evropské dvojče. SPY5 je jediné distribuční. |
| `guide-only` (tahák) | celý US trh, MSCI World, rozvíjející se trhy, celý svět (UCITS) | Rozšiřuje kvíz na celé portfolio. Konkrétní fondy vybere Tom (kategorie 3). Jen v PDF. |

Pořadí na stránce: VOO, IVV, SPYM, SPY (jako v reklamě A).

**Stav ověření k 15. 10. 2026:** SPYM 0,02 % (NYSE Arca), SPYL 0,03 %, SPY5 0,03 % (dist.) ověřeno u State Street. VOO, IVV, SPY, VUAA, CSPX a všechny ISINy = `null` / `unverified`, dokud je Tom nedoplní.

### 4.4 Kontrola dat (`npm run check:data`, běží jako prebuild)

Build selže, pokud:
- data neodpovídají Zod schématu,
- hodnota se `status: "verified"` nemá `source.url` nebo `verifiedAt`,
- fond v `relatedFundIds` odkazuje na neexistující `id`, nebo pár není oboustranný,
- v produkci (`NODE_ENV=production`) je u fondu s rolí `quiz-pair` povinná hodnota (`ter`, `isin`, `index`, `distribution`) `unverified` (ve vývoji jen varování),
- `verifiedAt` je v budoucnosti (chyba) nebo starší než 90 dní (varování).

UI nikdy nevykreslí `null` jako „0“. Ve vývoji zobrazí `— (neověřeno)`; karta bez TER nespočítá poplatky a ukáže totéž.

### 4.5 Modelové předpoklady (`data/assumptions.json`)

```json
{
  "grossAnnualReturn": {
    "default": 0.06, "min": 0.02, "max": 0.10, "step": 0.005,
    "type": "model",
    "label": "Modelový výnos před TER",
    "note": "Předpoklad pro výpočet, ne záruka budoucích výnosů."
  },
  "years":   { "default": 20,   "min": 1,   "max": 40,    "step": 1 },
  "monthly": { "default": 3000, "min": 500, "max": 20000, "step": 500 }
}
```

Hypotetický „dražší fond“ neexistuje. Srovnávají se jen reálné fondy z `etf.json`.

---

## 🧮 5. VÝPOČET (`features/etf-reality-check/lib/projection.ts`)

### 5.1 Vzorec (závazný – i na `/metodika` a v README)

- `i = (1 + r)^(1/12) − 1`, `n = roky × 12`
- Měsíční vklady na konci měsíce: `FV(r) = M × ((1 + i)^n − 1) / i`; pro `i = 0`: `FV = M × n`
- Vloženo celkem: `M × n`
- Hodnota bez poplatků: `FV(g)`; hodnota fondu: `FV(g − TER)` (zjednodušení: TER se odečítá od výnosu)
- **Ztráta kvůli poplatkům fondu:** `feeCost = FV(g) − FV(g − TER)`. Obsahuje i ušlé zhodnocení, proto v UI „přijdete o“, ne „zaplatíte“.
- Zaokrouhlení až při zobrazení (celé Kč).
- Pod výsledkem jedna věta (z `content/copy.ts`): modelový výpočet, výnos je předpoklad, měsíční úročení, TER odečten od výnosu, bez poplatků brokera, směny měn a daní.

### 5.2 API

```ts
export type ProjectionInput = { monthly: number; years: number; grossReturn: number };
export function futureValue(monthly: number, years: number, annualRate: number): number;
export function feeCost(input: ProjectionInput, ter: number): number;          // ter v procentech (0.03)
export function projectAll(input: ProjectionInput, funds: { id: string; ter: number | null }[]):
  { grossValue: number; invested: number; perFund: { id: string; feeCost: number | null }[] };
export function clampInput(raw: Partial<ProjectionInput>): ProjectionInput;   // ořízne na rozsahy z assumptions.json
```

Pozor na jednotky: TER je v datech v procentech (`0.03` = 0,03 %), výnos v desetinném čísle (`0.06` = 6 %). Převod `ter / 100` dělá jen `projection.ts`.

### 5.3 Testovací případy (Vitest – musí projít)

Referenční hodnoty spočítané tímto vzorcem (Python, 15. 10. 2026). TER v testech jsou **vstupy testu**, ne ověřená data.

| # | Vstup | Očekávaný výsledek |
|---|---|---|
| 1 | M = 3 000, 20 let, g = 6 %, TER = 0 | `FV = 1 360 315,90` (±0,01) |
| 2 | totéž, TER = 0,02 % | `feeCost = 3 039,65` (±0,01) |
| 3 | totéž, TER = 0,03 % | `feeCost = 4 556,57` (±0,01) |
| 4 | totéž, TER = 0,07 % | `feeCost = 10 605,01` (±0,01) |
| 5 | totéž, TER = 0,0945 % | `feeCost = 14 294,51` (±0,01) |
| 6 | g = TER (čistý výnos 0) | `FV = M × n` (vloženo celkem) |
| 7 | vyšší TER ⇒ vyšší feeCost (monotonie, náhodné vstupy v rozsahu) | platí |
| 8 | `clampInput` s hodnotami mimo rozsah / NaN / text | ořízne na min/max, NaN → výchozí |
| 9 | fond s `ter: null` | `feeCost: null`, žádná výjimka |
| 10 | kontrola tech-spec v2: L = 100 000 jednorázově, 10 let, 6 % | `179 084,77` (ověřuje převod na měsíční sazbu; testuje pomocnou funkci, pokud existuje, jinak vynech) |

> ⚠️ Čísla z Tomova mockupu (4 975 / 11 576 / 15 600 / 3 319 / 1 388 078 Kč) vznikla jiným vzorcem a **nepoužívat**. Výchozí scénář se do README a `ads/` přepíše až z výstupu testů s ověřenými TER.

---

## 🧩 6. ETF REALITY CHECK (KOMPONENTY A CHOVÁNÍ)

Texty všech kroků jsou v `content/copy.ts` (zdroj: `brief.md` kap. 4–7). Pořadí a zdůvodnění: `brief.md` kap. 3.

### 6.1 Stav (`etf-reality-check`)

```ts
type State = {
  answer: "ano" | "ne" | null;   // null = ještě neodpověděl → odhalení skryté
  input: ProjectionInput;        // výchozí z assumptions.json
};
```

- Klientská komponenta jen tady (a ve formuláři/sticky CTA). Hero text je server-rendered.
- Odhalení se **odkryje pod otázkou** (ne místo ní). Po odpovědi plynulý scroll k odhalení (respektovat `prefers-reduced-motion`).
- Změna odpovědi po odhalení není potřeba; tlačítka po odpovědi zůstanou zablokovaná se zvýrazněnou volbou.

### 6.2 Hero + otázka

- H1 a podnadpis z `content/hero-variants.ts` podle varianty. Pod nimi 4 čipy tickerů (VOO · IVV · SPYM · SPY).
- Otázka + tlačítka **ANO / NE** jsou součástí první obrazovky: vše above the fold na **360 × 640 px** (ověřit v Playwrightu). Tlačítka min. 48 px vysoká, vedle sebe.
- Pod tlačítky drobně: „Zdarma, bez registrace · 1 otázka“.

### 6.3 Odhalení

- `answer-reveal`: první řádek podle odpovědi (správně / nesprávně), pak společné vysvětlení s odkazem na zdroj (KID/PRIIPs).
- `fund-pair-grid`: na mobilu **páry pod sebou** (řádek = NYSE karta vlevo, UCITS vpravo, 2 úzké sloupce); na ≥ 640 px klasické 2 sloupce s hlavičkami „USA · v ČR obvykle nekoupíte“ / „Evropské dvojče · koupíte“.
- `fund-card`: ticker (velký), správce, u UCITS ACC/DIST jako text („akum.“ / „dist.“), TER se `source-note`, **jedno velké oranžové číslo** „přijdete o X Kč“. Americké karty zašedlé (kontrast AA).
- Odznak **„nejnižší TER“** (symbol + text) u všech UCITS fondů se shodně nejnižším TER. Počítá se z dat, ne natvrdo.
- `projection-sliders`: 3 nativní range inputy s viditelnou hodnotou (`6 %`, `20 let`, `3 000 Kč`), `aria-valuetext` česky. Přepočet okamžitě (bez debounce pro UI; debounce jen pro analytiku).
- Souhrnná věta pod jezdci: „Vložíte X Kč. Bez poplatků by to modelově bylo Y Kč, poplatky z toho uberou Z až W Kč podle fondu.“ (min/max přes fondy s ověřeným TER). Výsledek v `aria-live="polite"`.
- Na začátku odhalení kotva `#reveal-start` (pro sticky CTA). Hned za odhalením následuje `lead-capture` (6.5).

### 6.4 Otázka 2

Zrušena 15. 10. 2026 (viz `docs/decisions.md`). Téma „World není celý svět“ je jen v taháku.

### 6.5 Formulář je vždy v DOM

`lead-capture` je na stránce od začátku (pod kvízem), i když návštěvník ještě neodpověděl. Nad formulářem je „most“ z `content/copy.ts` („Tohle byl jen S&P 500…“). Důvod: sticky CTA a přímý scroll musí mít kam vést i bez odpovědi, a A/B hypotéza č. 2 (formulář nad jezdci vs. pod nimi) se řeší jen přesunem v `src/app/` nebo v kontejneru.

---

## ✉️ 7. FORMULÁŘ A LEAD

### 7.1 Pole

- Jediné povinné pole: e-mail (`type="email"`, `autocomplete="email"`, `inputmode="email"`, viditelný label).
- Honeypot `website` (vizuálně skryté, `tabindex="-1"`, `aria-hidden`).
- Pod tlačítkem informace o zpracování + odkaz na `/zasady-ochrany-udaju`; verze textu `consentVersion` se ukládá k leadu.
- Věta „pošleme vám ho i e-mailem“ se vykreslí **jen** při `EMAIL_ENABLED=true`.
- Bez jména a telefonu. Text tlačítka z `content/copy.ts` (výchozí „Poslat tahák“).
- Při odesílání „Odesílám…“, tlačítko zablokované. Neon se po nečinnosti probouzí → timeout na klientu cca 10 s → chybový stav.

### 7.2 API `POST /api/lead`

Request:

```json
{ "email": "jan@example.cz", "website": "", "variant": "a",
  "utm": { "source": "meta", "medium": "paid_social", "campaign": "etf_reality_check", "content": "ad_a" },
  "quiz": { "answer": "ano" },
  "startedAt": 1760380000000 }
```

Zpracování:
- Zod validace (`shared/schemas/lead.schema.ts`): formát e-mailu, max 254 znaků, trim + lowercase; `quiz` volitelné.
- Honeypot vyplněn nebo odesláno za < 2 s od `startedAt` → `200 { ok: true }`, nic neukládat.
- Rate limit 5 požadavků / 10 min / IP v paměti instance (best effort; omezení do README).
- `saveLead()` → `"created"` / `"duplicate"`. Duplicita → 200 (neprozrazovat existenci e-mailu).
- (Volitelně) e-mail; jeho selhání nesmí změnit odpověď, lead je uložen.

| Stav | HTTP | Tělo | UI |
|---|---|---|---|
| Uloženo / duplicita | 200 | `{ ok: true, guideUrl: "/tahak-etf-2026.pdf" }` | stav úspěchu |
| Neplatný e-mail | 400 | `{ ok: false, code: "invalid_email" }` | chyba u pole |
| Příliš mnoho pokusů | 429 | `{ ok: false, code: "rate_limited" }` | „Zkuste to prosím za chvíli.“ |
| Chyba serveru / DB / chybí `DATABASE_URL` | 500 | `{ ok: false, code: "server_error" }` | chyba + „Zkusit znovu“, e-mail zůstává v poli |

### 7.3 Databáze (Neon, bez ORM)

`db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  variant         text NOT NULL DEFAULT 'a',        -- 'a' | 'b'
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  quiz_answer     text,                             -- 'ano' | 'ne' | NULL
  consent_version text NOT NULL
);
```

`src/features/lead/services/save-lead.ts`:

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";

export async function saveLead(lead: Lead): Promise<"created" | "duplicate"> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");   // → route vrátí 500
  const sql = neon(url);
  const rows = await sql`
    INSERT INTO leads (email, variant, utm_source, utm_medium, utm_campaign, utm_content,
                       quiz_answer, consent_version)
    VALUES (${lead.email}, ${lead.variant}, ${lead.utm.source}, ${lead.utm.medium},
            ${lead.utm.campaign}, ${lead.utm.content}, ${lead.quiz?.answer ?? null},
            ${lead.consentVersion})
    ON CONFLICT (email) DO NOTHING
    RETURNING id`;
  return rows.length ? "created" : "duplicate";
}
```

- Hodnoty vždy jen přes tagged template. Nikdy skládání SQL řetězců.
- Neukládat IP adresu ani user agent. `DATABASE_URL` jen na serveru.
- Ve vývoji samostatná Neon branch (dev), produkce vlastní.
- Před odevzdáním: testovací lead v produkci + screenshot tabulky do README.

### 7.4 Co návštěvník dostane po odeslání

- Formulář se nahradí `lead-success`: potvrzení, tlačítko **„Stáhnout tahák (PDF)“** (`rc_pdf_download`), sticky CTA zmizí.
- `use-lead-status` si v `localStorage` (try/catch) pamatuje „odesláno“, aby se po reloadu ukázal stav úspěchu s odkazem. Bez úložiště stránka funguje dál.
- Věta „Kopii jsme poslali na …“ jen, když e-mail opravdu odešel.
- E-mail je sekundární. Resend bez ověřené domény doručuje jen vlastníkovi účtu. Bez domény: `EMAIL_ENABLED=false` a v README jako známé omezení.
- Gating je měkký: PDF leží v `public/`. Pro lead magnet standardní; v README jednou větou.

### 7.5 PDF tahák (`npm run build:pdf`)

- Název: **„Z amerického videa do českého portfolia“**, 4–5 stran, osnova v `brief.md` kap. 8.
- Generuje se z `data/etf.json` a `data/assumptions.json` + texty z `content/guide.ts` (vytvořit, až Tom dodá texty).
- Font s českou diakritikou (TTF s Latin Extended-A v `public/fonts/`); po vygenerování PDF otevřít a diakritiku zkontrolovat.
- Na titulní straně verze datasetu a datum generování. Na poslední straně zdroje, data ověření, vzorec a upozornění „nejde o investiční ani daňové poradenství“.
- **Záložní plán** (pokud `@react-pdf` nestihneme): HTML stránka `/tahak` s print stylem → PDF jednorázově z prohlížeče, uložit do `public/`, v README přiznat.

---

## 🎯 8. VARIANTY PRO REKLAMU A / B (MESSAGE MATCH)

- A: `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a`, B: totéž s `ad_b`. Bez UTM = A.
- Middleware podle `utm_content` rewrite na `/v/a` nebo `/v/b` (URL v prohlížeči se nemění).
  - ⚠️ Next.js 16 přejmenoval `middleware.ts` na `proxy.ts`. Použij název podle nainstalované verze a zapiš do `docs/decisions.md`.
- `/v/[variant]` staticky generovaná (`generateStaticParams`) → bez probliknutí textu.
- Liší se **jen hero** (H1 a podnadpis z `content/hero-variants.ts`). Otázka a zbytek stránky jsou stejné.
- Hero B obsahuje částku v Kč: generuje se při buildu z `projection.ts` (výchozí jezdce, dvojice fondů z `content/hero-variants.ts`), nikdy ručně. Neověřený TER → build v produkci selže.
- `/v/*` má `noindex` a canonical na `/`.
- UTM se při prvním načtení uloží do `sessionStorage` (try/catch) a posílají se s leadem i eventy.
- `ads/reklama-a.md`, `ads/reklama-b.md`: obsah podle `brief.md` kap. 9. Konkrétní částky v Kč až z testů s ověřenými TER.

---

## 📈 9. ANALYTIKA

### 9.1 Nastavení

- Umami skript v `src/app/layout.tsx` přes `next/script` (`afterInteractive`), `data-website-id` z env, `data-domains` = produkční doména.
- `features/analytics/lib/track.ts`: `track(name, props?)` volá `window.umami?.track`, nikdy nevyhodí chybu, v dev jen `console.debug`. Všechny eventy automaticky doplní `variant`.

### 9.2 Eventy

| Event | Kdy | Vlastnosti (max 2) |
|---|---|---|
| (pageview) | automaticky | UTM z URL |
| `rc_view` | kvíz ≥ 50 % ve viewportu, 1× za relaci | variant |
| `rc_answer` | odpověď na otázku | answer (`ano`/`ne`), variant |
| `rc_slider_change` | první pohyb každého jezdce v relaci (debounce 1 s) | slider (`return`/`years`/`monthly`) |
| `rc_cta_click` | klik na sticky CTA / jiné CTA vedoucí na formulář | location (`sticky`/…) |
| `rc_form_view` | formulář ≥ 50 % ve viewportu, 1× za relaci | variant |
| `rc_form_focus` | první focus do pole e-mail | variant |
| `rc_form_submit` | klik na odeslat (před odpovědí serveru) | variant |
| `rc_lead_success` | až po `200 { ok: true }` | variant |
| `rc_lead_error` | 4xx/5xx nebo síťová chyba | code |
| `rc_pdf_download` | klik na stažení taháku | variant |

- `correct` se neposílá (dá se odvodit z odpovědi, šetří eventy). Hodnota jezdce se neposílá.
- **Funnel v Umami:** `pageview → rc_answer → rc_form_view → rc_form_focus → rc_form_submit → rc_lead_success`.
- Zdroj pravdy pro konverze je tabulka `leads` (blokovače schovají část eventů). CVR varianty = leady s `variant = 'a'` ÷ pageviews s `utm_content = ad_a`. V README zmínit, že analytika podhodnocuje návštěvy s blokovačem.
- Rozdíl `rc_form_submit − rc_lead_success` ukazuje chyby validace a serveru.
- E-mail nikdy do `track()`.

---

## 🧱 10. STRÁNKA A POŘADÍ SEKCÍ

Závazné pořadí a zdůvodnění je v `brief.md` kap. 3:

1. Hero + otázka (above the fold)
2. Odhalení: páry NYSE ↔ UCITS + jezdce
3. Lead capture (most, 3 body, e-mail)
4. Pojmy a FAQ (`<details>`): TER, KID/UCITS, ACC/DIST, měnové riziko
5. Zdroje, metodika (odkaz na `/metodika`), upozornění
6. Patička: provozovatel, kontakt, zásady ochrany údajů

**Sticky CTA (mobil, < 640 px):** objeví se, když návštěvník odpověděl a `#reveal-start` odjel nad viewport; text „Získat tahák zdarma“ → scroll na formulář (`rc_cta_click`, `location: "sticky"`). Skrytá, když je formulář ve viewportu nebo po úspěchu. Nesmí zakrývat obsah (spodní padding stránky).

---

## 📱 11. NEFUNKČNÍ POŽADAVKY

### 11.1 Výkon (Lighthouse mobil + PageSpeed Insights na produkční URL)

| Metrika | Cíl |
|---|---|
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| Lighthouse Performance / Accessibility | ≥ 90 / ≥ 95 |

- Klientské komponenty jen tam, kde je interakce (kvíz, formulář, sticky CTA); hero H1 server-rendered (LCP).
- Fonty přes `next/font`, subset latin-ext, max 2 rodiny. Žádné fotky ani video; grafika jako inline SVG/CSS.
- Naměřené hodnoty do README.

### 11.2 Přístupnost a čitelnost

- Text min. 16 px, dotykové plochy min. 48 × 48 px.
- `<label>` u každého pole, chyby přes `aria-describedby`, výsledky v `aria-live="polite"`.
- Tlačítka odpovědí jako `<button>` ve `<fieldset>` s `<legend>` = znění otázky.
- Viditelný `:focus-visible`, ovladatelnost klávesnicí (i jezdce), `prefers-reduced-motion`.
- Barva nikdy jako jediný nositel významu (odznak, správně/špatně).
- Kontrast: bílý text na `#F97316` ≈ 2,8 : 1 nevyhovuje; na oranžovém CTA tmavý text; oranžový text na světlém podkladu jen v sytém odstínu (např. `#C2410C`). Zašedlé americké karty také ≥ 4,5 : 1. Finální hodnoty ověřit nástrojem.

### 11.3 Lokalizace

- `shared/lib/format.ts` nad `Intl.NumberFormat("cs-CZ")`: `4 557 Kč`, `0,03 %`, `0,0945 %` (TER bez zaokrouhlení), `15. 10. 2026`.
- `<html lang="cs">`.

### 11.4 Bezpečnost

- Tajné klíče jen na serveru, `import "server-only"` ve `services/`.
- Hlavičky v `next.config`: `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, základní CSP povolující Umami.
- SQL jen parametrizovaně. Žádné osobní údaje v URL ani v analytice.

### 11.5 SEO a sdílení

- `metadata`: title, description, Open Graph obrázek. Landing indexovatelná, `/v/*` `noindex`.

---

## 🔐 12. PROMĚNNÉ PROSTŘEDÍ

| Proměnná | Kde | Povinná v produkci |
|---|---|---|
| `DATABASE_URL` | server | ano (Neon integrace ve Vercelu) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | klient | ano |
| `NEXT_PUBLIC_SITE_URL` | klient | ano |
| `EMAIL_ENABLED` | server | ne (default `false`) |
| `RESEND_API_KEY`, `EMAIL_FROM` | server | jen když `EMAIL_ENABLED=true` |

`.env.example` se všemi klíči bez hodnot; ostatní `.env*` v `.gitignore`.

---

## 🧪 13. TESTOVÁNÍ

### 13.1 Automatické

**Unit (Vitest, vedle kódu):**
- `projection.ts` – případy 5.3,
- `pairs.ts` – páry ve správném pořadí, oboustranné vazby, odznak „nejnižší TER“ při shodě u všech shodných,
- `format.ts` – české formáty včetně `0,0945 %`,
- Zod schéma leadu a dat, `check-data` (chybějící zdroj → chyba, jednostranný pár → chyba).

**E2E (Playwright, iPhone 13 + Pixel 7), `/api/lead` mockované přes `page.route`:**
- hero H1 + otázka + tlačítka ANO/NE viditelné bez scrollu na 360 × 640,
- klik ANO → odhalení s 8 kartami, klik NE → jiný první řádek, stejné karty,
- pohyb jezdce → změna čísel na kartách i v souhrnné větě,
- sticky CTA se objeví po odhalení a zmizí u formuláře,
- neplatný e-mail → chyba u pole, nic se neodešle,
- API 200 → stav úspěchu, odkaz na PDF vrací 200,
- API 500 → chybová hláška, e-mail zůstává, „Zkusit znovu“ funguje,
- `?utm_content=ad_a` / `ad_b` → správný H1; částka v hero B = částka na kartách při výchozích jezdcích.

`npm run test` musí projít před commitem do `main`.

### 13.2 Ruční (výsledky do README)

- Skutečný telefon (iOS Safari + Android Chrome): odkaz z reklamy → lead.
- Lead v Neonu s UTM, variantou a odpovědí kvízu (screenshot).
- Eventy v Umami (realtime) včetně funnelu.
- PDF s diakritikou.
- Lighthouse na produkční URL.
- Test 5 sekund: ukázat hero 3 lidem, zeptat se, co stránka nabízí (výsledek do README).

---

## 🚀 14. PLÁN IMPLEMENTACE

| # | Krok | Priorita | Commit |
|---|---|---|---|
| 1 | Init Next.js + TS, struktura `src/`, `tokens.css` (dočasné hodnoty), `globals.css`, fonty, `.env.example` | MUST | `chore: init projektu` |
| 2 | `data/schema.ts`, `etf.json` (8 fondů, ověřené State Street hodnoty, zbytek `null`), `assumptions.json`, `check-data` | MUST | `feat(data): schéma a validace dat` |
| 3 | `projection.ts`, `pairs.ts`, `format.ts` + unit testy | MUST | `feat(reality-check): výpočet poplatků + testy` |
| 4 | `content/copy.ts` a `hero-variants.ts` z `brief.md` (chybějící texty jako `[[CHYBÍ TEXT]]`) | MUST | `feat(content): texty stránky` |
| 5 | Hero + otázka + odhalení (páry, karty, jezdce) | MUST | po komponentách |
| 6 | `db/schema.sql`, `save-lead.ts`, `/api/lead`, `lead-capture` + stavy chyb | MUST | `feat(lead): formulář a uložení do Neonu` |
| 7 | `lead-success`, `use-lead-status`, PDF (nebo záložní plán 7.5) | MUST | `feat(lead): tahák po odeslání` |
| 8 | Umami + `rc_` eventy | MUST | `feat(analytics): měření cesty` |
| 9 | Varianty hero A/B, middleware/proxy, `ads/` | MUST | `feat(ads): varianty pro reklamy` |
| 10 | Nasazení na Vercel, Neon integrace, smoke test na telefonu | MUST | `chore(deploy): …` |
| 11 | Doplnění ověřených dat (Tom) | MUST | `data: ověřené TER/ISIN k DD. MM. 2026` |
| 12 | Sticky CTA, FAQ, `/metodika`, zásady ochrany údajů | SHOULD | |
| 13 | E2E testy, Lighthouse ladění | SHOULD | |
| 14 | E-mail přes Resend (jen s doménou) | COULD | |

Po každé relaci: `/export` do `ai-log/AAAA-MM-DD-tema.md`.

---

## ✅ 15. DEFINITION OF DONE

- [ ] Produkční URL se otevře na mobilu i desktopu.
- [ ] Hero A i B podle `utm_content`; hero + otázka above the fold na 360 × 640.
- [ ] Odpovědi, páry a jezdce fungují; testy 5.3 procházejí; vzorec na `/metodika`.
- [ ] Všechna zobrazená fakta mají zdroj + datum; `check:data` v produkci bez `unverified`.
- [ ] Žádné číslo v textech, README ani `ads/`, které nevzniklo z `projection.ts` a ověřených dat.
- [ ] Formulář: neplatný e-mail, chyba serveru i úspěch ošetřené; lead je v Neonu.
- [ ] Po odeslání hned odkaz na PDF.
- [ ] Eventy funnelu v Umami; `rc_lead_success` až po 200.
- [ ] Žádné natvrdo zapsané barvy mimo `tokens.css`; jmenná pravidla 3.1 dodržena.
- [ ] Lighthouse mobil v README.
- [ ] `ads/` obě reklamy, `ai-log/` exporty, průběžná historie commitů.
- [ ] README uvádí známá omezení (měkký gating, e-mail bez domény, rate limit v paměti, Vercel Hobby, cold start Neonu, podhodnocení analytiky blokovači).

---

## ❓ 16. OTEVŘENÉ OTÁZKY PRO TOMA

1. Ověřené hodnoty: TER, ISIN a burza pro VOO, IVV, SPY, VUAA, CSPX + ISINy SPYM, SPYL, SPY5 (URL + datum).
2. Fondy pro tahák (`guide-only`): celý US trh, World, EM, celý svět.
3. Paleta (hex) a 2 fonty s latin-ext pro `tokens.css`.
4. Schválení reklamy B (a dvojice fondů pro částku v hero B).
5. Vlastní doména? (rozhoduje o e-mailu přes Resend.)
6. Účty: GitHub, Vercel, Neon, Umami Cloud – založit a doplnit env.
7. Kdo je uveden jako provozovatel (patička, zásady ochrany údajů)?
