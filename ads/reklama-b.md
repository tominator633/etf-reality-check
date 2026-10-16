# Reklama B – „Otestujte se“

Kreativa: [`reklama-b.png`](reklama-b.png) (zdroj [`reklama-b.html`](reklama-b.html), generuje `npm run build:ads` z `data/etf.json` a `src/shared/styles/tokens.css`). Zadání: Tom, 16. 10. 2026.

| | |
|---|---|
| Platforma a formát | Meta (Instagram, Facebook), feed 4 : 5, 1080 × 1350 px, PNG |
| Úhel | výzva jednou otázkou – pro toho, kdo chce rychlou odpověď (A = srovnání čísel) |
| Tlačítko Meta | Zjistit více |
| URL | `https://etf-reality-check.vercel.app/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_b` |
| Hero na stránce | Zatím stejné jako u A (přepínání hero podle UTM není nasazené). Reklama navazuje na otázku kvízu a tlačítka ANO / NE hned pod hero. |

## Texty

- **Nadpis Meta:** Koupíte si VOO v Česku?
- **Hlavní text Meta** *(návrh Claude 16. 10., k revizi)*: VOO je populární americké ETF na index S&P 500. Koupíte si ho jako drobný investor v Česku? Odpovězte ANO, nebo NE a hned uvidíte, jak to je, jaké má evropské dvojče a kolik vás stojí poplatky.
- **Text v kreativě:** ETF REALITY CHECK · Koupíte si [karta VOO: S&P 500, TER {z dat}] v Česku? · ANO / NE · Odpověď vás možná překvapí. · OVĚŘTE SI ODPOVĚĎ → · TER podle dokumentů správců, ověřeno {datum z `verifiedAt`}. Nejde o investiční doporučení.

## Vizuál

Design landing page: bílé pozadí, velká otázka (Outfit; „Koupíte si“ petrolejově, „v Česku?“ fialově), mezi nimi místo slova „VOO“ karta VOO – stejná jako v reklamě A a na stránce (světle modré pozadí dvojice VOO↔VUAA, ticker v tmavé indigové, S&P 500, TER) ve stejných proporcích, jen zvětšená; vedle karty „dvojčata vlajek“ USA a EU jako v hero; pod otázkou dvě velká žlutá tlačítka ANO a NE s tmavým obrysem jako v kvízu přes celou šířku, pod tím háček a tmavé CTA (tmavé, aby se nepletlo s tlačítky odpovědí). V kreativě nejsou částky v Kč; TER VOO je z dat.

## Odkud je každé tvrzení

| Tvrzení | Zdroj | Kde ho doloží stránka |
|---|---|---|
| Karta VOO: ticker, index, TER | `data/etf.json` → `listing.ticker`, `index`, `ter` (prospekt VOO); barva dvojice podle `relatedFundIds` | malé karty nad otázkou, srovnání |
| VOO sleduje S&P 500 (hlavní text) | `data/etf.json` → `index` (prospekt VOO) | podnadpis hero, karty |
| „Koupíte si VOO v Česku?“ | otázka, ne tvrzení; odpověď dokládá odhalení se zdrojem ke KID | odhalení po odpovědi |
| „Odpověď vás možná překvapí.“ | záměrně bez tvrzení o ostatních. „Většina lidí odpoví špatně“ až s daty z `rc_answer` (Tom 16. 10.) | – |
| Evropské dvojče a poplatky (hlavní text) | `data/etf.json` (VUAA, TER), výpočet `projection.ts` | srovnání po odpovědi |
| Datum ověření v patičce | `data/etf.json` → `verifiedAt` | řádek se zdrojem TER pod malými kartami |
