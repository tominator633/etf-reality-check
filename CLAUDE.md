# Projekt: ETF Reality Check (zadání B, Clientelo)

Konverzní landing page pro českého drobného investora z mobilní reklamy: kvíz s jedinou otázkou ukáže, že americká ETF z NYSE obvykle nekoupí, jaká jsou jejich evropská (UCITS) dvojčata a kolik ho stojí poplatky. Za e-mail dostane PDF tahák.

## Čti v tomto pořadí
1. `brief.md` – CO a PROČ (cílovka, texty, pořadí sekcí, reklamy, rozsah). **Při rozporu platí brief.**
2. `docs/05-technicka-implementace.md` – JAK (stack, struktura, data, výpočet, API, eventy, testy, plán).
3. `docs/decisions.md` – rozhodnutí, která už padla. Nová rozhodnutí sem připisuj (datum, co, proč).

Obsah projektu se průběžně mění. Když Tom změní zadání, uprav i `brief.md` a tech-spec (nejen kód a `decisions.md`), ať dokumenty odpovídají stavu.

## Stack
Next.js App Router + TS, CSS Modules + `src/shared/styles/tokens.css`, písma přes `next/font` (`src/shared/lib/fonts.ts`), animace `motion` (jen klientské interakce, `src/shared/lib/motion.tsx`), Zod, Neon (`@neondatabase/serverless`, čisté SQL, bez ORM), `server-only`, Route Handler `/api/lead`, Umami, `@react-pdf/renderer`, Vitest, Playwright, Vercel.
**Nepoužívat:** Tailwind, UI knihovny, ORM, Zustand/Redux, knihovny pro grafy, ikony a slidery. Animace jen přes `motion` (Tom 16. 10.): žádné animace obsahu vykresleného serverem (LCP), jen opacity/transform (CLS), respektovat `prefers-reduced-motion`, nic důležitého nesmí čekat na dokončení animace.

## Tvrdá pravidla
- **Finanční data nikdy z paměti.** TER, ISIN, burzy, váhy indexů jen z `data/` se zdrojem (`sourceUrl` + `sourceLabel`) a datem. Neznámé = `null` bez zdroje. TER v datech v procentech (`0.03` = 0,03 %).
- **Žádná ručně psaná čísla.** Částky v Kč počítá `projection.ts`. Čísla z mockupů a poznámek nepřebírej.
- **Žádné doporučení.** Nikdy „doporučujeme“, „kupte“, „ten si koupíte“. Jen fakta („nejnižší TER“).
- **Model ≠ fakt.** Výpočty označené jako modelové, fakta se zdrojem a datem.
- Stav úspěchu a `rc_lead_success` jen po potvrzeném uložení leadu.
- Věta „pošleme vám ho i e-mailem“ jen při `EMAIL_ENABLED=true`.
- Žádné živé API pro data, žádný lorem ipsum. Chybějící text = `[[CHYBÍ TEXT: …]]` a nahlas ho.
- Styly jen přes `var(--…)`, mobile-first (360 px). Hero + otázka above the fold na 360 × 640.
- SQL jen přes tagged template.
- UI česky, vykání, formát čísel přes `shared/lib/format.ts`.

## Konvence
- kebab-case soubory a složky; komponenta = složka s `<nazev>.tsx` + `<nazev>.module.css`.
- Feature neimportuje z jiné feature (jen `shared/`, `data/`, `content/` a veřejné API přes `index.ts`).
- Serverový kód ve `services/` s `import "server-only"`. Unit testy vedle kódu.
- Žádné prázdné složky a nic „na později“.

## Git
- Malý commit po každém kroku plánu (tech-spec kap. 14), Conventional Commits česky: `feat(lead): …`, `fix: …`, `data: …`, `docs: …`.
- `npm run test` musí projít před commitem.
- Nic tajného do repa (`.env*` v `.gitignore`, kromě `.env.example`).

## Příkazy
`npm run dev | build | test | check:data | build:ads` (prebuild; `NODE_ENV=production` = přísný režim). Zatím nejsou: `test:e2e`, `build:pdf` (přibudou s Playwrightem a PDF). Tabulka `leads`: `db/schema.sql` jednorázově v Neon SQL Editoru (`db:setup` skript záměrně není – viz `decisions.md`).

## Když si nejsi jistý
Rozhodni rozumně, zapiš do `docs/decisions.md` jednou větou (co, proč) a pokračuj. U finančních dat a právních tvrzení (KID, daně) nerozhoduj, nech `null` / placeholder a nahlas to.
