# ETF Reality Check

Landing page pro českého drobného investora: jedna otázka ukáže, že americká ETF z NYSE v Česku obvykle nekoupí, jaká mají evropská (UCITS) dvojčata a kolik ho stojí poplatky. Za e-mail dostane PDF tahák.

**Produkce:** https://etf-reality-check.vercel.app

**Analytika:** [veřejný přehled v Umami](https://cloud.umami.is/share/zzy7GghEW0w8JHsg) – návštěvy produkční stránky, zdroje provozu (UTM z reklam) a události `rc_` (odpověď v kvízu, jezdce, formulář, odeslání). Jen pro čtení, Umami nepoužívá cookies. Návštěvy s `utm_source=claude_test` jsou testovací.

## Shrnutí

Stránka cílí na českého začínajícího investora, který slyšel o amerických ETF
(VOO, SPY) a neví, že je v EU obvykle nekoupí. Jedna otázka na první obrazovce
mu to ukáže, odhalení nabídne evropská dvojčata a kalkulačka spočítá, kolik ho
stojí poplatky. Teprve pak žádáme e-mail výměnou za PDF tahák.

**Připravenost na kampaň:** stránka a měření celé cesty (události funnelu v Umami)
jsou hotové a nasazené, obě reklamy jsou připravené (kreativy a texty). Před
spuštěním reklamy chybí PDF tahák, odesílání e-mailu a právní údaje v zásadách
zpracování (viz [Co chybí](#co-chybí)).
Očekávaná konverze: odhad 4 % (rozpětí 2–5 %).

## Struktura stránky a pořadí sekcí

Pořadí sleduje princip „nejdřív hodnota, pak žádost“: návštěvník musí dostat
užitečnou odpověď dřív, než po něm chceme e-mail.

| # | Sekce | Úkol | Proč právě tady |
|---|---|---|---|
| 1 | Hero „Není ETF jako ETF“ + malé karty 4 amerických fondů + kvíz ANO / NE | Zaujmout za 2–3 sekundy a navázat na reklamu | Opakuje slib obou reklam. Otázka je nejmenší možný první krok: jedno kliknutí místo čtení. Vejde se na první obrazovku 360 × 640. |
| 2 | Odhalení odpovědi | Dát první hodnotu: „obvykle je nekoupíte, ale mají evropská dvojčata“ | Odpověď přichází hned po kliknutí, se zdrojem (PRIIPs). Překvapení buduje důvěru a chuť pokračovat. |
| 3 | Páry fondů USA → EU + kalkulačka | Ukázat řešení a osobní dopad v korunách | Po „co nekoupím“ přirozeně následuje „co místo toho“. Jezdce mění obecnou informaci na číslo pro konkrétního člověka. |
| 4 | Nabídka PDF + tlačítko | Ukázat, co dalšího získá | Přichází v momentě, kdy návštěvník už má odpověď na jeden index a logicky se ptá „a co zbytek portfolia?“. |
| 5 | Formulář (jen e-mail) | Získat kontakt | Otevře se až po kliknutí na nabídku, takže ho vidí jen ten, kdo projevil zájem. Jedno pole. |
| 6 | Potvrzení po odeslání | Potvrdit, co se stane dál | Uzavírá cestu a říká, jak tahák dostane (v této verzi, že ho dokončujeme a bude ke stažení přímo na stránce). |

Pod tím pro ty, kdo chtějí víc: FAQ (TER, KID a UCITS, akumulační vs. distribuční, měnové riziko), Zdroje a metodika a patička.

## Okamžik žádosti o kontakt

O e-mail žádáme až **po odpovědi v kvízu a zobrazení párů fondů s kalkulačkou**,
ne na první obrazovce.

- **Hodnota je zřejmá předem:** v tu chvíli už návštěvník ví, že americká ETF
  obvykle nekoupí, zná jejich evropská dvojčata a vidí výpočet poplatků.
  Dostal skutečnou hodnotu zdarma, takže věří, že i PDF bude užitečné.
- **Nabídka navazuje na otevřenou otázku:** stránka řeší jen S&P 500, PDF
  odpovídá na „a co celé portfolio?“ (svět, rozvíjející se trhy, akumulační
  vs. distribuční, kontrolní seznam před nákupem).
- **Dvoukrokový formulář:** pole se ukáže až po kliknutí na „CHCI KOMPLETNÍ
  SROVNÁNÍ V PDF“. Kliknutí na tlačítko je menší závazek než vidět prázdné
  pole, a kdo klikne, formulář s vyšší pravděpodobností dokončí.
- **Jen jedno pole (e-mail):** jméno ani telefon nejsou potřeba k doručení
  taháku a každé pole navíc snižuje konverzi.

Rizikem je, že část lidí odejde po získání odpovědi, aniž by viděla nabídku.
Proto je to měřené (`rc_answer` → `rc_form_view`) a je to první místo,
kam se po spuštění podívat.

## Technické řešení

**Stack:** Next.js 16 (App Router, TypeScript), CSS Modules + design tokeny, `next/font` (Outfit, Plus Jakarta Sans), `motion` (animace interakcí), Zod, Neon Postgres (čisté SQL bez ORM), Umami, Vitest, Vercel.

**Animace bez zpomalení:** animuje se jen obsah, který vzniká po kliknutí (odhalení, karty, počítadlo částek, formulář). Nadpis ze serveru ne, aby se nezdrželo první vykreslení. Jen průhlednost a posun (CLS 0), `prefers-reduced-motion` je respektován a nic důležitého na animaci nečeká.

**Výkon (Lighthouse 13.5 přes PageSpeed Insights, produkce, 16. 10. 2026):**

| | Výkon | Přístupnost | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Mobil (Moto G Power, pomalé 4G) | 91 | 100 | 100 | 100 | 1,5 s | 3,3 s | 10 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0,4 s | 0,6 s | 10 ms | 0 |

Na mobilu tvoří většinu LCP zpoždění vykreslení textu (čekání na webové písmo); Lighthouse navrhuje ještě ubrat ~111 KiB nepoužitého JavaScriptu.

**Architektura**
- `src/features/` – `etf-reality-check` (kvíz, páry, výpočet), `lead` (formulář, API), `analytics` (eventy). Feature importuje jinou jen přes její veřejné `index.ts` (kvíz a formulář volají `analytics`), stav si kvíz a formulář předávají přes `sessionStorage`. Stránku skládá `src/app/`.
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
Env podle `.env.example` (`DATABASE_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL`, `NEXT_PUBLIC_SITE_URL`, `EMAIL_ENABLED`; `RESEND_API_KEY` a `EMAIL_FROM` až s e-mailem). Tabulka se zakládá jednorázově: `db/schema.sql` v Neon SQL Editoru. Testy spustí `npm run test` (Vitest, 357 testů: výpočet, data, texty, kontrast barev, API leadů, CSP), kontrolu dat `npm run check:data`, kreativy reklam `npm run build:ads`.

**Známá omezení**
- Rate limit je jen v paměti jedné instance.
- PDF tahák se v této verzi nevytváří, obsah je popsaný v sekci Co lead dostane za e-mail.
- E-mail je vypnutý, dokud není ověřená doména.
- Vercel Hobby je pro nekomerční provoz.
- Neon se po nečinnosti probouzí (první odeslání může trvat déle).
- Blokátory reklam skryjí část eventů. Zdrojem pravdy o leadech je tabulka `leads`.
- Přepínání hero podle reklamy (`utm_content`) není nasazené: obě reklamy vedou na hero A, `utm_content` je odliší jen v analytice.

## Výchozí scénář (modelový výpočet)

Při výchozím nastavení jezdců – 3 000 Kč měsíčně, 20 let, modelový výnos 6 % ročně před poplatky – vloží investor **720 000 Kč** a bez poplatků by měl modelově **1 360 316 Kč**. Kolik z toho uberou poplatky fondu (TER):

| Americký fond | TER | Přijdete o | Evropské dvojče | TER | Přijdete o |
|---|---|---|---|---|---|
| VOO | 0,03 % | 4 557 Kč | VUAA | 0,07 % | 10 605 Kč |
| IVV | 0,03 % | 4 557 Kč | SXR8 (CSPX) | 0,07 % | 10 605 Kč |
| SPYM | 0,02 % | 3 040 Kč | SPYL | 0,03 % | 4 557 Kč |
| SPY | 0,0945 % | 14 295 Kč | SPYL | 0,03 % | 4 557 Kč |

Čísla počítá `projection.ts` z `data/etf.json` (TER ověřené u správců k datu v datech) a hlídají je testy (`projection.test.ts`, přesnost na haléř podle tech-spec 5.1); 16. 10. 2026 je navíc ověřil nezávislý přepočet včetně simulace měsíc po měsíci. Jde o model: výnos je předpoklad, ne záruka; bez poplatků brokera, směny měn a daní.

## Design

Bílé pozadí, karty s 1px rámečkem, barevně odlišená klíčová slova (fakta indigo, ztráta červeně, nejnižší TER zeleně). Hero „NENÍ etf / jako ETF“ má každé slovo jinou barvou a asymetrické velikosti (rozdíl v poplatcích), vedle „dvojčata vlajek“ USA a EU (inline SVG). Každá dvojice fondů má vlastní světlé pozadí a ticker v jeho tmavé verzi; otázka kvízu je v navy kartě, nabídka PDF ve fialové. Na kartách proužek poplatku (podíl vůči nejdražšímu fondu), pod jezdci souhrn ve čtyřech řádcích. Vše přes tokeny v `src/shared/styles/tokens.css`; kontrast WCAG AA hlídá test. Hero a otázka se vejdou na první obrazovku 360 × 640.

## Reklamy

Dvě kreativy pro Meta (Instagram, Facebook), feed 4 : 5, 1080 × 1350, v designu stránky. Generuje je `npm run build:ads` (`scripts/build-ads.ts`) z `data/etf.json` a `tokens.css`, takže tickery, TER, datum ověření i barvy odpovídají stránce. U každé reklamy je v `ads/` popis: texty pro Meta, URL s UTM, vizuál a zdroj každého tvrzení.

| | [A – „Není ETF jako ETF“](ads/reklama-a.md) | [B – „Otestujte se“](ads/reklama-b.md) |
|---|---|---|
| Kreativa | [`ads/reklama-a.png`](ads/reklama-a.png) | [`ads/reklama-b.png`](ads/reklama-b.png) |
| Úhel | srovnání: 4 fondy na S&P 500, jiný poplatek | výzva: jedna otázka „Koupíte si VOO v Česku?“ s ANO / NE |
| Pro koho | kdo rád porovnává čísla | kdo chce rychlou odpověď |
| Navazuje na | nadpis a karty v hero | otázku a tlačítka ANO / NE kvízu |
| UTM | `utm_content=ad_a` | `utm_content=ad_b` |

„Většina lidí odpoví špatně“ v reklamě B není: bez dat z `rc_answer` by to bylo nepodložené, proto „Odpověď vás možná překvapí.“

## Co lead dostane za e-mail

Výměnou za e-mail dostane návštěvník tahák **„Z amerického videa do českého portfolia“** (PDF, 4–5 stran). První strana sama odpoví na hlavní otázku, další ji rozšíří na celé portfolio.

> **Stav:** v této verzi se PDF nevytváří (rozhodnutí v `docs/decisions.md`). Níže je jeho obsah a odkud se bere. Stránka po odeslání ukáže stav úspěchu. E-mail se zatím neposílá (`EMAIL_ENABLED=false`, chybí ověřená doména).

| Strana | Obsah | Proč tam je | Podklady v projektu |
|---|---|---|---|
| 1. Rychlá odpověď | Tři zjištění z kvízu ve třech větách: americká ETF nemají KID, každé má evropské dvojče na stejný index, poplatky se liší. Pod tím schéma „chci USA / vyspělý svět / rozvíjející se trhy → tyto evropské fondy“. | Kdo přečte jen jednu stranu, dostane slíbenou hodnotu. | Zjištění: ano (texty odhalení, `etf.json`). Schéma: chybí fondy mimo S&P 500. |
| 2. Překladový slovník NYSE → UCITS | Tabulka po kategoriích: S&P 500 (4 americké fondy z kvízu → 3 evropská dvojčata, SPYL je dvojčetem SPYM i SPY), celý americký trh, vyspělý svět (MSCI World), rozvíjející se trhy, celý svět. U každého fondu: ticker a burza, TER, ISIN, akumulační/distribuční, měna, zdroj a datum ověření. | Rozšiřuje kvíz z jednoho indexu na celé portfolio. Tohle si člověk za dvě minuty z aplikace brokera nesestaví. | S&P 500: kompletní a ověřené v `data/etf.json`. Ostatní kategorie: fondy je potřeba vybrat a ověřit u správců (role `guide-only`). |
| 3. Mapa indexů | Schéma: S&P 500 leží uvnitř World, World + rozvíjející se trhy = celý svět. Váhy zemí z factsheetů MSCI s datem. Tři ilustrační způsoby, jak pokrýt celý svět dvěma až třemi fondy, každý s jednou větou, co znamená. | Odpovídá na „co přidat k S&P 500“ a plní slib „jak poskládat celý svět“. Označeno jako ilustrace, ne doporučení. | Chybí: váhy MSCI a fondy pro World/EM/celý svět. |
| 4. Akumulační vs. distribuční | Co je rozdíl, co znamená pro reinvestici a pro papírování v ČR. | Na stránce vidí u evropských dvojčat „akum.“, zatímco americké fondy výnos vyplácejí čtvrtletně. Videa tenhle rozdíl neřeší. | Typ výplaty u všech 7 fondů je v `etf.json`. Daňová část chybí. |
| 5. Kontrolní seznam před nákupem | 6–8 bodů: má fond KID, v jaké měně ho kupuji a kolik stojí směna, domicil fondu, poplatek za nákup u brokera, časový a hodnotový test u daní. | Praktický výstup, ke kterému se člověk vrátí při nákupu. | KID, měna a domicil: ano (`czRetailAvailable`, `baseCurrency`, `listing`, `domicile`). Daně: chybí. |
| Zdroje a metodika | Odkazy na stránky a dokumenty správců, data ověření, vzorec modelového výpočtu (`projection.ts`), upozornění „nejde o investiční ani daňové poradenství“. | Důvěryhodnost a dohledatelnost dat. | Ano: zdroj u každé hodnoty v `etf.json`, vzorec v Technickém řešení. |

**Pravidla obsahu**
- Daňová pravidla (časový a hodnotový test, limit osvobození) jen z aktuálního znění zákona nebo z webu Finanční správy, u každého datum. Od roku 2025 se pravidla měnila. Nejisté raději vynechat.
- Fondy pro World, rozvíjející se trhy a celý svět ověřit u správců stejně jako u S&P 500 (zdroj, datum, ISIN s kontrolní číslicí). Hlídat mix poskytovatelů indexů (MSCI vs. FTSE), protože některé země zařazují jinak.
- Slib v nabídce nad tlačítkem musí PDF splnit. Pokud nabídka slíbí „jak poskládat celý svět ze dvou až tří fondů“, strana 3 to musí opravdu ukázat.
- Žádné srovnání brokerů (data se rychle mění a nejsou ověřená) a žádné doporučení konkrétního fondu. Jen fakta a ilustrace.
- Čísla jen z `etf.json` a `projection.ts`. PDF by se generovalo ze stejných dat jako stránka, aby nevznikl rozpor.

## Očekávaná konverze (odhad)

> Odhad, neověřený na reálných návštěvnících. Upřesní se po prvních
> ~1 000 návštěvách z kampaně podle funnelu v Umami.

**Odhad: 4 % návštěv odešle formulář (realistické rozpětí 2–5 %).**

| Krok funnelu | Událost | Ze 100 návštěv | Předpoklad |
|---|---|---|---|
| Příchod z reklamy | pageview | 100 | studený provoz z Meta, mobil |
| Odpověď v kvízu | `rc_answer` | 50 | jedno kliknutí, nízká bariéra |
| Zobrazení nabídky PDF | `rc_form_view` | 40 | část lidí po odhalení odejde |
| Otevření formuláře | `rc_cta_click` | 20 | polovina z těch, kdo nabídku viděli |
| Fokus do pole e-mail | `rc_form_focus` | 12 | |
| Pokus o odeslání | `rc_form_submit` | 6 | |
| Uložený lead | `rc_lead_success` | 4 | 20 % otevřených formulářů |

**Z čeho odhad vychází**
- Běžné benchmarky lead-gen stránek se pohybují v jednotkách procent,
  finance spíš ve spodní polovině kvůli nedůvěře při zadávání e-mailu.
- Studený provoz z mobilní reklamy konvertuje hůř než vyhledávání.
- Naopak pomáhá: kvíz na první obrazovce (nízká bariéra prvního kroku),
  hodnota viditelná před formulářem a jediné pole formuláře.

Nejrizikovější krok je otevření formuláře (40 → 20). Na něj se zaměří
první vyhodnocení funnelu.

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

- **Rozdělení:** podle reklamy (`utm_content=ad_a` / `ad_b`) by varianty dostávaly jiné publikum (a přepínání podle UTM zatím není nasazené). Pro čisté A/B je potřeba náhodné rozdělení 50/50 s variantou uloženou v prohlížeči, aby se při návratu neměnila. Uložení v cookie nebo `localStorage` pro A/B test nejspíš podléhá souhlasu podle ePrivacy (stránka teď cookies nepoužívá), proto je to otevřený bod.
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
Varianta B je nový návrh, nesouvisí s reklamou B.

| Prvek | A – kontrola (současná) | B – varianta s čísly |
|---|---|---|
| Nadpis | NENÍ ETF JAKO ETF | STEJNÝ INDEX. TÉMĚŘ 5× VYŠŠÍ POPLATEK. |
| Podtext | VOO, IVV, SPYM a SPY jsou populární americká ETF. Všechny sledují stejný index S&P 500. Liší se poplatkem (TER). | SPYM stojí 0,02 % ročně, SPY 0,0945 %. Obě sledují stejný index S&P 500. |
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
- **Návaznost na reklamu:** nadpis rozvádí „Jiný poplatek“ z reklamy A.

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
| Nad kartami | nic, návštěvník porovnává 7 karet sám (rozpětí ztráty je až v souhrnu pod jezdci) | „Výběrem nejlevnějšího evropského fondu ušetříte až 6 048 Kč.“ |
| Pod řádkem | – | „Při 3 000 Kč měsíčně, 20 letech a modelovém výnosu 6 %.“ |
| Karty fondů | 7 karet s částkou „přijdete o … Kč“ | beze změny |
| Kalkulačka | měsíční vklad, doba, výnos | beze změny |

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
(4–5 stran). V této verzi PDF ani e-mail nejsou: po odeslání stránka potvrdí
uložení a napíše, že tahák dokončujeme a bude ke stažení přímo na stránce.

| Prvek | A – popis akce (současná) | B – přínos v první osobě |
|---|---|---|
| Text tlačítka | Odeslat PDF | Chci evropská dvojčata |
| Co komunikuje | co se stane po kliknutí | co tím návštěvník získá |
| Text pod tlačítkem | Žádný spam, odhlásit se můžete jedním kliknutím. + odkaz na zásady zpracování údajů (věta „Tahák stáhnete hned po odeslání.“ přibude až s hotovým PDF) | beze změny |

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
| `rc_cta_click` | kliknutí na „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ (otevře formulář; parametr `location`) | 1, 3 |
| `rc_form_view` | karta s nabídkou PDF z poloviny na obrazovce (jen po odpovědi), 1× za relaci | – |
| `rc_form_focus` | první fokus do pole e-mail | 2, 3 |
| `rc_form_submit` | každý pokus o odeslání (i neplatný e-mail) | 3 |
| `rc_lead_success` | server potvrdí uložení kontaktu | 1, 2, 3 |
| `rc_lead_error` | server nebo síť vrátí chybu (parametr `code`) | – |
| `rc_pdf_download` | stažení PDF (v této verzi se neodesílá, PDF není) | – |
| *chybí:* `rc_calculator_view` | kalkulačka z poloviny na obrazovce – potřeba pro jmenovatel v H2 | 2 |

## Práce s AI

- **Plánování** v claude.ai (koncept, texty, reklamy): [`ai-log/planovani/`](ai-log/planovani/).
- **Implementace** v Claude Code (kód, testy, nasazení, design, reklamy): [`ai-log/implementace/`](ai-log/implementace/), čtyři logy po fázích. Zprávy jsou doslova, nástroje jen jako seznam.
- **Pravidla pro AI** jsou v [`CLAUDE.md`](CLAUDE.md): finanční data nikdy z paměti (jen `data/etf.json` se zdrojem a datem), žádná ručně psaná čísla, žádná doporučení, model oddělený od faktů, chybějící text jako viditelný placeholder.
- **Rozhodnutí** se průběžně zapisují do [`docs/decisions.md`](docs/decisions.md) (datum, co, proč); při změně zadání se upravují i `brief.md` a tech-spec.
- **Co dělal člověk:** finanční data (TER, ISIN, burzy, dostupnost v ČR) ověřil Tom u správců fondů; zadání, texty, design a schvalování rozhodnutí. AI data neověřuje z paměti – co nejde doložit, zůstává `null` nebo placeholder.

**Jak jsem kontroloval výstup**
- Finanční data jsem ověřil přímo v dokumentech správců (factsheet, KID),
  nikdy jsem nepřebíral čísla od AI.
- Výpočty hlídají testy (`projection.test.ts`) a nezávislý přepočet
  včetně simulace měsíc po měsíci.
- Návrhy textů a měření jsem porovnával s tím, co je skutečně v kódu.
- Stránku jsem testoval na produkci a průchod funnelem v Umami ověřil od zobrazení
  po fokus do pole e-mail (`rc_view` → `rc_answer` → `rc_form_view` →
  `rc_cta_click` → `rc_form_focus`). Odeslání formuláře na produkci zatím
  neproběhlo (viz Co chybí).

**Kde se AI spletla**
- Označila VOO (TER 0,03 %) za nejlevnější fond, přitom SPYM má 0,02 %.
  Zachyceno ověřením u správce, opraveno v hypotéze 1.
- Zdůvodnila pořadí A/B hypotéz tím, kolik lidí danou část stránky uvidí.
  U posledního kroku to neplatí (každý kontakt projde formulářem), opraveno.
- Navrhla názvy eventů pro měření (`quiz_answer`, `form_start`…), které
  v kódu neexistovaly. Zachyceno porovnáním s implementací, README přepsáno
  na skutečné `rc_*` eventy.
- U hypotézy 2 odhadla potřebný vzorek na „statisíce návštěv“, přepočet
  dal přibližně 80 000.
- Navrhla do reklamy tvrzení „Většina lidí odpoví špatně“, které nebylo
  podložené daty. Nahrazeno „Odpověď vás možná překvapí.“

## Co chybí

**Před spuštěním kampaně (blokuje)**
- **PDF tahák.** Stránka ho nabízí, ale v této verzi se nevytváří; po odeslání formuláře stránka říká, že ho dokončujeme. Obsah a podklady jsou výše v [Co lead dostane za e-mail](#co-lead-dostane-za-e-mail). Pro strany 2–5 chybí ověřené fondy pro celý americký trh, vyspělý svět, rozvíjející se trhy a celý svět, váhy indexů MSCI a daňová část (jen z aktuálního zákona nebo Finanční správy s datem).
- **Odesílání e-mailu.** Vypnuté (`EMAIL_ENABLED=false`), chybí vlastní ověřená doména pro Resend.
- **Zásady ochrany osobních údajů** (`/zasady-ochrany-udaju`, odkaz pod tlačítkem formuláře a v patičce) **nejsou hotové.** Hotové jsou sekce Jaké údaje, Kde jsou uložené, Měření návštěvnosti a Vaše práva; tři sekce jsou na stránce viditelné placeholdery `[[CHYBÍ TEXT]]`:
  - **Kdo údaje zpracovává:** správce (jméno nebo firma, IČO, adresa, kontaktní e-mail) – totéž chybí v patičce jako provozovatel a kontakt.
  - **Proč:** účely a právní základ zpracování (jen předání taháku, nebo i další e-maily). Text pod tlačítkem „odhlásit se můžete jedním kliknutím“ naznačuje další e-maily – musí odpovídat zvolenému účelu.
  - **Jak dlouho:** doba uložení e-mailu.

  Doplní provozovatel (případně s právníkem), ne AI. Po doplnění se zvýší verze zásad, která se ukládá ke každému leadu.
- **Ověření na produkci.** Odeslání formuláře na produkci a testovací lead v produkční databázi (se snímkem tabulky; v Umami zatím není žádné `rc_form_submit` ani `rc_lead_success`) a průchod stránkou na skutečném telefonu (iOS Safari, Android Chrome) – zatím jen emulovaná šířka v prohlížeči.

**Měření a A/B testy**
- Přepínání hero podle reklamy (`utm_content`) není nasazené: obě reklamy vedou na hero A. Chybí i náhodné rozdělení 50/50 pro hypotézy výše (uložení varianty v prohlížeči nejspíš vyžaduje souhlas podle ePrivacy).
- Event `rc_calculator_view` (jmenovatel pro hypotézu 2).
- Data z `rc_answer`: dokud nejsou, reklama B nesmí tvrdit „Většina lidí odpoví špatně“.

**Kvalita a dokončení**
- End-to-end testy (Playwright) a test 5 sekund s lidmi (co stránka nabízí).
- Sticky CTA na mobilu (brief: „mělo by“) – není.
- Výkon na mobilu: LCP 3,3 s čeká hlavně na webové písmo, Lighthouse navrhuje ubrat ~111 KiB nepoužitého JavaScriptu.
- Texty, které doplnil Claude, čekají na revizi: FAQ, metodika a drobné texty formuláře (v `content/copy.ts` označené „Claude 16. 10.“) a hlavní texty reklam pro Meta (označené v `ads/`).

**Provoz**
- Ostrá kampaň by běžela na Vercel Pro (Hobby je pro nekomerční provoz) a s rate limitem sdíleným mezi instancemi (teď jen v paměti jedné instance).

**Záměrně není:** srovnání brokerů (data se rychle mění a nejsou ověřená) – patřilo by do dalších e-mailů.
