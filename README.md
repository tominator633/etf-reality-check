# ETF Reality Check

Landing page pro českého drobného investora: jedna otázka ukáže, že americká ETF z NYSE v Česku obvykle nekoupí, jaká mají evropská (UCITS) dvojčata a kolik ho stojí poplatky. Za e-mail dostane PDF tahák.

**Produkce:** https://etf-reality-check.vercel.app

**Analytika:** [veřejný přehled v Umami](https://cloud.umami.is/share/zzy7GghEW0w8JHsg) – návštěvy produkční stránky, zdroje provozu (UTM z reklam) a události `rc_` (odpověď v kvízu, jezdce, formulář, odeslání). Jen pro čtení, Umami nepoužívá cookies. Návštěvy s `utm_source=claude_test` jsou testovací.

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

**Měření:** Umami (bez cookies, [veřejný přehled](https://cloud.umami.is/share/zzy7GghEW0w8JHsg)), eventy s prefixem `rc_`. Funnel: zobrazení → odpověď → formulář → odeslání → lead.

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

## A/B testování

Hypotézy seřazené podle dopadu: změna, účinek, metrika.

> Všechny tři testy jsou navržené, ale zatím nebyly spuštěny. Uvedené hodnoty
> jsou **odhady** vycházející z běžných výsledků lead-gen stránek, nikoli
> z měření na reálných návštěvnících.

**Stav v kódu:** všechny eventy nesou parametr `variant` (z `data-variant` na stránce) a texty hero mají varianty A/B v `content/hero-variants.ts`. Zatím se ale servíruje jen A: přepínání podle `utm_content` je krok 9. Varianty B pro hypotézy níže ani náhodné rozdělení návštěvníků ještě nejsou implementované.

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

- **Rozdělení:** dnes určuje variantu reklama (`utm_content=ad_a` / `ad_b`), takže varianty dostávají jiné publikum. Pro čisté A/B je potřeba náhodné rozdělení 50/50 s variantou uloženou v prohlížeči, aby se při návratu neměnila. Uložení v cookie nebo `localStorage` pro A/B test nejspíš podléhá souhlasu podle ePrivacy (stránka teď cookies nepoužívá), proto je to otevřený bod.
- Ke všem měřeným událostem se přidává parametr `variant` (A/B).
- Testy běží postupně v pořadí 1 → 2 → 3, aby se jejich účinky nemíchaly.
  Vítězná varianta se vždy nasadí jako nová kontrola pro další test.
- Výsledky vyhodnocujeme i zvlášť podle verze reklamy, ze které návštěvník přišel (`utm_content`).
- Varianta B vyhrává, pokud statisticky významně (p < 0,05) zvýší primární
  metriku a nezhorší hlídací metriku. Velikosti vzorků jsou spočítané pro
  hladinu významnosti 5 % a sílu testu 80 %.

---

### Hypotéza 1: Konkrétní čísla v hero sekci

**Změna**

Současná hero sekce popisuje rozdíl v poplatcích obecně. Varianta B ho ukazuje
konkrétními čísly. Kvízová mechanika (otázka s odpověďmi ANO / NE, správně je NE)
zůstává stejná, design ani zbytek stránky se nemění. Testuje se pouze text.
Varianta B je nový návrh, ne stávající hero B pro reklamu B („Stejný S&P 500, rozdíl X Kč“).

| Prvek | A – kontrola (současná) | B – varianta s čísly |
|---|---|---|
| Nadpis | NENÍ ETF JAKO ETF | STEJNÝ INDEX. TÉMĚŘ 5× VYŠŠÍ POPLATEK. |
| Podtext | VOO, IVV, SPYM a SPY jsou populární americká ETF / všechny sledují stejný index S&P 500 / Liší se poplatkem (TER) | SPYM stojí 0,02 % ročně, SPY 0,0945 %. Obě sledují stejný index S&P 500. |
| Otázka | Můžete si je koupit v Česku? | Můžete si ten nejlevnější koupit v Česku? |
| Odpovědi | ANO (špatně) / NE | ANO (špatně) / NE |

Čísla odpovídají TER fondů SPYM (0,02 %) a SPY (0,0945 %), oba sledují index
S&P 500. Poměr 0,0945 / 0,02 = 4,7, proto „téměř 5×“. Zdroj a datum ověření
jsou u každé hodnoty v `data/etf.json` a na kartách fondů na stránce.

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
| Primární | Konverzní poměr | `rc_lead_success` / návštěvy varianty |
| Sekundární | Zapojení v hero | `rc_answer` / návštěvy varianty |
| Hlídací | Odchod bez interakce | návštěvy bez `rc_answer`, `rc_slider_change` a `rc_cta_click` / návštěvy varianty (přibližně – Umami nemá událost „jakákoli interakce“) |

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
minus poplatky u nejlevnějšího (SPYL, TER 0,03 %): 10 605 − 4 557 = 6 048 Kč
(výstup `projection.ts` při výchozích jezdcích).
Jde o modelový výpočet se stejnými předpoklady jako kalkulačka (měsíční úročení,
TER odečten od výnosu, bez poplatků brokera, směny měn a daní). Ve variantě B
by se částka i řádek pod ní generovaly z `projection.ts` a jezdců, nikdy ručně.

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
| Primární | Konverzní poměr | `rc_lead_success` / návštěvy, které zobrazily kalkulačku |
| Sekundární | Interakce s kalkulačkou | návštěvy s `rc_slider_change` / návštěvy, které zobrazily kalkulačku |
| Sekundární | Zahájení formuláře | `rc_form_focus` / návštěvy, které zobrazily kalkulačku |
| Hlídací | Odchod z kalkulačky | návštěvy bez `rc_slider_change` i `rc_cta_click` po zobrazení kalkulačky / návštěvy, které ji zobrazily |

Jmenovatelem jsou návštěvy, které kalkulačku skutečně zobrazily, aby výsledek
neovlivnilo chování v hero sekci. Událost „kalkulačka zobrazena“ zatím chybí
(viz Měřené události) – kalkulačka se ukáže až po odpovědi, takže do jejího
přidání lze jako jmenovatel použít `rc_answer`.

**Velikost vzorku**

- Sekundární metrika: ~620 návštěv na variantu (interakce 30 % → 37,5 %)
- Primární metrika: při nárůstu kolem 7 % (4 % → 4,28 %) je potřeba přibližně
  80 000 návštěv na variantu, což je při běžném rozpočtu kampaně nereálné.
  Rozhodujeme proto podle sekundárních metrik a primární metrika slouží jako
  kontrola, že se nezhoršila.

---

### Hypotéza 3: Text odesílacího tlačítka formuláře

**Změna**

Testujeme pouze text odesílacího tlačítka uvnitř otevřeného formuláře. Formulář je
dvoukrokový: tlačítko „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ ho otevře, pak se zobrazí
pole e-mail a odesílací tlačítko. Úvodní tlačítko, pole formuláře, text nabídky,
text pod tlačítkem i design zůstávají stejné. Po odeslání dostane návštěvník
v obou variantách stejné PDF „Z amerického videa do českého portfolia“
(4–5 stran; připravuje se, krok 7). E-mail je zatím vypnutý, PDF se po odeslání
stáhne přímo na stránce.

| Prvek | A – popis akce (současná) | B – přínos v první osobě |
|---|---|---|
| Text tlačítka | Odeslat PDF | Chci evropská dvojčata |
| Co komunikuje | co se stane po kliknutí | co tím návštěvník získá |
| Text pod tlačítkem | Tahák stáhnete hned po odeslání. Žádný spam, odhlásit se můžete jedním kliknutím. | beze změny |

**Očekávaný účinek (odhad)**

- Odeslání formuláře u návštěv, které formulář otevřely: +5–10 % relativně ve prospěch B

Dopad je nejnižší ze tří hypotéz: tlačítko mění jen formulaci posledního
kroku, ne vnímanou hodnotu nabídky.

**Proč by změna měla fungovat**

- **Přínos místo úkonu:** varianta A popisuje akci (odeslat PDF), varianta B
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
| Primární | Konverze formuláře | `rc_lead_success` / `rc_cta_click` (formulář s tlačítkem je vidět až po kliknutí na CTA) |
| Sekundární | Dokončení formuláře | `rc_form_submit` / `rc_form_focus` |
| Hlídací | Kvalita kontaktu | platné e-maily / úspěšná odeslání – zatím ruční kontrola tabulky `leads`; doručitelnost lze měřit až se zapnutým e-mailem (Resend) |

Hlídací metrika ověřuje, že varianta nepřivádí víc nekvalitních kontaktů
(překlepy, falešné adresy).

**Velikost vzorku**

- ~3 000 otevřených formulářů na variantu (konverze formuláře 20 % → 23 %)

---

### Měřené události

Události posílá Umami, všechny s parametrem `variant` (`src/features/analytics`).

| Událost | Kdy se odešle | Použito v testu |
|---|---|---|
| pageview (automaticky Umami) | načtení stránky (včetně UTM parametrů reklamy) | 1, 2, 3 |
| `rc_view` | kvíz z poloviny na obrazovce, 1× za relaci | – |
| `rc_answer` | kliknutí ANO / NE (parametr `answer`) | 1, 2 |
| `rc_slider_change` | první pohyb každého jezdce kalkulačky za relaci (parametr `slider`) | 2 |
| `rc_cta_click` | kliknutí na „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ (otevře formulář) | 1, 3 |
| `rc_form_view` | karta formuláře z poloviny na obrazovce po odpovědi, 1× za relaci | – |
| `rc_form_focus` | první fokus do pole e-mail | 2, 3 |
| `rc_form_submit` | každý pokus o odeslání (i neplatný e-mail) | 3 |
| `rc_lead_success` | server potvrdí uložení kontaktu | 1, 2, 3 |
| `rc_lead_error` | server nebo síť vrátí chybu (parametr `code`) | – |
| `rc_pdf_download` | stažení PDF | – |
| *chybí:* `rc_calculator_view` | kalkulačka z poloviny na obrazovce – potřeba pro jmenovatel v H2 | 2 |
