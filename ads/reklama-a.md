# Reklama A – „Není ETF jako ETF“

Kreativa: [`reklama-a.png`](reklama-a.png) (zdroj [`reklama-a.html`](reklama-a.html), generuje `npm run build:ads` z `data/etf.json` a `src/shared/styles/tokens.css`).

| | |
|---|---|
| Platforma a formát | Meta (Instagram, Facebook), feed 4 : 5, 1080 × 1350 px, PNG |
| Motivace | Zvědavost: jde to vůbec koupit? (brief kap. 9) |
| Tlačítko Meta | Zjistit více |
| URL | `https://etf-reality-check.vercel.app/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a` |
| Hero na stránce | Varianta A: „NENÍ ETF JAKO ETF“ + „VOO, IVV, SPYM a SPY jsou populární americká ETF. Všechny sledují stejný index S&P 500. Liší se poplatkem (TER).“ (bez UTM se zobrazí také A) |

## Texty

- **Nadpis Meta:** Není ETF jako ETF
- **Hlavní text Meta:** VOO, IVV, SPYM a SPY sledují stejný index S&P 500. Liší se poplatkem. Víte, které z nich si jako drobný investor v Česku koupíte? Otestujte se jednou otázkou a uvidíte jejich evropská dvojčata i to, kolik vás poplatky stojí.
- **Text v kreativě:** NENÍ ETF JAKO ETF · Stejný index S&P 500. Jiný ticker. Jiný poplatek. · Které si koupíte v Česku? · OTESTUJTE SE JEDNOU OTÁZKOU →

## Vizuál

Design landing page (Tom 16. 10. 2026; původní tmavý návrh z plánování nahrazen): bílé pozadí, nadpis „NENÍ etf / jako ETF“ ve stejných barvách a poměru velikostí jako hero, „dvojčata vlajek“ (USA vzadu, EU vpředu) jako na stránce, 4 karty fondů s 1px rámečkem a světlými pozadími dvojic, tickery v tmavé verzi pozadí své dvojice, otázka jako samotný text (bez karty) a žluté CTA. Písma Outfit (nadpisy) a Plus Jakarta Sans (text). V kreativě nejsou částky v Kč.

## Odkud je každé tvrzení

| Tvrzení | Zdroj | Kde ho doloží stránka |
|---|---|---|
| Tickery VOO, IVV, SPYM, SPY | `data/etf.json` → `listing.ticker` | malé karty nad otázkou |
| Všechny sledují S&P 500 | `data/etf.json` → `index` (generátor skončí chybou, pokud se index liší) | podnadpis hero, karty |
| TER u každého fondu | `data/etf.json` → `ter` (prospekt VOO, stránky produktů IVV, SPYM, SPY; datum ověření v kreativě z `verifiedAt`) | karty se zdrojem a datem |
| „Které si koupíte v Česku?“ | otázka, ne tvrzení; odpověď (obvykle žádný) dokládá odhalení se zdrojem ke KID | odhalení po odpovědi |
| „Jednou otázkou“ | kvíz má jedinou otázku (`docs/decisions.md`, 15. 10. 2026) | kvíz |
