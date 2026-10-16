# ETF Reality Check

Landing page pro českého drobného investora: jedna otázka ukáže, že americká ETF z NYSE v Česku obvykle nekoupí, jaká mají evropská (UCITS) dvojčata a kolik ho stojí poplatky. Za e-mail dostane PDF tahák.

**Produkce:** https://etf-reality-check.vercel.app

## Technické řešení

**Stack:** Next.js 16 (App Router, TypeScript), CSS Modules + design tokeny, Zod, Neon Postgres (čisté SQL bez ORM), Umami, Vitest, Vercel.

**Architektura**
- `src/features/` – `etf-reality-check` (kvíz, páry, výpočet), `lead` (formulář, API), `analytics` (eventy). Features se navzájem nevolají, komunikují přes `sessionStorage`. Stránku skládá `src/app/`.
- `data/etf.json` – jediný zdroj finančních dat. Každá hodnota má zdroj (URL, popisek) a datum. `content/` obsahuje všechny texty.
- Hero a data se renderují na serveru (staticky), na klienta jde jen interaktivní část a jen data, která UI zobrazuje.

**Data a výpočet**
- `check-data` běží před každým buildem. Kontroluje schéma, zdroj u každé hodnoty, oboustranné páry, kontrolní číslici ISIN a jednotky TER. V produkci build bez ověřených dat selže.
- `projection.ts`: měsíční vklady, efektivní měsíční sazba `(1 + r)^(1/12) − 1`, ztráta na poplatcích = `FV(g) − FV(g − TER)`. Čísla na stránce vznikají jen tady, ručně psaná v textech hlídá test.

**Formulář a ukládání leadů** (`POST /api/lead`)
- Jedno Zod schéma na klientu i serveru, vstup se před validací sanitizuje.
- Server přijímá jen JSON do 4 kB. Má rate limit na IP, honeypot a ochranu proti příliš rychlému odeslání. Duplicitní e-mail vrací stejnou odpověď jako nový.
- Úspěch se ukáže jen po potvrzeném uložení. SQL jde jen přes tagged template, tabulka má navíc CHECK omezení (`db/schema.sql`).

**Měření:** Umami (bez cookies), eventy s prefixem `rc_`. Funnel: zobrazení → odpověď → formulář → odeslání → lead.

**Bezpečnost a přístupnost**
- Hlavičky: CSP (povoluje jen vlastní doménu a Umami), `nosniff`, `X-Frame-Options`, `Permissions-Policy`.
- Kontrast barev WCAG AA hlídá test nad `tokens.css`.
- Mobile-first, ovládání klávesnicí, `prefers-reduced-motion`.

**Stav po reloadu:** odpověď, jezdce, otevřený formulář a pozice na stránce se obnoví, odeslání si stránka pamatuje.

**Spuštění**
```bash
npm install
```
```bash
npm run dev
```
Env podle `.env.example` (`DATABASE_URL`, Umami, `NEXT_PUBLIC_SITE_URL`). Tabulka se zakládá jednorázově: `db/schema.sql` v Neon SQL Editoru. Testy spustí `npm run test`, kontrolu dat `npm run check:data`.

**Známá omezení**
- Rate limit je jen v paměti jedné instance.
- PDF leží veřejně v `public/` (měkké omezení přístupu).
- E-mail je vypnutý, dokud není ověřená doména.
- Vercel Hobby je pro nekomerční provoz.
- Neon se po nečinnosti probouzí (první odeslání může trvat déle).
- Blokátory reklam skryjí část eventů. Zdrojem pravdy o leadech je tabulka `leads`.
