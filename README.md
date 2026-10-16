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

## A/B HYPOTÉZY (SEŘAZENÉ PODLE DOPADU: ZMĚNA, ÚČINEK, METRIKA)
## A/B testování
> Všechny tři testy jsou navržené, ale zatím nebyly spuštěny. Uvedené hodnoty
> jsou **odhady** vycházející z běžných výsledků lead-gen stránek, nikoli
> z měření na reálných návštěvnících.
### Pořadí hypotéz
Hypotézy jsou seřazené podle očekávaného nárůstu počtu kontaktů. Rozhoduje
velikost změny v rozhodování návštěvníka, ne to, kolik lidí danou část stránky
uvidí: každý kontakt projde formulářem, takže relativní zlepšení posledního
kroku se celé promítne do výsledku.
| Pořadí | Hypotéza | Očekávaný nárůst kontaktů | Proč toto pořadí |
|---|---|---|---|
| 1 | Konkrétní čísla v hero sekci | +10–15 % | Mění vnímanou hodnotu stránky v prvních sekundách, kdy návštěvník z reklamy rozhoduje, jestli zůstane. Nejrychleji dosáhne potřebného vzorku. |
| 2 | Osobní závěr nad kalkulačkou | +5–10 % | Zpřehlední přínos pro návštěvníky, kteří už jsou zapojení, ale nabídku samotnou nemění. |
| 3 | Text odesílacího tlačítka | +5–10 %, spíš spodní hranice | Mění jen formulaci posledního kroku. Testy tohoto typu dávají obvykle nejmenší efekty. |
### Společná pravidla pro všechny testy
- Návštěvníci jsou náhodně rozděleni 50/50, varianta se uloží do cookie,
  aby se při návratu neměnila.
- Ke všem měřeným událostem se přidává parametr `variant` (A/B).
- Testy běží postupně v pořadí 1 → 2 → 3, aby se jejich účinky nemíchaly.
  Vítězná varianta se vždy nasadí jako nová kontrola pro další test.
- Výsledky vyhodnocujeme i zvlášť podle verze reklamy, ze které návštěvník přišel.
- Varianta B vyhrává, pokud statisticky významně (p < 0,05) zvýší primární
  metriku a nezhorší hlídací metriku. Velikosti vzorků jsou spočítané pro
  hladinu významnosti 5 % a sílu testu 80 %.
---
### Hypotéza 1: Konkrétní čísla v hero sekci
**Změna**
Současná hero sekce popisuje rozdíl v poplatcích obecně. Varianta B ho ukazuje
konkrétními čísly. Kvízová mechanika (otázka s odpověďmi ANO / NE, správně je NE)
zůstává stejná, design ani zbytek stránky se nemění. Testuje se pouze text.
| Prvek | A – kontrola (současná) | B – varianta s čísly |
|---|---|---|
| Nadpis | NENÍ ETF JAKO ETF | STEJNÝ INDEX. AŽ 5× VYŠŠÍ POPLATEK. |
| Podtext | VOO, IVV, SPYM a SPY jsou populární americká ETF. Všechna sledují stejný index S&P 500. Liší se poplatkem (TER). | SPYM stojí 0,02 % ročně, SPY 0,0945 %. Obě sledují stejný index S&P 500. |
| Otázka | Můžete si je koupit v Česku? | Můžete si ten nejlevnější koupit v Česku? |
| Odpovědi | ANO (špatně) / NE | ANO (špatně) / NE |
Čísla odpovídají TER fondů SPYM (0,02 %) a SPY (0,0945 %), oba sledují index
S&P 500. Poměr 0,0945 / 0,02 = 4,7, proto „až 5×“. Zdroj a datum ověření
jsou uvedeny v sekci Data a zdroje.
**Očekávaný účinek (odhad)**
- Kliknutí na odpověď v hero sekci: +15–25 % relativně
- Odeslání formuláře: +10–15 % relativně
**Proč by změna měla fungovat**
- **Konkrétnost:** číslo působí jako ověřitelný fakt, obecné tvrzení jako reklama.
- **Hodnota na první pohled:** návštěvník z mobilu během několika sekund pochopí,
  že stejný index lze mít výrazně levněji a že mu stránka ukáže, jak na to.
- **Silnější motivace odpovědět:** ve variantě A návštěvník ví, že se fondy liší,
  ale neví o kolik. Ve variantě B vidí, že nejlevnější fond je téměř 5× levnější,
  takže otázka „můžu si ho koupit?“ je pro něj osobně důležitá.
- **Averze ke ztrátě:** vyšší poplatek je srozumitelná ztráta, kterou chce
  investor snížit.
- **Návaznost na reklamu:** nadpis opakuje slib reklamy zaměřené na poplatky.
**Měřítko úspěchu**
| Typ | Metrika | Výpočet |
|---|---|---|
| Primární | Konverzní poměr | úspěšná odeslání formuláře / návštěvy varianty |
| Sekundární | Zapojení v hero | kliknutí ANO nebo NE / návštěvy varianty |
| Hlídací | Odchod bez interakce | návštěvy bez jakékoli události / návštěvy varianty |
Pokud varianta B zvýší pouze kliknutí v hero, ale ne odeslané formuláře,
přitahuje zvědavce místo relevantních zájemců a za úspěch se nepovažuje.
**Velikost vzorku**
- Sekundární metrika: ~1 600 návštěv na variantu (zapojení 50 % → 55 %)
- Primární metrika: ~10 000 návštěv na variantu (konverze 4 % → 4,8 %)
---
### Hypotéza 2: Osobní závěr nad výsledky kalkulačky
**Změna**
Varianta B přidá nad karty fondů jeden zvýrazněný řádek, který shrne výsledek
pro fondy dostupné v ČR a přepočítává se při změně parametrů kalkulačky.
Karty, kalkulačka, data i výpočet zůstávají stejné.
| Prvek | A – kontrola (současná) | B – varianta se závěrem |
|---|---|---|
| Nad kartami | nic, návštěvník porovnává 7 karet sám | „Výběrem nejlevnějšího evropského fondu ušetříte až 6 048 Kč.“ |
| Pod řádkem | – | „Při 3 000 Kč měsíčně, 20 letech a modelovém výnosu 6 %.“ |
| Karty fondů | 7 karet s částkou „přijdete o … Kč“ | beze změny |
| Kalkulačka | výnos, doba, měsíční vklad | beze změny |
Částka = poplatky u nejdražšího evropského dvojčete (VUAA / SXR8, TER 0,07 %)
minus poplatky u nejlevnějšího (SPYL, TER 0,03 %): 10 605 − 4 557 = 6 048 Kč.
Jde o modelový výpočet se stejnými předpoklady jako kalkulačka (měsíční úročení,
TER odečten od výnosu, bez poplatků brokera, směny měn a daní).
**Očekávaný účinek (odhad)**
- Interakce s kalkulačkou (změna alespoň jednoho parametru): +20–30 % relativně
- Zahájení vyplňování formuláře: +10–20 % relativně
- Odeslání formuláře: +5–10 % relativně
**Proč by změna měla fungovat**
- **Méně práce pro návštěvníka:** na mobilu je porovnávání 7 karet náročné.
  Jedna věta mu dá závěr okamžitě.
- **Relevance:** americká ETF v ČR obvykle nekoupí, takže pro něj je podstatný
  rozdíl mezi evropskými fondy. Ten varianta A nikde přímo neuvádí.
- **Osobní číslo:** částka se mění podle jeho vlastního vkladu a doby,
  což motivuje vyzkoušet kalkulačku.
- **Úspora místo ztráty:** karty mluví o tom, o kolik přijde. Závěr ukazuje,
  co může získat vlastním rozhodnutím, a tím přirozeně navazuje na nabídku PDF.
**Měřítko úspěchu**
| Typ | Metrika | Výpočet |
|---|---|---|
| Primární | Konverzní poměr | úspěšná odeslání / návštěvy, které zobrazily kalkulačku |
| Sekundární | Interakce s kalkulačkou | návštěvy se změnou parametru / návštěvy, které zobrazily kalkulačku |
| Sekundární | Zahájení formuláře | zahájená vyplňování / návštěvy, které zobrazily kalkulačku |
| Hlídací | Odchod z kalkulačky | odchody bez další akce po zobrazení kalkulačky / návštěvy, které ji zobrazily |
Jmenovatelem jsou návštěvy, které kalkulačku skutečně zobrazily, aby výsledek
neovlivnilo chování v hero sekci.
**Velikost vzorku**
- Sekundární metrika: ~620 návštěv na variantu (interakce 30 % → 37,5 %)
- Primární metrika: při nárůstu kolem 7 % je potřeba řádově statisíce návštěv,
  což je při běžném rozpočtu kampaně nereálné. Rozhodujeme proto podle
  sekundárních metrik a primární metrika slouží jako kontrola, že se nezhoršila.
---
### Hypotéza 3: Text odesílacího tlačítka formuláře
**Změna**
Testujeme pouze text odesílacího tlačítka. Pole formuláře, nadpis, popis nabídky,
text pod tlačítkem i design zůstávají stejné. Po odeslání dostane návštěvník
v obou variantách stejné PDF „Z amerického videa do českého portfolia“ (4–5 stran).
| Prvek | A – popis akce | B – přínos v první osobě |
|---|---|---|
| Text tlačítka | Poslat PDF na e-mail | Chci evropská dvojčata |
| Co komunikuje | co se stane po kliknutí | co tím návštěvník získá |
| Text pod tlačítkem | PDF, 5 stran. Bez spamu, odhlásíte se jedním kliknutím. | beze změny |
**Očekávaný účinek (odhad)**
- Odeslání formuláře u návštěv, které formulář zobrazily: +5–10 % relativně ve prospěch B
Dopad je nejnižší ze tří hypotéz: tlačítko mění jen formulaci posledního
kroku, ne vnímanou hodnotu nabídky.
**Proč by změna měla fungovat**
- **Přínos místo úkonu:** varianta A popisuje akci (poslat PDF), varianta B
  pojmenovává, co návštěvník chce – fondy, které si v ČR skutečně koupí.
- **Návaznost na kvíz:** pojem „evropské dvojče“ zná z odhalení po odpovědi
  v hero sekci. Tlačítko tak dokončuje otázku, kterou kvíz otevřel.
- **První osoba:** text „Chci…“ návštěvník čte jako vlastní rozhodnutí,
  ne jako pokyn od stránky.
**Proč může vyhrát A (důvod testovat)**
Varianta A přesně říká, co se stane, a tím snižuje nejistotu. Pro opatrného
drobného investora, který zadává e-mail finanční stránce, může být jasnost
(„dostanu PDF, nic víc“) důležitější než pojmenovaný přínos.
**Měřítko úspěchu**
| Typ | Metrika | Výpočet |
|---|---|---|
| Primární | Konverze formuláře | úspěšná odeslání / návštěvy, které zobrazily formulář |
| Sekundární | Dokončení formuláře | pokusy o odeslání / zahájená vyplňování |
| Hlídací | Kvalita kontaktu | platné, doručené e-maily / úspěšná odeslání |
Hlídací metrika ověřuje, že varianta nepřivádí víc nekvalitních kontaktů
(překlepy, falešné adresy).
**Velikost vzorku**
- ~3 000 zobrazení formuláře na variantu (konverze formuláře 20 % → 23 %)
---
### Měřené události
| Událost | Kdy se odešle | Použito v testu |
|---|---|---|
| `page_view` | načtení stránky (včetně UTM parametrů reklamy) | 1, 2, 3 |
| `quiz_answer` | kliknutí ANO / NE v hero sekci | 1 |
| `calculator_view` | kalkulačka se zobrazí na obrazovce | 2 |
| `calculator_change` | změna parametru kalkulačky | 2 |
| `form_view` | formulář se zobrazí na obrazovce | 3 |
| `form_start` | první zápis do pole formuláře | 2, 3 |
| `form_submit_attempt` | kliknutí na odesílací tlačítko | 3 |
| `form_submit_success` | server potvrdí uložení kontaktu | 1, 2, 3 |
