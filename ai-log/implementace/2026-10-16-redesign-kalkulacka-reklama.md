# AI log: implementace – state retention, README, animace, redesign, kalkulačka, reklama A

- **Datum:** 15. 10. 2026 (pozdní večer) a 16. 10. 2026
- **Nástroj:** Claude Code (desktopová aplikace), model Claude Opus 5.5
- **Navazuje na:** `2026-10-15-ui-lead-analytika-nasazeni.md`, který končí žádostí o export. Tento log začíná první další zprávou.
- **Fáze:** state retention po reloadu, README (technické řešení, A/B hypotézy, Umami, eventy funnelu, obsah PDF), formulář jen spolu se srovnáním, animace (motion) a doplnění textů, písma Outfit a Plus Jakarta Sans, redesign (bílé pozadí, barevný hero, karty dvojic, navy a fialové karty, vlajky), vizuální prvky (šipky, proužky poplatků, ikony), kontrola výpočtu a push s nasazením, souhrn kalkulačky v řádcích, Lighthouse, reklama A v designu stránky, větev pro PR, barvy tickerů.
- **Forma logu:** převedeno z transkriptu session. Zprávy Toma a odpovědi Claude Code jsou doslova; zprávy poslané během práce Clauda jsou označené „během práce“; volání nástrojů jen jako seznam (název + popis), bez výstupů. Interní úvahy modelu a výstupy nástrojů nejsou zahrnuty, e-mailové adresy jsou anonymizované, obrázky nahrazeny popisem. Uprostřed se kontext automaticky shrnul (vyznačeno).

---

### 👤 Tom

> chci state retention - při reloadu stranky ma zustat vše stejne, zakliknuta odpoved i srovnavac. pokud je venku i formuář, tak i formuář.

### 🤖 Claude Code

Rozumím. Po reloadu se obnoví:

| Co | Kde se uloží | Jak dlouho platí |
|---|---|---|
| Odpověď v kvízu (a tím i odhalení se srovnávačem) | `sessionStorage` (už se tam ukládá pro formulář) | do zavření záložky |
| Nastavení jezdců | `sessionStorage` | do zavření záložky |
| Otevřený formulář | `sessionStorage` | do zavření záložky |
| Odesláno (stav úspěchu s odkazem na PDF) | `localStorage` podle tech-spec 7.4 (`use-lead-status`) | i při další návštěvě |

Rozepsaný e-mail do úložiště ukládat nebudu, je to osobní údaj a nechci ho mít v prohlížeči uložený. Po reloadu ho doplní automatické vyplňování prohlížeče.

Po obnovení se stránka nesmí sama posunout k odhalení ani přesunout fokus. To dělá jen skutečný klik, takže při obnovení se znovu nepošle ani event `rc_answer`.

<details><summary>Nástroje (4)</summary>

- `Bash` – Review storage helper and lead component
- `Bash` – Add storage helpers for quiz, sliders, lead state with tests
- `Bash` – Restore quiz, sliders and lead step after reload
- `Bash` – Fix focus-effect ordering on lead restore

</details>

### 🤖 Claude Code

Teď to vyzkouším v prohlížeči na localhostu: odpovím, posunu jezdec, otevřu formulář, dám reload a zkontroluju, že je všechno stejné.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Stav je uložený: odpověď NE, doba 27 let, otevřený formulář. Teď reload. Napíšu si i pozici scrollu před ním, ať vidím, jestli se stránka po obnovení vrátí na stejné místo.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_console_messages`
- `Bash` – Add scroll retention after state restore, with tests

</details>

### 🤖 Claude Code

Testy prochází. Ověřím obnovení scrollu v prohlížeči: posunu stránku k formuláři a dám reload.

<details><summary>Nástroje (6)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Build, update docs and decisions, commit state retention

</details>

### 🤖 Claude Code

Stránka si teď po reloadu pamatuje svůj stav. Ověřil jsem to v prohlížeči na localhostu a commitnul jako `8d824dc`. Prochází 245 testů i produkční build.

| Po reloadu zůstane | Kde je uložené | Ověřeno |
|---|---|---|
| Zvolená odpověď (NE se ✓, tlačítka zablokovaná) a odhalení se srovnávačem | relace záložky | ✅ |
| Nastavení jezdců (např. 27 let, souhrnná věta přepočítaná) | relace záložky | ✅ |
| Otevřený formulář | relace záložky | ✅ |
| Stav po odeslání s odkazem na PDF | trvale v prohlížeči, i při další návštěvě | ✅ |
| Pozice na stránce | relace záložky | ✅ 1513 → 1513 px |

- **Po obnovení:** stránka sama neposkočí k odhalení, fokus neskočí do pole a znovu se neodešle event `rc_answer`, takže se statistiky v Umami nezdvojí.
- **Rozepsaný e-mail se neukládá.** Je to osobní údaj a po reloadu ho doplní automatické vyplňování prohlížeče. Kdybys chtěl, aby zůstal i rozepsaný text, přidám to, ale nedoporučuju to.
- **Pozice na stránce:** prohlížeč ji při reloadu sám neobnovil a stránka skončila nahoře. Obnovený obsah se totiž vykreslí až po načtení, kdy je stránka ještě krátká. Pozici si proto ukládám při odchodu ze stránky a nastavím ji, až je obsah vykreslený.
- **Úklid:** odeslání jsem testoval s podvrženou odpovědí serveru, do databáze nic nepřibylo. Svoje testovací data jsem z úložiště prohlížeče smazal.

Ještě to není na produkci: na GitHubu chybí tenhle commit a předchozí AI log (`8cc41b1`). Mám je pushnout? Vercel by je pak během zhruba půl minuty nasadil.

### 👤 Tom

> sepiš technické řešení pro readme - co nestručněji to jde

<details><summary>Nástroje (3)</summary>

- `Bash` – Check for existing README and scripts
- `Write` – README.md
- `Bash` – Commit README technical section

</details>

### 🤖 Claude Code

Sepsal jsem sekci **Technické řešení** do nového [README.md](README.md) a commitnul ji jako `f6a40c9`.

Obsahuje stack, architekturu, data a výpočet, formulář a ukládání leadů, měření, bezpečnost a přístupnost, stav po reloadu, spuštění a známá omezení. Každé téma má jeden až tři řádky. Finanční čísla jsem do textu nepsal. Je tam jen vzorec z `projection.ts` a limit API 4 kB.

Ostatní části README zatím chybí: popis řešení zadání, reklamy, odhad konverze a A/B hypotézy, práce s AI, Lighthouse a snímek tabulky leadů. Doplním je, až budou hotové.

Na GitHub zatím nic nešlo. Lokálně jsou 3 commity navíc: AI log, obnova stavu po reloadu a README. Mám je pushnout? Vercel pak nasadí i obnovu stavu po reloadu.

### 👤 Tom

> do readme pridej tuto sekci o a/b testovani 
>
> <pasted_content id="cabb">
> ## A/B HYPOTÉZY (SEŘAZENÉ PODLE DOPADU: ZMĚNA, ÚČINEK, METRIKA)
> ## A/B testování
> > Všechny tři testy jsou navržené, ale zatím nebyly spuštěny. Uvedené hodnoty
> > jsou **odhady** vycházející z běžných výsledků lead-gen stránek, nikoli
> > z měření na reálných návštěvnících.
> ### Pořadí hypotéz
> Hypotézy jsou seřazené podle očekávaného nárůstu počtu kontaktů. Rozhoduje
> velikost změny v rozhodování návštěvníka, ne to, kolik lidí danou část stránky
> uvidí: každý kontakt projde formulářem, takže relativní zlepšení posledního
> kroku se celé promítne do výsledku.
> | Pořadí | Hypotéza | Očekávaný nárůst kontaktů | Proč toto pořadí |
> |---|---|---|---|
> | 1 | Konkrétní čísla v hero sekci | +10–15 % | Mění vnímanou hodnotu stránky v prvních sekundách, kdy návštěvník z reklamy rozhoduje, jestli zůstane. Nejrychleji dosáhne potřebného vzorku. |
> | 2 | Osobní závěr nad kalkulačkou | +5–10 % | Zpřehlední přínos pro návštěvníky, kteří už jsou zapojení, ale nabídku samotnou nemění. |
> | 3 | Text odesílacího tlačítka | +5–10 %, spíš spodní hranice | Mění jen formulaci posledního kroku. Testy tohoto typu dávají obvykle nejmenší efekty. |
> ### Společná pravidla pro všechny testy
> - Návštěvníci jsou náhodně rozděleni 50/50, varianta se uloží do cookie,
>   aby se při návratu neměnila.
> - Ke všem měřeným událostem se přidává parametr `variant` (A/B).
> - Testy běží postupně v pořadí 1 → 2 → 3, aby se jejich účinky nemíchaly.
>   Vítězná varianta se vždy nasadí jako nová kontrola pro další test.
> - Výsledky vyhodnocujeme i zvlášť podle verze reklamy, ze které návštěvník přišel.
> - Varianta B vyhrává, pokud statisticky významně (p < 0,05) zvýší primární
>   metriku a nezhorší hlídací metriku. Velikosti vzorků jsou spočítané pro
>   hladinu významnosti 5 % a sílu testu 80 %.
> ---
> ### Hypotéza 1: Konkrétní čísla v hero sekci
> **Změna**
> Současná hero sekce popisuje rozdíl v poplatcích obecně. Varianta B ho ukazuje
> konkrétními čísly. Kvízová mechanika (otázka s odpověďmi ANO / NE, správně je NE)
> zůstává stejná, design ani zbytek stránky se nemění. Testuje se pouze text.
> | Prvek | A – kontrola (současná) | B – varianta s čísly |
> |---|---|---|
> | Nadpis | NENÍ ETF JAKO ETF | STEJNÝ INDEX. AŽ 5× VYŠŠÍ POPLATEK. |
> | Podtext | VOO, IVV, SPYM a SPY jsou populární americká ETF. Všechna sledují stejný index S&P 500. Liší se poplatkem (TER). | SPYM stojí 0,02 % ročně, SPY 0,0945 %. Obě sledují stejný index S&P 500. |
> | Otázka | Můžete si je koupit v Česku? | Můžete si ten nejlevnější koupit v Česku? |
> | Odpovědi | ANO (špatně) / NE | ANO (špatně) / NE |
> Čísla odpovídají TER fondů SPYM (0,02 %) a SPY (0,0945 %), oba sledují index
> S&P 500. Poměr 0,0945 / 0,02 = 4,7, proto „až 5×“. Zdroj a datum ověření
> jsou uvedeny v sekci Data a zdroje.
> **Očekávaný účinek (odhad)**
> - Kliknutí na odpověď v hero sekci: +15–25 % relativně
> - Odeslání formuláře: +10–15 % relativně
> **Proč by změna měla fungovat**
> - **Konkrétnost:** číslo působí jako ověřitelný fakt, obecné tvrzení jako reklama.
> - **Hodnota na první pohled:** návštěvník z mobilu během několika sekund pochopí,
>   že stejný index lze mít výrazně levněji a že mu stránka ukáže, jak na to.
> - **Silnější motivace odpovědět:** ve variantě A návštěvník ví, že se fondy liší,
>   ale neví o kolik. Ve variantě B vidí, že nejlevnější fond je téměř 5× levnější,
>   takže otázka „můžu si ho koupit?“ je pro něj osobně důležitá.
> - **Averze ke ztrátě:** vyšší poplatek je srozumitelná ztráta, kterou chce
>   investor snížit.
> - **Návaznost na reklamu:** nadpis opakuje slib reklamy zaměřené na poplatky.
> **Měřítko úspěchu**
> | Typ | Metrika | Výpočet |
> |---|---|---|
> | Primární | Konverzní poměr | úspěšná odeslání formuláře / návštěvy varianty |
> | Sekundární | Zapojení v hero | kliknutí ANO nebo NE / návštěvy varianty |
> | Hlídací | Odchod bez interakce | návštěvy bez jakékoli události / návštěvy varianty |
> Pokud varianta B zvýší pouze kliknutí v hero, ale ne odeslané formuláře,
> přitahuje zvědavce místo relevantních zájemců a za úspěch se nepovažuje.
> **Velikost vzorku**
> - Sekundární metrika: ~1 600 návštěv na variantu (zapojení 50 % → 55 %)
> - Primární metrika: ~10 000 návštěv na variantu (konverze 4 % → 4,8 %)
> ---
> ### Hypotéza 2: Osobní závěr nad výsledky kalkulačky
> **Změna**
> Varianta B přidá nad karty fondů jeden zvýrazněný řádek, který shrne výsledek
> pro fondy dostupné v ČR a přepočítává se při změně parametrů kalkulačky.
> Karty, kalkulačka, data i výpočet zůstávají stejné.
> | Prvek | A – kontrola (současná) | B – varianta se závěrem |
> |---|---|---|
> | Nad kartami | nic, návštěvník porovnává 7 karet sám | „Výběrem nejlevnějšího evropského fondu ušetříte až 6 048 Kč.“ |
> | Pod řádkem | – | „Při 3 000 Kč měsíčně, 20 letech a modelovém výnosu 6 %.“ |
> | Karty fondů | 7 karet s částkou „přijdete o … Kč“ | beze změny |
> | Kalkulačka | výnos, doba, měsíční vklad | beze změny |
> Částka = poplatky u nejdražšího evropského dvojčete (VUAA / SXR8, TER 0,07 %)
> minus poplatky u nejlevnějšího (SPYL, TER 0,03 %): 10 605 − 4 557 = 6 048 Kč.
> Jde o modelový výpočet se stejnými předpoklady jako kalkulačka (měsíční úročení,
> TER odečten od výnosu, bez poplatků brokera, směny měn a daní).
> **Očekávaný účinek (odhad)**
> - Interakce s kalkulačkou (změna alespoň jednoho parametru): +20–30 % relativně
> - Zahájení vyplňování formuláře: +10–20 % relativně
> - Odeslání formuláře: +5–10 % relativně
> **Proč by změna měla fungovat**
> - **Méně práce pro návštěvníka:** na mobilu je porovnávání 7 karet náročné.
>   Jedna věta mu dá závěr okamžitě.
> - **Relevance:** americká ETF v ČR obvykle nekoupí, takže pro něj je podstatný
>   rozdíl mezi evropskými fondy. Ten varianta A nikde přímo neuvádí.
> - **Osobní číslo:** částka se mění podle jeho vlastního vkladu a doby,
>   což motivuje vyzkoušet kalkulačku.
> - **Úspora místo ztráty:** karty mluví o tom, o kolik přijde. Závěr ukazuje,
>   co může získat vlastním rozhodnutím, a tím přirozeně navazuje na nabídku PDF.
> **Měřítko úspěchu**
> | Typ | Metrika | Výpočet |
> |---|---|---|
> | Primární | Konverzní poměr | úspěšná odeslání / návštěvy, které zobrazily kalkulačku |
> | Sekundární | Interakce s kalkulačkou | návštěvy se změnou parametru / návštěvy, které zobrazily kalkulačku |
> | Sekundární | Zahájení formuláře | zahájená vyplňování / návštěvy, které zobrazily kalkulačku |
> | Hlídací | Odchod z kalkulačky | odchody bez další akce po zobrazení kalkulačky / návštěvy, které ji zobrazily |
> Jmenovatelem jsou návštěvy, které kalkulačku skutečně zobrazily, aby výsledek
> neovlivnilo chování v hero sekci.
> **Velikost vzorku**
> - Sekundární metrika: ~620 návštěv na variantu (interakce 30 % → 37,5 %)
> - Primární metrika: při nárůstu kolem 7 % je potřeba řádově statisíce návštěv,
>   což je při běžném rozpočtu kampaně nereálné. Rozhodujeme proto podle
>   sekundárních metrik a primární metrika slouží jako kontrola, že se nezhoršila.
> ---
> ### Hypotéza 3: Text odesílacího tlačítka formuláře
> **Změna**
> Testujeme pouze text odesílacího tlačítka. Pole formuláře, nadpis, popis nabídky,
> text pod tlačítkem i design zůstávají stejné. Po odeslání dostane návštěvník
> v obou variantách stejné PDF „Z amerického videa do českého portfolia“ (4–5 stran).
> | Prvek | A – popis akce | B – přínos v první osobě |
> |---|---|---|
> | Text tlačítka | Poslat PDF na e-mail | Chci evropská dvojčata |
> | Co komunikuje | co se stane po kliknutí | co tím návštěvník získá |
> | Text pod tlačítkem | PDF, 5 stran. Bez spamu, odhlásíte se jedním kliknutím. | beze změny |
> **Očekávaný účinek (odhad)**
> - Odeslání formuláře u návštěv, které formulář zobrazily: +5–10 % relativně ve prospěch B
> Dopad je nejnižší ze tří hypotéz: tlačítko mění jen formulaci posledního
> kroku, ne vnímanou hodnotu nabídky.
> **Proč by změna měla fungovat**
> - **Přínos místo úkonu:** varianta A popisuje akci (poslat PDF), varianta B
>   pojmenovává, co návštěvník chce – fondy, které si v ČR skutečně koupí.
> - **Návaznost na kvíz:** pojem „evropské dvojče“ zná z odhalení po odpovědi
>   v hero sekci. Tlačítko tak dokončuje otázku, kterou kvíz otevřel.
> - **První osoba:** text „Chci…“ návštěvník čte jako vlastní rozhodnutí,
>   ne jako pokyn od stránky.
> **Proč může vyhrát A (důvod testovat)**
> Varianta A přesně říká, co se stane, a tím snižuje nejistotu. Pro opatrného
> drobného investora, který zadává e-mail finanční stránce, může být jasnost
> („dostanu PDF, nic víc“) důležitější než pojmenovaný přínos.
> **Měřítko úspěchu**
> | Typ | Metrika | Výpočet |
> |---|---|---|
> | Primární | Konverze formuláře | úspěšná odeslání / návštěvy, které zobrazily formulář |
> | Sekundární | Dokončení formuláře | pokusy o odeslání / zahájená vyplňování |
> | Hlídací | Kvalita kontaktu | platné, doručené e-maily / úspěšná odeslání |
> Hlídací metrika ověřuje, že varianta nepřivádí víc nekvalitních kontaktů
> (překlepy, falešné adresy).
> **Velikost vzorku**
> - ~3 000 zobrazení formuláře na variantu (konverze formuláře 20 % → 23 %)
> ---
> ### Měřené události
> | Událost | Kdy se odešle | Použito v testu |
> |---|---|---|
> | `page_view` | načtení stránky (včetně UTM parametrů reklamy) | 1, 2, 3 |
> | `quiz_answer` | kliknutí ANO / NE v hero sekci | 1 |
> | `calculator_view` | kalkulačka se zobrazí na obrazovce | 2 |
> | `calculator_change` | změna parametru kalkulačky | 2 |
> | `form_view` | formulář se zobrazí na obrazovce | 3 |
> | `form_start` | první zápis do pole formuláře | 2, 3 |
> | `form_submit_attempt` | kliknutí na odesílací tlačítko | 3 |
> | `form_submit_success` | server potvrdí uložení kontaktu | 1, 2, 3 |
> </pasted_content id="cabb">

### 🤖 Claude Code

Sekci přidám do README tak, jak je. Předtím přepočítám čísla v ní proti `projection.ts` a datům, protože README podle tech-specu nesmí obsahovat číslo, které z nich nevzniklo.

<details><summary>Nástroje (3)</summary>

- `Bash` – Recompute A/B numbers from projection and data
- `Bash` – Rerun A/B check showing console output
- `Bash` – Append A/B section verbatim to README and commit

</details>

### 🤖 Claude Code

Sekci jsem přidal do README beze změny textu a commitnul jako `7c93235`. Přepočítal jsem z `projection.ts` a `etf.json` všechna čísla v ní, většina sedí. Sedí i velikosti vzorků (1 565, 10 317, 623 a 2 943 návštěv na variantu).

Při kontrole jsem ale našel místa, která neodpovídají tomu, co je postavené, nebo pravidlům projektu. Text jsem nechal, jak jsi ho poslal:

1. **Názvy událostí v tabulce „Měřené události“ neexistují.** V kódu i v Umami jsou `rc_` eventy:

   | V README | Ve skutečnosti |
   |---|---|
   | `page_view` | automatický pageview v Umami |
   | `quiz_answer` | `rc_answer` |
   | `calculator_view` | **neexistuje** (H2 by ho potřebovala) |
   | `calculator_change` | `rc_slider_change` (první pohyb každého jezdce) |
   | `form_view` | `rc_form_view` (až po odpovědi) |
   | `form_start` | `rc_form_focus` (první fokus, ne první zápis) |
   | `form_submit_attempt` | `rc_form_submit` |
   | `form_submit_success` | `rc_lead_success` |

2. **„varianta se uloží do cookie“:** stránka teď cookies nepoužívá a varianta se bere z `utm_content` reklamy, ne z náhodného rozdělení. Cookie (i `localStorage`) pro A/B test by podle ePrivacy nejspíš potřebovala souhlas, tedy i cookie lištu. To je právní otázka, nechávám ji na tobě.
3. **„AŽ 5× VYŠŠÍ POPLATEK“:** poměr je 4,7×. Formulace „až 5×“ tvrdí víc, než data říkají, a o odstavec níž stojí „téměř 5×“. Navrhuju „TÉMĚŘ 5× VYŠŠÍ POPLATEK“.
4. **H2, primární metrika:** při nárůstu o 7 % vychází zhruba **80 000 návštěv na variantu** (asi 160 000 celkem). „Řádově statisíce“ tedy platí jen pro součet obou variant.
5. **H3, varianta A „Poslat PDF na e-mail“** slibuje e-mail, který je vypnutý. Brief to zakazuje, dokud není ověřená doména. Navíc tlačítko na stránce teď zní „Odeslat PDF“.
6. **H3 popisuje stav, který neexistuje:**
   - text pod tlačítkem „PDF, 5 stran…“ se na stránce neukazuje, dnes tam je „Tahák stáhnete hned po odeslání.“;
   - PDF zatím není hotové (krok 7).
7. **H1:** podtext A uvádí „Všechna sledují…“, na stránce je „všechny sledují…“. Odkaz „v sekci Data a zdroje“ vede na sekci, která v README zatím není.
8. **Formátování:** tabulky v textu nejsou oddělené prázdným řádkem, takže je GitHub nejspíš nezobrazí jako tabulky, ale jako text. Prázdné řádky můžu doplnit, obsah se tím nezmění.
9. **Hlídací metrika H1 „návštěvy bez jakékoli události“** jde v Umami spočítat jen přibližně: návštěvy bez `rc_answer`, `rc_slider_change` ani `rc_cta_click`.

Mám opravit body 1, 3, 4, 7 a 8? Jde o fakta a formátování, nic se tím nerozhoduje. Body 2, 5 a 6 jsou na tobě.

Na GitHubu zatím nic z toho není, lokálně jsou 4 commity navíc.

### 👤 Tom

> klidně sekci uprav aby seděly s realitou projektu

### 🤖 Claude Code

Upravím sekci tak, aby odpovídala skutečnému stavu:

- **Eventy:** skutečné `rc_` názvy, u chybějícího `calculator_view` poznámka.
- **Rozdělení návštěvníků:** dnes podle reklamy (`utm_content`), stránka varianty B zatím chybí. Náhodné rozdělení s cookie bude otevřený bod.
- **H1:** „téměř 5×“, přesný podtext ze stránky, zdroj v `etf.json`.
- **H2:** odhad vzorku zhruba 80 tisíc na variantu.
- **H3:**
  - **tlačítko:** varianta A je „Odeslat PDF“;
  - **text pod tlačítkem:** jako na stránce;
  - **PDF:** zatím chybí;
  - **jmenovatel:** otevřený formulář, protože odesílací tlačítko je vidět až po kliknutí na CTA;
  - **doručitelnost:** měřitelná až se zapnutým e-mailem.
- **Formátování:** prázdné řádky kolem tabulek a jeden nadpis místo dvou.

Odhady účinků a zdůvodnění nechávám, jak jsi je napsal.

<details><summary>Nástroje (1)</summary>

- `Bash` – Rewrite README A/B section to match reality and commit

</details>

### 🤖 Claude Code

Sekci A/B testování v README jsem upravil podle skutečného stavu projektu a commitnul jako `7fa27b9`. Odhady účinků, zdůvodnění a pořadí hypotéz zůstaly, jak jsi je napsal.

- **Stav v kódu:** nový odstavec říká, co je hotové a co ne. Eventy už nesou `variant`, ale stránka zatím ukazuje jen variantu A a varianty B pro hypotézy ani náhodné rozdělení neexistují.
- **Rozdělení návštěvníků:** dnes variantu určuje reklama (`utm_content`). Náhodné rozdělení 50/50 s cookie jsem uvedl jako otevřený bod, protože nejspíš vyžaduje souhlas podle ePrivacy.
- **H1:** v nadpisu je „TÉMĚŘ 5×“, protože poměr je 4,7. Podtext A je přesně ze stránky. Zdroj odkazuje na `data/etf.json` a na karty, protože sekce „Data a zdroje“ v README neexistuje. Doplnil jsem, že jde o nový návrh, ne o stávající hero B pro reklamu B.
- **H2:**
  - **Vzorek pro primární metriku:** zhruba 80 000 návštěv na variantu.
  - **Chybějící event:** event pro zobrazení kalkulačky neexistuje. Do jeho přidání jde jako jmenovatel použít `rc_answer`, protože kalkulačka se ukáže až po odpovědi.
  - **Částky:** text uvádí, že by se generovaly z `projection.ts`.
- **H3:**
  - **Varianta A:** je současné tlačítko „Odeslat PDF“ a text pod ním je ten ze stránky.
  - **Jmenovatel:** `rc_cta_click`, protože odesílací tlačítko je vidět až po otevření formuláře.
  - **Stav:** PDF je zatím rozpracované a e-mail vypnutý, takže doručitelnost jde měřit až s ním.
- **Měřené události:** tabulka teď uvádí skutečné `rc_` eventy. Chybějící `rc_calculator_view` je v ní označený jako potřebný pro H2.
- **Formátování:** jeden nadpis místo dvou a prázdné řádky kolem tabulek, aby se na GitHubu zobrazily jako tabulky.

Lokálně je 5 commitů, které ještě nejsou na GitHubu. Mám je pushnout?

### 👤 Tom

> přidej do readme odkaz na  umami analytics s popiskem o co se jedná :
>
> https://cloud.umami.is/share/zzy7GghEW0w8JHsg

<details><summary>Nástroje (1)</summary>

- `Bash` – Add Umami share link to README and commit

</details>

### 🤖 Claude Code

Na GitHubu by se oba řádky slily do jednoho odstavce, protože je nedělí prázdný řádek. Doplním ho do stejného commitu (ještě není pushnutý).

<details><summary>Nástroje (1)</summary>

- `Bash` – Separate README lines and amend commit

</details>

### 🤖 Claude Code

Odkaz na Umami je v README na dvou místech a commitnutý jako `72d669b`:

- **Nahoře pod produkční adresou:**
  > **Analytika:** [veřejný přehled v Umami](https://cloud.umami.is/share/zzy7GghEW0w8JHsg) – návštěvy produkční stránky, zdroje provozu (UTM z reklam) a události `rc_` (odpověď v kvízu, jezdce, formulář, odeslání). Jen pro čtení, Umami nepoužívá cookies. Návštěvy s `utm_source=claude_test` jsou testovací.
- **V technickém řešení:** u řádku o měření.

Lokálně je teď 6 commitů navíc, které na GitHubu ještě nejsou: AI log, obnova stavu po reloadu a 4× README. Mám je pushnout?

### 👤 Tom

> sepiš mi sem nazvy eventu abych mohl spravne nastavit funnel na umami

### 🤖 Claude Code

Funnel v Umami: **Websites → etf-reality-check → Reports → Funnel**. Každý krok je buď URL, nebo event (Event). Názvy eventů opiš přesně, malými písmeny:

| # | Typ kroku | Hodnota | Co znamená |
|---|---|---|---|
| 1 | URL | `/` | návštěva stránky |
| 2 | Event | `rc_answer` | odpověděl ANO/NE |
| 3 | Event | `rc_form_view` | po odpovědi viděl kartu s nabídkou PDF |
| 4 | Event | `rc_cta_click` | klikl na „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ (otevřel formulář) |
| 5 | Event | `rc_form_focus` | klikl do pole e-mail |
| 6 | Event | `rc_form_submit` | zkusil odeslat |
| 7 | Event | `rc_lead_success` | lead se uložil |

Pokud chceš funnel přesně podle tech-specu, vynech krok 4. Formulář je ale dvoukrokový, takže `rc_cta_click` ukáže, kolik lidí odpadne mezi nabídkou a otevřením formuláře.

**Okno (Window)** nastav aspoň na 60 minut. Kroky se počítají jen v rámci jedné návštěvy a v daném čase.

**Další eventy pro samostatné přehledy (do funnelu nepatří):**

| Event | Vlastnost | K čemu |
|---|---|---|
| `rc_view` | – | kvíz se zobrazil |
| `rc_slider_change` | `slider` = `return` / `years` / `monthly` | kdo si hraje s kalkulačkou |
| `rc_lead_error` | `code` = `invalid_email` / `rate_limited` / `server_error` / `invalid_request` | proč odeslání selhalo |
| `rc_pdf_download` | – | stažení PDF |

Všechny eventy navíc nesou vlastnost `variant` (`a` / `b`). Podle ní funnel rozdělíš, až poběží hero B. Odpověď je v `rc_answer` ve vlastnosti `answer` (`ano` / `ne`).

**Pozor při čtení výsledků:**
- **`rc_view` a `rc_form_view`** se posílají jen jednou za relaci a jen když je prvek aspoň z poloviny na obrazovce.
- **Kdo otevře formulář dřív, než odpoví,** ve funnelu na kroku 3 vypadne. Karta s nabídkou je vidět už pod otázkou.
- **Testovací návštěvy** s `utm_source=claude_test` odfiltruj.
- **Zdroj pravdy o počtu leadů** je tabulka `leads` v Neonu. Blokátory reklam část eventů skryjí.

### 👤 Tom

> zde je prehled co by mel obsahovat pdf. srovnej sam s projektem a pripadne uprav co by v nem melo byt. pdf jako takove vytvaret nebudeme. chci aby v readme bylo také přehledně sepsáno co lead dostane za email:
>
> <pasted_content id="cabb">
> Obsah PDF
> Název: „Z amerického videa do českého portfolia”. Rozsah 4–5 stran, přičemž první strana sama o sobě odpoví na hlavní otázku.
> Strana
> Obsah
> Proč tam je
> 1. Rychlá odpověď
> Tři zjištění z kvízu ve třech větách. Pod tím jednoduché schéma „chci USA / svět / rozvíjející se trhy → tyto evropské fondy”.
> Kdo přečte jen jednu stranu, dostane slíbenou hodnotu.
> 2. Překladový slovník NYSE → UCITS
> Tabulka po kategoriích: S&P 500 (čtyři páry z kvízu), celý americký trh, vyspělý svět (MSCI World), rozvíjející se trhy, celý svět. U každého fondu: TER, ISIN, akumulační/distribuční, měna, datum ověření.
> Rozšiřuje kvíz z jednoho indexu na celé portfolio. Tohle si člověk neuloží za dvě minuty z aplikace brokera.
> 3. Mapa indexů
> Obrázek: S&P 500 leží uvnitř World, World + rozvíjející se trhy = celý svět. Váhy zemí z factsheetů MSCI. Tři ilustrační způsoby, jak pokrýt celý svět, každý s jednou větou o tom, co znamená.
> Vysvětluje otázku 2 a odpovídá na „co přidat”. Označeno jako ilustrace, ne doporučení.
> 4. Akumulační vs distribuční
> Co je rozdíl, co znamená pro reinvestici a pro papírování v ČR.
> Rozdíl, který americká videa neřeší a který viděl na kartě SPY5.
> 5. Kontrolní seznam před nákupem
> 6–8 bodů: má fond KID, v jaké měně ho kupuji a kolik stojí směna, domicil fondu, poplatek za nákup u brokera, časový a hodnotový test u daní.
> Praktický výstup, ke kterému se člověk vrátí při nákupu.
> Zdroje a metodika
> Odkazy na factsheety, data ověření, vzorec modelového výpočtu, upozornění „nejde o investiční ani daňové poradenství”.
> Důvěryhodnost a splnění požadavku na dohledatelná data.
>
> Na co si dát pozor při psaní:
> Daňová pravidla (časový a hodnotový test, limit osvobození) ber jen z aktuálního znění zákona nebo z webu Finanční správy a u každého uveď datum. Od roku 2025 se pravidla měnila.
> Konkrétní UCITS fondy pro World a rozvíjející se trhy ověř u správců stejně jako u S&P 500. Pozor na mix poskytovatelů indexů (MSCI vs FTSE), protože některé země zařazují jinak.
> Slib v hlášce musí PDF splnit. Pokud píšeš „jak poskládat celý svět ze dvou až tří fondů”, strana 3 to musí opravdu ukázat.
> </pasted_content id="cabb">

### 🤖 Claude Code

Obsah PDF porovnám s tím, co projekt skutečně má. Rozchází se v pěti bodech:

1. **Strana 3 „vysvětluje otázku 2“:** otázka 2 byla zrušená. Strana 3 teď plní slib nabídky „jak poskládat celý svět“.
2. **Strana 4 „viděl na kartě SPY5“:** SPY5 je vyřazený. Na stránce jsou evropská dvojčata akumulační („akum.“), americké fondy výnos vyplácejí čtvrtletně.
3. **Strana 2, S&P 500 „čtyři páry“:** jsou to 4 americké fondy a 3 evropská dvojčata (SPYL je dvojče SPYM i SPY). U CSPX se uvádí ticker SXR8.
4. **Fondy pro ostatní kategorie** (celý US trh, World, EM, celý svět) v `etf.json` nejsou. Tom je musí vybrat a ověřit stejně jako fondy S&P 500. Totéž platí pro váhy zemí MSCI a daňová pravidla.
5. **PDF nebude.** Tlačítko „Stáhnout tahák (PDF)“ po odeslání ale vede na `/tahak-etf-2026.pdf`, a ten soubor neexistuje.

Ověřím, co dnes produkce na té adrese vrací.

<details><summary>Nástroje (2)</summary>

- `Bash` – Check PDF URL status and brief chapter 8
- `Bash` – Add PDF contents to README, update brief, tech-spec, decisions

</details>

### 👤 Tom *(během práce)*

> před tim než zacneme vylepsovat design a texty, je potreba projekt dokoncit po technicke strance

### 🤖 Claude Code

Obsah PDF je v README v nové sekci **„Co lead dostane za e-mail“** (commit `dab7c2d`). U každé strany je, co obsahuje, proč tam je a které podklady v projektu jsou a které chybí. Osnovu jsem srovnal s projektem:
- **Strana 3:** už nevysvětluje zrušenou otázku 2, ale plní slib „jak poskládat celý svět“.
- **Strana 4:** neodkazuje na vyřazený SPY5.
- **Strana 2, S&P 500:** jsou 4 americké fondy a 3 evropská dvojčata.

Že se PDF nevytváří, jsem zapsal i do briefu, tech-specu a `decisions.md`.

## Co zbývá technicky dokončit

| # | Úkol | Proč | Rozsah |
|---|---|---|---|
| 1 | **Tlačítko „Stáhnout tahák (PDF)“ vede na 404** | Lead po odeslání klikne na nefunkční odkaz. Navrhuju tlačítko skrýt, dokud PDF neexistuje. Rozhodnutí je zapsané jako otevřené. | malý |
| 2 | **Krok 9: hero A/B podle `utm_content`** | Reklama B má vlastní hero s částkou z výpočtu: `proxy.ts`, statické `/v/a` a `/v/b`, `noindex` a canonical. Bez toho nejde měřit A/B ani poslat reklamu B. | střední |
| 3 | **Event `rc_calculator_view`** | README ho uvádí jako potřebný jmenovatel pro hypotézu 2. | malý |
| 4 | **Metadata a SEO** (tech-spec 11.5) | Canonical na produkční adresu a robots. Popis stránky a obrázek pro sdílení jsou obsah, ten vyplním placeholdery. | malý |
| 5 | **Push a nasazení + testovací lead na produkci** | Na GitHubu chybí 7 commitů (obnova stavu po reloadu se ještě nenasadila). Tech-spec chce testovací lead v produkci. Ten pošlu jen s tvým souhlasem, přibude jeden řádek. | malý |
| 6 | **Lighthouse na produkci** | Hodnoty do README (tech-spec 11.1), měřené na mobilu. Ověřím, jestli to jde spustit odsud. | malý |
| 7 | *SHOULD:* sticky CTA, `/metodika`, e2e testy (Playwright) | Sticky CTA a `/metodika` jsou technické a texty v nich budou placeholdery. Playwright je nová závislost, tu bych přidal jen na tvůj pokyn. | střední |

Navrhuju pořadí **1 → 2 → 3 → 4 → 5 → 6** a SHOULD podle času. U bodu 1 doporučuju tlačítko skrýt a v textu úspěchu nechat placeholder. Druhá možnost je dočasná stránka na adrese PDF.

Mám začít bodem 1 se skrytím tlačítka?

### 👤 Tom

> musí platit podmínka, že sekce s formulářem není zobrazena aniž by byla zobrazena sekce se srovnáním.

### 🤖 Claude Code

Rozumím: karta s formulářem se smí ukázat až se srovnáním, tedy po odpovědi.

Řešení bez sdíleného stavu mezi features: stránka (`src/app/page.tsx`) předá formulář kvízu jako prvek a kvíz ho vykreslí až na konci odhalení, pod jezdci. Skládání tak zůstává v `src/app`, jak chce tech-spec 3.1.

Díky tomu se formulář už nikdy nevykresluje na serveru a jeho uložený stav jde načíst rovnou při prvním vykreslení. Po reloadu se pak obnoví ve stejném okamžiku jako srovnávač a obnova scrollu ho započítá.

<details><summary>Nástroje (2)</summary>

- `Bash` – Review lead component and page composition
- `Bash` – Render lead form only inside the reveal; read lead state on first client render

</details>

### 🤖 Claude Code

Formulář dál potřebuje `readQuizAnswer`, aby poslal odpověď s leadem. Import jsem odstranil omylem, vracím ho.

<details><summary>Nástroje (6)</summary>

- `Bash` – Restore readQuizAnswer import and rerun tests
- `Bash` – Check server HTML has no lead form
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Panel prohlížeče byl mezitím zavřený a první navigace se nepovedla, takže skripty běžely na prázdné stránce. Teď je stránka načtená. Zopakuju test po krocích.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: tabs_context`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Panel ukazuje chybovou stránku prohlížeče: `localhost:3000` se nenačetl, přestože `curl` z terminálu před chvílí odpověděl. Ověřím, jestli dev server běží, a načtu stránku znovu.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: preview_list`
- `Bash` – Check dev server responds
- `Prohlížeč: preview_start`
- `Bash` – Wait for dev server and recheck server HTML

</details>

### 🤖 Claude Code

Teď kontrola platí: stránka ze serveru obsahuje hero, ale formulář v ní není. Následuje test v prohlížeči.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Před odpovědí formulář na stránce není. Po odpovědi se objeví uvnitř odhalení, pod jezdci. Teď otevřu formulář, posunu se k němu a dám reload.

<details><summary>Nástroje (8)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Focus only after user action, not after restore
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Update docs, build, test and commit

</details>

### 🤖 Claude Code

Podmínka teď platí: formulář se zobrazí jen spolu se srovnáním. Ověřil jsem to v prohlížeči a commitnul jako `64a4957`. Prochází 245 testů i produkční build.

**Jak to funguje**
- **Před odpovědí** formulář na stránce vůbec není. Nevykreslí ho ani server (v HTML stránky chybí), ani prohlížeč.
- **Po odpovědi** se objeví na konci odhalení, pod jezdci.
- **Skládání:** stránka předá formulář kvízu jako součást odhalení. Obě části tedy nesdílí stav a skládání zůstává v `src/app`, jak chce tech-spec.

**Dvě věci navíc, které z toho vyplynuly**
- **Obnova po reloadu:** formulář si uložený stav (otevřený / odesláno) načte rovnou při prvním vykreslení. Obnova scrollu ho tak započítá: test ukázal 1474 → 1474 px.
- **Opravená chyba fokusu:** po reloadu skočil fokus do pole e-mailu, protože vývojový režim React spouští efekty dvakrát. Teď se fokus přesune jen po akci uživatele (klik na CTA nebo úspěšné odeslání).
- **Zjednodušený event:** podmínka „`rc_form_view` až po odpovědi“ už není potřeba. Navíc by v soukromém okně bez úložiště event úplně zablokovala, proto jsem ji odstranil.

**Pozor na mou předchozí kontrolu:** před testem jsem zjistil, že dev server stál už od včerejška. Moje první kontrola HTML proto byla neplatná, dostala prázdnou odpověď. Po spuštění serveru jsem ji zopakoval a teprve ta platí.

Brief, tech-spec (6.5) a `decisions.md` odpovídají novému chování.

**Zbývá z technického seznamu:**
- **Tlačítko „Stáhnout tahák (PDF)“** vede na produkci na 404. Navrhuju ho skrýt, dokud PDF neexistuje.
- hero A/B podle UTM;
- event `rc_calculator_view`;
- metadata;
- push a nasazení: na GitHubu chybí 9 commitů;
- Lighthouse.

Mám pokračovat skrytím tlačítka PDF?

### 👤 Tom

> vzhledem k časovému pressu zkus ted vylepšit projekt animacemi z framer motion a doplnit chybějící texty smysluplně vzhledem ke kontextu. animace nesmí zpomalit načítací dobu. jedná se o lead magnet.

### 🤖 Claude Code

Udělám obojí. Dvě věci předem:

1. **Animace jdou proti pravidlu z CLAUDE.md** („Nepoužívat: … knihovny pro animace“). Teď o ně výslovně žádáš, takže pravidlo přepíšu a zapíšu jako rozhodnutí.
2. **Načítání nesmí zpomalit.** Animační kód načtu líně a jen pro interaktivní část (LazyMotion). Hero s nadpisem zůstane bez animace, aby se první vykreslení (LCP) nezdrželo. Animovat budu jen průhlednost a posun, ne rozměry, aby nevznikal posun obsahu (CLS). Při `prefers-reduced-motion` se animace vypnou.

U textů budu dodržovat pravidla projektu: žádné ručně psané částky, žádná doporučení, žádná daňová ani právní tvrzení bez zdroje. Kde text existuje v briefu (nabídka nad formulářem), použiju ho. Jen dva údaje vymýšlet nebudu, protože jde o právní prohlášení: **provozovatele** (jméno nebo firma, kontakt) a **právní základ a dobu uchování** v zásadách zpracování údajů.

Nejdřív si změřím, kolik JavaScriptu stránka stahuje teď, abych mohl porovnat dopad animací.

<details><summary>Nástroje (1)</summary>

- `Bash` – Measure baseline page JS size and check motion versions

</details>

### 🤖 Claude Code

Měřicí smyčka selhala na rozdělení seznamu souborů v zsh. Napíšu ji jako malý skript, který použiju i pro porovnání po změně.

<details><summary>Nástroje (5)</summary>

- `Bash` – Measure baseline page JS with node script
- `Bash` – Install motion and inspect its exports
- `Bash` – Verify motion/react API exports
- `Bash` – Check motion/react re-exports at runtime
- `Bash` – Add motion provider, variants and animated number hook

</details>

### 🤖 Claude Code

Teď animace v kvízu. Přečtu si aktuální podobu kontejneru, karty a mřížky.

<details><summary>Nástroje (4)</summary>

- `Read` – src/features/etf-reality-check/components/etf-reality-check/etf-reality-check.tsx
- `Read` – src/features/etf-reality-check/components/fund-card/fund-card.tsx
- `Bash` – Review pair grid and quiz step
- `Bash` – Animate quiz buttons, reveal, cards, badge, fee amounts

</details>

### 🤖 Claude Code

Typy sedí. V kontejneru se po obalení do `MotionProvider` rozjelo odsazení, srovnám ho ručně.

<details><summary>Nástroje (3)</summary>

- `Bash` – Fix indentation in container JSX
- `Bash` – Use popLayout for preview exit; show lead JSX
- `Bash` – Restructure lead card with animated step swaps and guide flag

</details>

### 🤖 Claude Code

Teď texty v `content/copy.ts`.

<details><summary>Nástroje (3)</summary>

- `Bash` – Read current copy file
- `Bash` – Fill missing texts in copy.ts
- `Bash` – Add FAQ and footer components, update page and privacy page

</details>

### 🤖 Claude Code

Testy prochází (264). Teď hlavní kontrola: kolik JavaScriptu přibylo pro první načtení.

<details><summary>Nástroje (1)</summary>

- `Bash` – Check hardcoded CSS, build and compare page JS size

</details>

### 🤖 Claude Code

Načítaný JavaScript vzrostl o 47 kB gzip (210 → 257 kB), to je víc, než jsem čekal. Zjistím, jestli se líně načítaný engine (30 kB) nestahuje hned při načtení stránky.

<details><summary>Nástroje (4)</summary>

- `Bash` – Break down initial chunks to find motion code
- `Bash` – Inspect how lazy chunk is referenced in HTML
- `Bash` – List motion imports per file
- `Bash` – Switch to motion/react-m and remeasure

</details>

### 🤖 Claude Code

Méně: z 257 na 229,6 kB, tedy zhruba +19 kB proti výchozím 210 kB. Podívám se, co ze zbytku tvoří `AnimatePresence`, `MotionConfig` a `LazyMotion` z `motion/react`.

<details><summary>Nástroje (3)</summary>

- `Bash` – Locate motion code in initial chunks
- `Bash` – Check for Chrome and lighthouse availability
- `Bash` – Run Lighthouse mobile 3x on build with animations

</details>

### 🤖 Claude Code

S animacemi: výkon 93, přístupnost 100, CLS 0, TBT 83 ms. LCP je ale 3,28 s, nad cílem 2,5 s z tech-specu. Teď stejné měření bez animací, ať vím, jestli LCP zhoršily ony.

<details><summary>Nástroje (1)</summary>

- `Bash` – Stash changes, measure baseline Lighthouse, restore

</details>

### 👤 Tom *(během práce)*

> použij tyto dva nove fonty misto tech predchozich <style>
> @import url('https://fonts.googleapis.com/css2?family=Outfit:[e-mail]&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
> </style>

<details><summary>Nástroje (5)</summary>

- `Bash` – Check new font availability and LCP element
- `Bash` – Dump LCP element audit details
- `Bash` – Find LCP-related audits and element snippet
- `Bash` – Show LCP element snippet and breakdown
- `Bash` – Switch fonts to Plus Jakarta Sans and Outfit

</details>

### 🤖 Claude Code

Písma jsou přepnutá. Teď je zkontroluju v prohlížeči: obě se musí načíst a mít všechna česká písmena. Pak projdu animace na mobilu.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Obě písma se načetla a mají všechna česká písmena. Podívám se, jak vypadá první obrazovka.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: computer`
- `Bash` – Tighten compact cards so values fit with new fonts
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Karty už nepřetékají a tlačítka končí na 576 px z 640, takže první obrazovka sedí. Teď projdu animace: kliknu na odpověď a podívám se na odhalení.

<details><summary>Nástroje (6)</summary>

- `Prohlížeč: tabs_context`
- `Prohlížeč: find`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Odhalení začíná novým prvním řádkem „Přesně tak.“ Můj posun ke formuláři přerušil plynulý posun k odhalení, zkusím to znovu.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Nabídka s textem z briefu a tlačítkem vypadá dobře. Vyzkouším výměnu tlačítka za formulář a stav po odeslání (s podvrženou odpovědí serveru) a projdu FAQ a patičku.

<details><summary>Nástroje (1)</summary>

- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Pole ještě nebylo na stránce: formulář se objeví až po dokončení odchodové animace tlačítka, a ta je ve skrytém panelu pomalejší. Prodloužím čekání.

<details><summary>Nástroje (14)</summary>

- `Prohlížeč: javascript_tool`
- `Bash` – Locate focus-related code in lead component
- `Bash` – Focus elements on mount via callback refs
- `Bash` – Remove unused useEffect import
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Switch swaps to popLayout, measure sync-loaded engine
- `Bash` – Lighthouse with sync engine and new fonts
- `Bash` – Test font-display optional for heading font
- `Bash` – Inspect observed vs simulated LCP and render-blocking
- `Bash` – Remove unused lazy features file, document sync engine
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Formulář se teď otevře okamžitě i ve skryté záložce a fokus skočí do pole. Na animaci nic nečeká. Zbývá dokumentace (CLAUDE.md, tech-spec, brief, README, rozhodnutí) a commit.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Update docs and decisions, run tests, build, checks
- `Bash` – Commit animations, fonts and texts

</details>

### 🤖 Claude Code

Animace, nová písma a doplněné texty jsou hotové a commitnuté (`a38ab2f`). Testy (264) i produkční build prochází. Na GitHubu ale ještě nejsou, lokálně je 9 nepushnutých commitů.

**Rychlost načítání se nezhoršila.** Lighthouse na mobilu (3 běhy, medián, lokální produkční build):

| | Výkon | LCP | TBT | CLS |
|---|---|---|---|---|
| Před animacemi | 94 | 3,13 s | 60 ms | 0 |
| S animacemi a novými písmy | 94 | 3,05 s | 100 ms | 0 |

- **Velikost:** stránka stahuje o 35 kB gzip víc JavaScriptu (210 → 245 kB). Animace ale nezdrží první vykreslení, protože obsah z prvního načtení stránky se neanimuje.
- **LCP kolem 3 s je chyba simulace,** ne skutečná hodnota. Lighthouse na lokálním serveru počítá LCP až od okamžiku, kdy je stránka interaktivní. Skutečně naměřený LCP je 0,1 s a stejné to bylo i bez animací. Skutečné hodnoty změřím po nasazení přes PageSpeed.

**Animace** (`motion`, nástupce framer-motion) běží jen po kliknutí:
- **Po odpovědi:** malé karty zmizí, odhalení najede postupně, karty fondů po skupinách, částky „přijdete o … Kč“ naběhnou od nuly a odznak „nejnižší TER“ se objeví s mírným odpružením.
- **Tlačítka odpovědí:** správná odpověď poskočí, špatná se zavrtí.
- **Formulář:** plynulá výměna tlačítko → formulář → potvrzení a animované chybové hlášky.
- **Bez animací:** při zapnutém omezení pohybu v systému se nic neanimuje a po obnovení stránky z úložiště také ne.

Animační kód se stahuje hned s kvízem, ne až později. Líné načtení by ušetřilo 15 kB, ale kdyby se ten kód nestáhl, odhalení by zůstalo neviditelné a formulář by se neotevřel. Formulář se navíc teď otevře okamžitě, na animaci nečeká. Před touhle úpravou čekal, ve skryté záložce se proto vůbec neotevřel a fokus se ztrácel.

**Písma** Outfit (nadpisy) a Plus Jakarta Sans (text) mají všechna česká písmena. Jsou širší, proto jsem upravil malé karty, aby se do nich vešlo „SPYM“ a „0,0945 %“. Tlačítka ANO / NE se na mobilu pořád vejdou na první obrazovku.

**Texty:**
- **Nabídka nad formulářem:** doslova z briefu.
- **Napsal jsem já, označené v `copy.ts` „Claude 16. 10.“, ke kontrole:**
  - první řádek odhalení: „Přesně tak.“ / „Tady je háček.“;
  - popisek pole a chybové hlášky;
  - potvrzení po odeslání;
  - FAQ (TER, KID/UCITS, akumulační/distribuční, měnové riziko), zdroje, metodika a upozornění;
  - popis stránky pro vyhledávače.
- **FAQ a patička** se teď zobrazují pod formulářem.
- **Zásady zpracování údajů** popisují, co web skutečně dělá: jaké údaje ukládá, kde, Umami a práva návštěvníků.

**Co jsem vědomě nevyplnil (právní údaje):** provozovatel a kontakt v patičce i v zásadách, účel a právní základ zpracování a doba uložení dat.

**Tlačítko PDF už nevede na 404.** Dokud PDF neexistuje, stránka stažení nenabízí a potvrzení říká, že tahák dokončujeme. Až PDF bude, stačí v `features/lead/lib/guide.ts` přepnout `GUIDE_AVAILABLE` na `true`.

Mám těch 9 commitů pushnout? Vercel je nasadí a pak změřím produkci přes PageSpeed.

### 👤 Tom

> <pasted_content id="cabb">
> Chci, abys kompletně přepracoval design a CSS moduly pro naši landing page. Inspiruj se vizuálními prvky a strukturou ze dvou webů:
> 1. Sheba Online (https://www.shebaonline.org/) – čistá typografie, důvěryhodný layout, přehledné karty a prémiová práce s whitespace.
> 2. Urban Tech Republic (https://urbantechrepublic.de/en/flaeche/terminal-b/) – moderní architektonický/fintech nádech, výrazná hierarchie nadpisů, čisté mřížky (grids) a ostré funkční kontrasty.
>
> Spoj tyto dva styly dohromady a aplikuj následující přísná pravidla:
>
> 1. **Celkový vizuální styl a pozadí:**
>    - Celá stránka MUSÍ mít čistě bílé pozadí (`background-color: #ffffff;`).
>    - Zachovej vysokou čitelnost a prémiový, vzdušný pocit (dostatečný padding a margin u všech sekcí).
>    - Všechny styly zapisuj do CSS Modulů (`.module.css`). Nepoužívej inline styly ani neumísťuj Tailwind do JSX.
>
> 2. **Typografie & Zvýraznění klíčových slov:**
>    - Zvětši celkovou velikost textů (základní text min. 18px / 1.125rem) pro perfektní čitelnost na desktopu i mobilu.
>    - BAREVNĚ ODĚL KLÍČOVÁ SLOVA: Klíčové pojmy (např. názvy fondů, poplatky, čísla, uspořené částky) odliš pomocí barevných akcentů (např. výrazná tmavě modrá/indigo pro neutrální fakta, varovná červená pro ztrátu na poplatcích a svěží zelená pro nejvýhodnější evropské dvojče).
>
> 3. **Speciální úprava hlavního nadpisu (Hero Headline):**
>    Nadpis "NENÍ ETF JAKO ETF" naformátuj přesně podle těchto pravidel:
>    - Nadpis bude rozdělen na DVA řádky:
>      * **1. řádek:** "NENÍ ETF"
>      * **2. řádek:** "JAKO ETF"
>    - **Každé slovo bude mít JINOU BARVU** (např. 1. slovo tmavě modrá, 2. slovo fialová/indigo, 3. slovo šedá/smaragdová, 4. slovo zelená – zvol estetickou a kontrastní paletu).
>    - **Velikosti písma na 1. řádku:**
>      * NENÍ = Velké písmo (obří font-size, font-weight: 800)
>      * ETF = Malé písmo (subtilnější font-size, např. poloviční oproti "NENÍ")
>    - **Velikosti písma na 2. řádku:**
>      * JAKO = Malé písmo (stejné merítko jako malé "ETF" z prvního řádku)
>      * ETF = Velké písmo (stejná obří velikost jako velké "NENÍ" z prvního řádku)
>    *(Tato vizuální asymetrie NENÍ etf / jako ETF má symbolizovat rozdíl v cenách a velikosti poplatků u fondů sledujících stejný index).*
>
> 4. **Karty fondů a porovnání:**
>    - Karty uprav podle vzoru Urban Tech Republic – čisté ohraničení (1px border), jemný shadow při hoveru (`transition: transform 0.2s ease`), dostatek vnitřního prostoru a výrazné barevně odlišené badge (např. "V ČR nekoupíte" vs. "✓ Nejnižší TER").
>
> Přepiš JSX komponentu i příslušný `.module.css` soubor a ujisti se, že kód zůstane sémantický a čistý.
> </pasted_content id="cabb">

### 🤖 Claude Code

Pustím se do toho. Nejdřív si oba weby otevřu ve vestavěném prohlížeči a podívám se, jak vypadají. Návrh pak opřu o to, co na nich skutečně je.

U zadání vidím tři střety s pravidly projektu a vyřeším je takto:
1. **„V ČR nekoupíte“:** odznak na amerických kartách napíšu jako **„V ČR obvykle nekoupíte“**. Bez „obvykle“ by tvrzení bylo nepravdivé, výjimky existují (profesionální klient).
2. **Inline styly:** jediný inline styl v JSX je proměnná `--progress` u jezdce. Nastavím ji přes `ref` mimo JSX.
3. **„Hero + otázka nad ohybem na 360 × 640“** z CLAUDE.md: větší písmo a obří nadpis budou tlačit tlačítka pod ohyb. Ověřím to a mezery doladím tak, aby se tlačítka na první obrazovku vešla.

<details><summary>Nástroje (6)</summary>

- `Prohlížeč: navigate` – https://www.shebaonline.org/
- `Prohlížeč: computer`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Bash` – Compute contrast of proposed accent colors on white
- `Read` – src/shared/styles/tokens.css
- `Write` – src/shared/styles/tokens.css

</details>

### 🤖 Claude Code

Odstranil jsem gradient a tokeny, které nový design nepotřebuje. Najdu jejich použití a opravím test kontrastu.

<details><summary>Nástroje (5)</summary>

- `Bash` – Find tokens used but no longer defined; show test pairs
- `Bash` – Update contrast test pairs; list undefined token usages
- `Bash` – Add RichText type, helpers, component and test
- `Bash` – Rich keyword segments in content, hero words, US badge
- `Bash` – Rebuild hero with asymmetric multicolor headline

</details>

### 🤖 Claude Code

Hero je hotový. Teď odhalení, jezdce (barevná souhrnná věta a odstranění inline stylu) a karty fondů.

<details><summary>Nástroje (4)</summary>

- `Bash` – Rich text in reveal and slider summary, remove inline style
- `Bash` – Restyle fund cards with borders, hover, badges, tones
- `Bash` – Restyle grid, quiz, reveal; review page and globals CSS
- `Bash` – Restyle page layout, globals, lead, FAQ and footer

</details>

### 🤖 Claude Code

Testy prochází (299). Zkontroluju, jestli kód nesahá na neexistující tokeny a jestli nikde nezůstala pevná barva nebo px.

<details><summary>Nástroje (20)</summary>

- `Bash` – Check undefined tokens, hardcoded values, inline styles
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Tighten mobile spacing and shorten preview source line
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Add above-the-fold margin on mobile
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: find`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: computer`
- `Prohlížeč: browser_batch`
- `Bash` – Make shared UCITS card sticky with content height
- `Bash` – Sticky only for shared twin group; fix indentation
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Karty VOO a VUAA jsou teď stejně vysoké, SPYL má výšku podle obsahu a je přichycená. Projdu zbytek stránky.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

FAQ vypadá čistě, chybí ale ukazatel, že jde položky rozbalit. Šipku `<summary>` zrušil `display: flex`. Přidám „+“ / „−“ vpravo. Pak zkontroluju formulář a desktop.

<details><summary>Nástroje (3)</summary>

- `Bash` – Add +/− disclosure indicator to FAQ
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Karta s nabídkou vypadá dobře: fialový pruh nahoře, velký nadpis a zelené fajfky. Teď desktop.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: computer`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Patička a zdroje vypadají dobře, „+“ u FAQ je vidět. Stránka se ale obnovila na uloženou pozici dole, takže se posunu nahoru k hero.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Bash` – Update docs, test, build and commit redesign

</details>

### 🤖 Claude Code

Redesign je hotový a commitnutý (`28eb498`). Prochází 299 testů i produkční build. Zkontroloval jsem ho v prohlížeči na mobilu (360 × 640) i na desktopu.

**Weby z inspirace jsem neviděl.** Sheba Online je za ochranou Cloudflare, kterou neobcházím, a panel prohlížeče byl ve chvíli kontroly skrytý, takže snímek nešel. Design proto vychází z tvého popisu (čistá typografie, hodně bílého místa, tenké rámečky, výrazná hierarchie a mřížka), ne ze skutečné podoby těch webů.

**Co se změnilo**
- **Pozadí** je čistě bílé, gradient je pryč. Sekce mají velké mezery a oddělují je tenké linky.
- **Text:** základní velikost je 18 px, drobné poznámky 16 px.
- **Hero nadpis:** dva řádky, „NENÍ“ velké + „ETF“ malé a pod tím „JAKO“ malé + „ETF“ velké, v poměru 2 : 1. Každé slovo má jinou barvu: navy, tvoje fialová, petrolejová, zelená.
- **Barevná klíčová slova** jsou zvýrazněná tučně, takže význam nenese jen barva:
  - **fakta** indigo: tickery, S&P 500, KID, vložená a hrubá částka;
  - **ztráta na poplatcích** červeně: částky na kartách i rozsah v souhrnné větě;
  - **nejvýhodnější evropské dvojče** zeleně: rámeček karty SPYL a „evropské dvojče“ v textu.
- **Karty:** rámeček 1 px, při najetí myší se jemně zvednou a dostanou stín (`transform 0.2s ease`).
  - Americké karty mají červený odznak **„V ČR obvykle nekoupíte“**. Slovo „obvykle“ jsem přidal, protože bez něj by tvrzení nebylo pravdivé (výjimkou je například profesionální klient).
  - SPYL má zelený odznak „✓ nejnižší TER“. Při posouvání zůstává přichycená vedle SPYM i SPY, takže pod ní už není prázdné místo.
- **Žádné inline styly:** jediný byl u jezdců a nahradil jsem ho nastavením přes `ref`.
- **FAQ** má vpravo ukazatel rozbalení „+“ / „−“.

**Jeden kompromis kvůli mobilu:** obří nadpis a větší text posunuly tlačítka ANO / NE na 698 px, tedy pod okraj první obrazovky (360 × 640). Na mobilu jsem proto zmenšil mezery v hero a zkrátil řádek se zdrojem TER na „TER podle dokumentů správců, ověřeno 15. 10. 2026.“ Velká slova nadpisu jsou na mobilu 61 px. Tlačítka teď končí na 616 px a na desktopu zůstává všechno vzdušné.

Lokálně čeká 10 nepushnutých commitů. Mám je pushnout, aby je Vercel nasadil?

### 👤 Tom

> 4 slova v není etf jako etf musí mít každé jinou barvu ale ne zelenou, protože tou svítí odpověď ne když ji user da sravne. zaroven chci aby každá dvojice etf měla jinou barvu pozadi ale pouize svetleho odstinu

### 🤖 Claude Code

Rozumím: zelená je vyhrazená pro správnou odpověď. Nadpis dostane čtyři barvy bez zelené (a bez červené, ta patří ztrátě) a každá dvojice fondů vlastní světlé pozadí. Zelené a červené odstíny pozadí vynechám ze stejného důvodu. Spočítám kontrasty kandidátů.

<details><summary>Nástroje (5)</summary>

- `Bash` – Compute contrasts for new hero colors and pair tints
- `Bash` – New hero colors and per-pair light backgrounds with tests
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Barvy sedí: slova nadpisu navy, fialová, modrá a jantarová, dvojice v modré, meruňkové a levandulové. Ještě se na to podívám.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Dvojice jsou na první pohled rozlišené. Zapíšu rozhodnutí a commitnu.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Record decisions and commit color changes

</details>

### 🤖 Claude Code

Hero nadpis už zelenou nepoužívá a každá dvojice fondů má vlastní světlé pozadí. Ověřil jsem to v prohlížeči a commitnul (`78dff8d`), 320 testů prochází.

**Hero nadpis** má čtyři barvy:

| Slovo | Barva | Kontrast |
|---|---|---|
| NENÍ | navy | 15,9 : 1 |
| ETF | tvoje fialová | 11,7 : 1 |
| JAKO | královská modrá | 6,7 : 1 |
| ETF | jantarová (ladí se žlutými tlačítky) | 5,0 : 1 |

Červenou jsem taky vynechal, protože na stránce znamená ztrátu na poplatcích.

**Pozadí dvojic** (obě karty dvojice stejně):

| Dvojice | Pozadí |
|---|---|
| VOO ↔ VUAA | světle modrá |
| IVV ↔ SXR8 | meruňková |
| SPYM + SPY ↔ SPYL | levandulová |

Zelené a červené odstíny jsem ze stejného důvodu nepoužil. Všechny texty na nových pozadích mají kontrast aspoň 5,7 : 1 a hlídá to test.

Americké karty už nejsou šedé. Odlišuje je jen červený odznak „V ČR obvykle nekoupíte“. SPYL má dál zelený rámeček a odznak „nejnižší TER“, ten jsi chtěl ty pro nejvýhodnější evropské dvojče. Pokud má zelená zůstat jen u odpovědi NE, změním ho.

Lokálně čeká 11 commitů, které ještě nejsou na GitHubu ani na Vercelu. Mám je pushnout?

### 👤 Tom

> sekce 
>
> Můžete si je koupit v Česku?
> ✗ ANO– špatně
> NE
>
>
> chci aby byla v rámečku s úplně jiným pozadím než je bílá barva page. 
>
> stejně tak sekce 
>
> <pasted_content id="cabb">
> Tohle byl jen S&P 500. Co když chcete víc než Ameriku?
> Evropská dvojčata dalších populárních ETF a jak z nich poskládat celé portfolio najdete v taháku:
>
> * ✓ evropská dvojčata populárních NYSE ETF, nejen na S&P 500
> * ✓ jak poskládat celý svět ze dvou až tří fondů
> * ✓ na co si dát pozor u českého brokera a u daní
>
> CHCI KOMPLETNÍ SROVNÁNÍ V PDF
> </pasted_content id="cabb">
>
> do karty jiné barvy. zkus pozadí u obou karet udelat zajimave  pismo samozrejhme taky jinou barvou

### 🤖 Claude Code

Otázku dám do tmavé navy karty s jemnou architektonickou mřížkou a formulář s nabídkou do sytě fialové karty se světlým odleskem. Text v obou bude bílý.

Na tmavém pozadí musím změnit tři věci, jinak by přestaly být čitelné:
- **rámeček fokusu** (fialový by na navy zmizel);
- **chybová hláška** (červená na fialové);
- **fajfky** (tmavě zelené na fialové).

Spočítám kontrasty.

<details><summary>Nástroje (9)</summary>

- `Bash` – Compute contrasts for dark quiz and lead cards
- `Bash` – Dark navy quiz card and purple lead card with contrast tests
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Bash` – Tighten mobile quiz card to fit above the fold
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Navy karta s odleskem se celá vejde na první obrazovku (končí na 588 px). Zkusím špatnou odpověď ANO, ať vidím červené tlačítko na navy, a pak fialovou kartu s nabídkou.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Fialová karta s odleskem, bílým textem a žlutými fajfkami vypadá dobře. Zkontroluju ještě navy kartu po odpovědi ANO, předchozí posun přebil plynulý posun k odhalení.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Červené tlačítko ANO má na navy bílý obrys a je dobře vidět. Jemná mřížka v pozadí je patrná. Commitnu to.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Check, record decision, build and commit

</details>

### 🤖 Claude Code

Obě sekce jsou teď v barevných kartách. Ověřil jsem to v prohlížeči na mobilu a commitnul (`3b67191`), 334 testů i produkční build prochází.

**Otázka „Můžete si je koupit v Česku?“** je v tmavé navy kartě s jemnou mřížkou a světlejším odleskem v rohu. Otázka je bílá, tlačítka ANO / NE zůstávají žlutá. Po odpovědi má zvolené tlačítko bílý obrys, jinak by červené ANO na navy splývalo.

**Nabídka PDF** je v sytě fialové kartě (tvoje `#57008E`) se světlejšími odlesky ve dvou rozích. Nadpis i text jsou bílé, fajfky a rámeček fokusu žluté, tlačítko CTA žluté.

Na tmavém pozadí jsem musel upravit tři věci:
- **chybová hláška** ve formuláři je světle korálová, protože červená by na fialové nebyla čitelná;
- **poznámky pod tlačítkem** jsou světle levandulové;
- **rámeček fokusu** je žlutý.

Všechny kombinace mají kontrast aspoň 7 : 1 a hlídá je test.

**První obrazovka na mobilu:** aby se navy karta celá vešla na 360 × 640, zmenšil jsem na mobilu její vnitřní okraj a otázku z 28 na 22 px. Karta končí na 588 px. Na desktopu je karta vzdušnější a otázka větší.

Lokálně čeká 12 nepushnutých commitů (od AI logu po tuhle úpravu). Mám je pushnout? Vercel je pak nasadí a můžu změřit produkci přes PageSpeed.

### 👤 Tom

> slovo není v nadpisu musí mít jinou barvu než karta s otázkou.

### 🤖 Claude Code

„NENÍ“ je teď navy `#0b1f4d`, stejně jako pozadí karty s otázkou. Pro náhradu vylučuju barvy, které už na stránce něco znamenají: zelenou (správná odpověď), červenou (ztráta), fialovou, modrou a jantarovou (ostatní slova nadpisu) i tmavou navy. Spočítám kontrast kandidátů.

<details><summary>Nástroje (4)</summary>

- `Bash` – Compute contrast for NENÍ color candidates
- `Bash` – Change NENÍ color, record decision, commit
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Slovo „NENÍ“ je teď petrolejové (`#0e7490`), karta s otázkou zůstává navy. V prohlížeči jsem ověřil, že se barvy liší, commit `94b7bd3`, testy prochází.

Petrolejovou jsem vybral, protože od navy karty se liší nejvíc odstínem i jasem. Zároveň se nepere s barvami, které na stránce už něco znamenají: zelená je správná odpověď, červená ztráta a fialová a modrá jsou další slova nadpisu. Na bílém pozadí je dobře čitelná (5,4 : 1).

Nadpis má teď barvy petrolejová / fialová / modrá / jantarová.

Na GitHubu zatím nic není, lokálně čeká 13 commitů. Mám je pushnout a nasadit na Vercel?

### 👤 Tom

> označil jsem zónu stránky kde by se vešel dobrý vizuál, nepříklad nejaká metafora americké a evropské vlajky

*(příloha: snímek obrazovky s vyznačenou zónou pro vizuál)*

### 🤖 Claude Code

Rozumím: vpravo nahoře vedle nadpisu je volné místo pro vizuál. Navrhuju **„dvojčata vlajek“**: dvě stylizované karty přes sebe, vzadu americká vlajka (pruhy a modré pole s hvězdami), vpředu evropská (modrá s kruhem 12 hvězd). Je to přímá metafora toho, o čem stránka je: americký fond a jeho evropské dvojče.

Technicky:
- **Žádné obrázky ani knihovny:** inline SVG vykreslený na serveru, bez dalšího stahování a bez JavaScriptu.
- **Layout se nehne:** obrázek je umístěný absolutně, takže se nic neposune a tlačítka zůstanou nad ohybem.
- **Pro čtečky je skrytý** (`aria-hidden`), je čistě dekorativní.
- **Barvy vlajek** jdou z tokenů v `tokens.css`, ne natvrdo v kódu.
- **Pohyb:** jen jemné pomalé vznášení přes CSS, které se při omezení pohybu vypne.

Na 360 px je vedle „NENÍ ETF“ málo místa, takže velikost doladím podle měření, aby obrázek nepřekryl text.

<details><summary>Nástroje (2)</summary>

- `Bash` – Create FlagTwins inline SVG component and flag tokens
- `Bash` – Separate float animation from SVG rotation

</details>

### 🤖 Claude Code

Typy sedí. Odsazení vnořených skupin srovnám přepsáním návratové části komponenty.

<details><summary>Nástroje (1)</summary>

- `Bash` – Reformat SVG component and place it in hero

</details>

### 🤖 Claude Code

Vlajky jsou na místě. Změřím v prohlížeči na šířkách 360, 390 a 1280 px, jestli nepřekrývají slova nadpisu ani podnadpis.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Na 360 px se nic nepřekrývá: slova končí na 234 px a vlajky začínají na 247 px. Tlačítka zůstávají na 572 px a nic nepřetéká do strany. Podívám se na to.

<details><summary>Nástroje (1)</summary>

- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Vlajky vypadají dobře. Zbývá kontrola na 390 px (rozměr z tvého snímku) a na desktopu.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Ani na 390 px, ani na desktopu se nic nepřekrývá a vlajky se na větší šířce zvětší až na 240 px. Commitnu to.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Check, record decision, build and commit flags visual

</details>

### 🤖 Claude Code

Do označeného místa jsem dal vizuál **„dvojčata vlajek“**: vzadu stylizovaná americká vlajka (pruhy a modré pole s hvězdami), vpředu evropská (modrá s kruhem 12 hvězd), obě mírně natočené přes sebe. Je to metafora toho, o čem stránka je: americký fond a jeho evropské dvojče. Ověřil jsem to v prohlížeči a commitnul (`5cd7acb`), 334 testů i produkční build prochází.

- **Načítání nezpomaluje:** je to SVG přímo ve stránce ze serveru, bez obrázku ke stažení a bez JavaScriptu.
- **Nic neposouvá:** vizuál neovlivňuje rozložení stránky. Tlačítka ANO / NE na mobilu zůstávají na 572 px z 640.
- **Nepřekrývá text:** měřil jsem na 360 px, 390 px (tvůj telefon) i na desktopu, kde se vlajky zvětší až na 240 px.
- **Pohyb:** vlajky se jemně a pomalu vznášejí proti sobě. Pokud má návštěvník v systému omezený pohyb, stojí.
- **Pro čtečky obrazovky** je vizuál skrytý, je čistě dekorativní.

Na GitHubu zatím nic není, lokálně čeká 14 commitů. Mám je pushnout a nasadit na Vercel?

### 👤 Tom

> jestli tě napadnou nějaké další vizuální prvky jako emoji nebo šipky

### 🤖 Claude Code

Napadá mě několik prvků. Emoji ale nedoporučuju: na Windows se některá zobrazí jinak nebo vůbec (vlajky z nich na Windows nefungují), každý systém je kreslí jinak a do tvého čistého stylu by nezapadla. Všechno níže by byly vlastní malé SVG nebo CSS, bez knihoven a bez dopadu na načítání. Vyber, co chceš:

<details><summary>Nástroje (2)</summary>

- `AskUserQuestion`
- `Bash` – Create own SVG icon components

</details>

### 🤖 Claude Code

Typ názvů ikon přesunu do `shared`, aby `content/` importoval ze `shared/` a ne naopak. Jinak by vznikla kruhová závislost. Pak ikony přiřadím k bodům nabídky a k otázkám FAQ.

<details><summary>Nástroje (1)</summary>

- `Bash` – Move icon type to shared; add icons to copy

</details>

### 🤖 Claude Code

Teď formulář: ikony u bodů nabídky a šipka v CTA tlačítku, která se při najetí posune doprava.

<details><summary>Nástroje (1)</summary>

- `Bash` – Add icons to lead benefits and arrow to CTA

</details>

### 🤖 Claude Code

Teď FAQ: ikona u každé otázky.

<details><summary>Nástroje (2)</summary>

- `Bash` – Add icons to FAQ questions
- `Bash` – Add pair arrows and fee bars with tokens

</details>

### 🤖 Claude Code

Jedna náhrada nesedí na text v kontejneru: změnilo se odsazení. Tokeny se už zapsaly, zbytek ne. Podívám se na přesný text.

<details><summary>Nástroje (2)</summary>

- `Bash` – Inspect FundPairGrid usage indentation
- `Bash` – Apply pair arrows and fee bars edits

</details>

### 👤 Tom *(během práce)*

> věta: pojmy která americká videa nevysvětlí se musí změnit na něco obecnějšího

### 🤖 Claude Code

Nadpis FAQ změním z „Pojmy, které americká videa nevysvětlí“ na obecnější **„Pojmy, které se vyplatí znát“**. Pak zkontroluju šipky, proužky a ikony v prohlížeči.

<details><summary>Nástroje (5)</summary>

- `Bash` – Change FAQ heading to a more general phrase
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Hodnoty jsou správně: VOO 0,32 (4 557 / 14 295 Kč), VUAA 0,74, SPY 1,0 jako nejdražší. Nulová šířka je jen tím, že skrytý panel neodehrává CSS přechody. Zkusím snímek obrazovky.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Funguje to: proužky ukazují rozdíl na první pohled (VOO krátký, VUAA delší) a kulaté šipky spojují každý pár. Zkontroluju ještě ikony u nabídky a FAQ.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

*(Kontext konverzace se zaplnil a aplikace ho automaticky shrnula; práce pokračuje navázáním na shrnutí.)*

### 🤖 Claude Code

Ikony i nadpis FAQ sedí. Vracím viewport, spouštím testy a build.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: resize_window`
- `Bash`
- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Hotovo, všechny čtyři vizuální prvky jsou na stránce a nadpis FAQ je obecnější. Prošel jsem to v prohlížeči na 360 × 640 a testy prošly (341), typová kontrola je bez chyb.

- **Šipky mezi páry:** mezi americkou a evropskou kartou každého páru je kulatá šipka →, takže je hned vidět, který fond je dvojče kterého.
- **Proužek poplatku:** pod částkou na každé kartě je červený proužek. Jeho délka ukazuje, kolik fond stojí na poplatcích v porovnání s nejdražším fondem ve výpočtu. Mění se s jezdci a čísla bere jen z výpočtu, nic není napsané ručně. Například VOO má krátký proužek, VUAA zhruba tři čtvrtiny.
- **Šipka v CTA tlačítku:** při najetí myší nebo fokusu se trochu posune doprava.
- **Ikony:** tři u bodů nabídky PDF (žluté) a čtyři u otázek ve FAQ (%, štít, šipky dokola, výměna). Nejsou to emoji, protože ta vypadají na každém telefonu jinak. Jsou to vlastní jednoduché obrázky, žádná knihovna ikon.
- **Nadpis FAQ:** teď zní „Pojmy, které se vyplatí znát“.

Rozhodnutí jsem zapsal do `docs/decisions.md` a uložil jako commit `a9db153`.

Na GitHubu zatím není 15 commitů, takže produkce na Vercelu ještě ukazuje starší verzi. Mám je pushnout, aby se Vercel nasadil znovu?

### 👤 Tom

> zkontroluj unit testy, správnost kalkulaček, udelej push na github, deploy na vercelu.

<details><summary>Nástroje (1)</summary>

- `Bash`

</details>

### 🤖 Claude Code

Testy procházejí (341/341). Teď ověřím výpočet nezávisle: spec, předpoklady a ruční přepočet.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Spec má referenční hodnoty. Přepočítám je nezávisle v Pythonu (jiná implementace než TS) a projdu i krajní hodnoty jezdců.

<details><summary>Nástroje (3)</summary>

- `Bash`
- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Výpočet sedí na haléř se specem i s nezávislou simulací měsíc po měsíci, včetně krajních hodnot jezdců. Teď zkontroluju čísla přímo na stránce (souhrn a hero).

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Všechna čísla na stránce odpovídají nezávislému přepočtu. Před pushem ještě ověřím produkční build.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Push je hotový. Vercel nasazuje automaticky po pushi, tak počkám a ověřím produkci.

<details><summary>Nástroje (5)</summary>

- `Bash`
- `Prohlížeč: preview_start` – https://etf-reality-check.vercel.app/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_console_messages`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Kalkulačka počítá správně a produkce na https://etf-reality-check.vercel.app běží s nejnovější verzí.

- **Unit testy:** všech 341 prošlo a typová kontrola je bez chyb. Produkční build s přísnou kontrolou dat taky prošel.
- **Kalkulačka:**
  - Výpočet jsem přepočítal v Pythonu jinou cestou než aplikace a navíc ho nasimuloval měsíc po měsíci.
  - Obojí se shoduje na haléř s referenčními hodnotami v tech-specu: bez poplatků 1 360 315,90 Kč; ztráta na poplatcích 3 039,65 / 4 556,57 / 10 605,01 / 14 294,51 Kč pro TER 0,02 / 0,03 / 0,07 / 0,0945 %.
  - Sedí to i při krajních polohách jezdců (500 Kč až 20 000 Kč, 1 až 40 let, výnos 2 až 10 %).
  - Nesmyslné vstupy (text, hodnota mimo rozsah) se správně vrátí na výchozí hodnotu nebo na hranici rozsahu.
  - Fond bez ověřeného TER nemá částku a nic nespadne.
  - Tyto ověřovací testy byly jen dočasné a do projektu jsem je nepřidal.
- **Čísla na stránce:** lokálně i na produkci se shodují s přepočtem. Karty fondů ukazují 4 557 / 10 605 / 3 040 / 14 295 Kč a souhrn pod jezdci říká, že vložíte 720 000 Kč a bez poplatků by to bylo 1 360 316 Kč.
- **Push:** všech 15 commitů je na GitHubu, poslední je `a9db153`.
- **Vercel:** nasadil se sám asi za 45 s po pushu.
- **Produkce:** ověřil jsem:
  - nový nadpis FAQ;
  - proužky poplatků u všech 7 karet;
  - tlačítko „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“, formulář se otevírá až po kliknutí na něj;
  - Umami je načtené;
  - v konzoli nejsou žádné chyby.

Při kontrole produkce jsem v kvízu jednou klikl na „NE“, takže v Umami bude jedna moje testovací odpověď. Formulář jsem neodesílal, do databáze se nic nezapsalo.

### 👤 Tom

> Vložíte 1 920 000 Kč. Bez poplatků by to modelově bylo 3 430 924 Kč, poplatky z toho uberou 7 607 Kč až 35 771 Kč podle fondu. tento text uprav tak aby lépe specifikoval co částky znamenají , rozděl na více řásků a částky lépe zvýrazni.

<details><summary>Nástroje (3)</summary>

- `Bash`
- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Rozdělím souhrn na čtyři řádky. Každý bude mít popisek, krátké vysvětlení a velkou částku.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Sjednotím breakpoint na 40rem jako zbytek projektu a zkontroluju to v prohlížeči.

<details><summary>Nástroje (5)</summary>

- `Bash`
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Vypadá to přehledně. Zkrátím vysvětlivky u poplatků, ať se vejdou na jeden řádek, a podívám se na desktop.

<details><summary>Nástroje (6)</summary>

- `Bash`
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Na desktopu jsou částky vpravo na řádku. Teď upravím dokumenty a commitnu.

<details><summary>Nástroje (1)</summary>

- `Bash`

</details>

### 🤖 Claude Code

Souhrn pod jezdci už není jedna věta. Má teď čtyři řádky a každý řádek popisek, krátké vysvětlení a velkou tučnou částku:

| Popisek | Vysvětlení | Částka |
|---|---|---|
| **Celkem vložíte** | 3 000 Kč měsíčně po dobu 20 let | **720 000 Kč** (modrá) |
| **Modelová hodnota bez poplatků** | vklady i zhodnocení 6 % ročně, kdyby fond nic nestál | **1 360 316 Kč** (modrá) |
| **Poplatky fondu vám uberou nejméně** | fond s nejnižším TER ve srovnání | **3 040 Kč** (červená) |
| **Poplatky fondu vám uberou nejvíce** | fond s nejvyšším TER ve srovnání | **14 295 Kč** (červená) |

- **Poznámka pod řádky:** „Ztráta na poplatcích zahrnuje i zhodnocení, o které vás poplatky během let připraví.“
- **Hodnoty v textu:** měsíční vklad, počet let a výnos ve vysvětlivkách se mění podle jezdců. Čísla v tabulce jsou pro výchozí nastavení.
- **Rozložení:** na mobilu (360 px) je částka pod popiskem a stránka se nikam neroztahuje do strany. Na širší obrazovce je částka vpravo na stejném řádku. Desktop jsem kontroloval jen měřením rozložení, snímek se neudělal, protože panel prohlížeče byl skrytý.
- **Čtečky obrazovky:** výsledek se jim dál ohlásí při každé změně jezdce.

Testy prošly (349) a typová kontrola je bez chyb. Upravil jsem `brief.md` a tech-spec, rozhodnutí je v `docs/decisions.md` a změna je v commitu `63819e9`.

Zatím to není na GitHubu, takže produkce na Vercelu ukazuje ještě starou větu. Mám to pushnout?

### 👤 Tom

> řekni mi výsledky z lighthoouse kdyby tato verze stranky byla finalni

### 🤖 Claude Code

Lighthouse na kvíz neklikne, takže souhrn pod jezdci vůbec nevidí. Produkce se od lokální verze liší jen v něm, a proto pustím Lighthouse rovnou na produkci přes PageSpeed Insights, kde běží skutečné prostředí Vercelu (CDN a komprese).

<details><summary>Nástroje (1)</summary>

- `Bash`

</details>

### 🤖 Claude Code

Anonymní kvóta API PageSpeed je vyčerpaná. Zkusím webové rozhraní PageSpeed Insights ve vestavěném prohlížeči.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: preview_start` – https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fetf-reality-check.vercel.app%2F&form_factor=mobile
- `Prohlížeč: computer`
- `Prohlížeč: get_page_text`
- `Prohlížeč: computer`
- `Prohlížeč: get_page_text`

</details>

### 🤖 Claude Code

Mobil je hotový. Zjistím ještě, co je LCP prvek, a pustím desktop.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: find`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: navigate` – https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fetf-reality-check.vercel.app%2F&form_factor=desktop
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Mezitím si lokálně ověřím, proč je LCP prvkem nadpis FAQ.

<details><summary>Nástroje (10)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – https://etf-reality-check.vercel.app/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: resize_window`
- `Prohlížeč: get_page_text`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Mobilní výsledky už mám, desktopový běh PageSpeed se zasekl, tak ho otevřu z výsledků mobilního běhu.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: navigate` – https://pagespeed.web.dev/analysis/https-etf-reality-check-vercel-app/5uret79nin?form_factor=desktop
- `Prohlížeč: javascript_tool`

</details>

### 👤 Tom *(během práce)*

> toto je puvodni verze reklamy jako výchozí výstup z claude. udělej  novou verzi reklamy která je designově kompatibilní s landing page
>
> *(příloha: obrázek – původní tmavá reklama)*

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: get_page_text`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Desktop má výsledek 100 / 100 / 100 / 100. Teď se pustím do reklamy. Nejdřív najdu, co o reklamách říká brief a jestli už v repu existují.

<details><summary>Nástroje (6)</summary>

- `Bash`
- `Bash`
- `Bash`
- `Bash`
- `Bash`
- `Write` – scripts/build-ads.ts

</details>

### 👤 Tom *(během práce)*

> VOO, IVV, SPYM a SPY jsou populární americká ETF
> všechny sledují stejný index S&P 500
> Liší se poplatkem (TER)
>
> udělej z toho věty oddělené tečkou

### 🤖 Claude Code

Upravím podnadpis hero na věty s tečkou a pak dodělám reklamu.

<details><summary>Nástroje (4)</summary>

- `Bash`
- `Bash`
- `Bash`
- `Read` – ads/reklama-a.png

</details>

### 🤖 Claude Code

Reklama se nevešla: vlajky překrývají „ETF“ a CTA je oříznuté. Zmenším nadpis, posunu vlajky doprava ke druhému řádku a zhustím mezery.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Read` – ads/reklama-a.png

</details>

### 🤖 Claude Code

Reklama teď sedí. Doplním k ní podklady (`ads/reklama-a.md` podle briefu kap. 9), skript `build:ads`, zápis do decisions a pak commitnu.

<details><summary>Nástroje (3)</summary>

- `Bash`
- `Write` – ads/reklama-a.md
- `Bash`

</details>

### 🤖 Claude Code

Ověřím v prohlížeči nový podnadpis a commitnu.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Bash`
- `SendUserFile`

</details>

### 🤖 Claude Code

## Lighthouse

Měřil jsem přes PageSpeed Insights na produkci na Vercelu. Lighthouse na kvíz neklikne, takže souhrn pod jezdci, který na produkci ještě chybí, by výsledek nezměnil. Výsledek by platil i pro finální verzi.

| | Výkon | Přístupnost | Best Practices | SEO |
|---|---|---|---|---|
| **Mobil** (Moto G Power, pomalé 4G) | **91** | 100 | 100 | 100 |
| **Desktop** | **100** | 100 | 100 | 100 |

- **Mobil:** stránka se začne vykreslovat za 1,5 s, největší prvek je vidět za 3,3 s a hlavní vlákno blokuje 10 ms. Obsah při načítání neposkakuje (CLS 0).
- **Desktop:** největší prvek je vidět za 0,6 s, blokování 10 ms, CLS 0.
- **Co drží mobil pod 100:** zhruba 1,5 s z doby do největšího prvku čeká stránka na vykreslení textu, nejspíš na načtení písem. Lighthouse jako největší prvek označil nadpis FAQ, protože bez odpovědi v kvízu je stránka krátká a FAQ je hned pod otázkou. Navrhuje ještě ubrat asi 111 KiB nepoužitého JavaScriptu.

Pro lead magnet je to dobrý stav. Pokud chcete na mobilu víc, další krok je zrychlit vykreslení písma v nadpisech.

## Podnadpis hero
Podnadpis jsou teď tři věty s tečkou: „VOO, IVV, SPYM a SPY jsou populární americká ETF. Všechny sledují stejný index S&P 500. Liší se poplatkem (TER).“ Ověřil jsem to v prohlížeči a upravil i `brief.md` a README.

## Reklama A
Nová kreativa je v [ads/reklama-a.png](ads/reklama-a.png) (1080 × 1350, Meta feed 4:5) a vypadá jako landing page:
- bílé pozadí a nadpis „NENÍ etf / jako ETF“ ve stejných barvách a poměru velikostí jako hero;
- vlajky USA a EU jako na stránce;
- 4 karty fondů se světlými pozadími dvojic, TER červeně;
- otázka „Které si koupíte v Česku?“ v tmavě modré kartě a žluté tlačítko „Otestujte se jednou otázkou →“;
- dole zdroj TER s datem ověření.

Kreativu vytváří nový příkaz `npm run build:ads`. Tickery, index, TER i datum bere z `data/etf.json` a barvy z `tokens.css`, takže reklama se stránkou neplete čísla ani barvy. Kdyby fondy přestaly sledovat stejný index, skript skončí chybou.

Podklady podle briefu jsou v [ads/reklama-a.md](ads/reklama-a.md): texty pro Meta, URL s UTM, popis vizuálu a zdroj ke každému tvrzení. Hlavní text pro Meta jsem napsal sám, projděte si ho prosím.

Reklama B zatím není, protože podle briefu čeká na vaše schválení.

Testy prošly (351), změny jsou ve 3 commitech, které ještě nejsou na GitHubu. Mám je pushnout?

### 👤 Tom

> *(příkaz „Create PR“ z aplikace)*

### 🤖 Claude Code

Pracujete přímo na `main`, takže PR z `main` do `main` udělat nejde. Tři nepushnuté commity přesunu na novou větev a PR otevřu z ní do `main`.

<details><summary>Nástroje (1)</summary>

- `Bash`

</details>

### 🤖 Claude Code

`gh` tu není nainstalovaný. Pushnu aspoň větev, PR pak půjde otevřít jedním klikem.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

PR jsem neotevřel: na tomhle počítači chybí GitHub CLI (`gh`) a nainstalovat ho bez vašeho souhlasu nechci.

Udělal jsem tohle:
- **Nová větev:** všechny změny byly commitnuté přímo na `main` a PR z `main` do `main` nejde. Tři nové commity jsem proto přesunul na větev `feat/souhrn-reklama-a`, kterou jsem pushnul na GitHub (testy prošly, 351).
- **Lokální `main`:** vrátil jsem ho na stav GitHubu, takže se do něj nic neslilo a Vercel zatím nic nového nenasadil. Commity nezmizely, jsou na nové větvi.

PR otevřete tímto odkazem. Název i popis (co se mění, proč, na co se při review podívat) jsou v něm už vyplněné, stačí kliknout na „Create pull request“:

[Otevřít PR na GitHubu](https://github.com/tominator633/etf-reality-check/compare/main...feat/souhrn-reklama-a?quick_pull=1&title=Souhrn%20kalkula%C4%8Dky%20v%20%C5%99%C3%A1dc%C3%ADch%2C%20podnadpis%20hero%20ve%20v%C4%9Bt%C3%A1ch%2C%20reklama%20A%20v%20designu%20str%C3%A1nky&body=%23%23%20Co%20se%20m%C4%9Bn%C3%AD%0A-%20%2A%2ASouhrn%20pod%20jezdci%2A%2A%3A%20m%C3%ADsto%20jedn%C3%A9%20v%C4%9Bty%204%20%C5%99%C3%A1dky%20%28vlo%C5%BEeno%2C%20modelov%C3%A1%20hodnota%20bez%20poplatk%C5%AF%2C%20nejni%C5%BE%C5%A1%C3%AD%20a%20nejvy%C5%A1%C5%A1%C3%AD%20ztr%C3%A1ta%20na%20poplatc%C3%ADch%29%2C%20ka%C5%BEd%C3%BD%20s%20popiskem%2C%20vysv%C4%9Btlen%C3%ADm%20a%20velkou%20%C4%8D%C3%A1stkou.%20S%C3%A9manticky%20%60%3Cdl%3E%60%2C%20d%C3%A1l%20%60aria-live%60.%0A-%20%2A%2AHero%20A%2A%2A%3A%20podnadpis%20jako%20t%C5%99i%20v%C4%9Bty%20s%20te%C4%8Dkou.%0A-%20%2A%2AReklama%20A%2A%2A%20%28%60ads%2Freklama-a.png%60%2C%201080%20%C3%97%201350%29%3A%20v%20designu%20landing%20page%2C%20generuje%20ji%20%60npm%20run%20build%3Aads%60%20z%20%60data%2Fetf.json%60%20a%20%60tokens.css%60.%20Podklady%20%28texty%2C%20UTM%2C%20zdroje%20tvrzen%C3%AD%29%20v%20%60ads%2Freklama-a.md%60.%0A%0A%23%23%20Pro%C4%8D%0APo%C5%BEadavky%20Toma%2016.%2010.%202026%3A%20souhrn%20m%C3%A1%20l%C3%A9pe%20vysv%C4%9Btlit%2C%20co%20%C4%8D%C3%A1stky%20znamenaj%C3%AD%3B%20p%C5%AFvodn%C3%AD%20tmav%C3%A1%20reklama%20z%20pl%C3%A1nov%C3%A1n%C3%AD%20neladila%20se%20str%C3%A1nkou.%0A%0A%23%23%20Na%20co%20se%20pod%C3%ADvat%0A-%20V%C3%BDpo%C4%8Det%20se%20nem%C4%9Bn%C3%AD%20%28%60projection.ts%60%29%3B%20hodnoty%20ov%C4%9B%C5%99eny%20nez%C3%A1visl%C3%BDm%20p%C5%99epo%C4%8Dtem%20proti%20tech-spec%205.1%20a%20v%20prohl%C3%AD%C5%BEe%C4%8Di.%0A-%20Hlavn%C3%AD%20text%20reklamy%20pro%20Meta%20napsal%20Claude%20%E2%80%93%20k%20revizi.%20Reklama%20B%20%C4%8Dek%C3%A1%20na%20schv%C3%A1len%C3%AD.%0A-%20%60brief.md%60%2C%20tech-spec%2C%20%60CLAUDE.md%60%20a%20%60docs%2Fdecisions.md%60%20aktualizov%C3%A1ny.%0A-%20%60npm%20run%20test%60%3A%20351%20test%C5%AF%20pro%C5%A1lo%2C%20%60tsc%60%20bez%20chyb.%0A%0A%F0%9F%A4%96%20Generated%20with%20%5BClaude%20Code%5D%28https%3A%2F%2Fclaude.com%2Fclaude-code%29)

Jestli chcete, aby příště PR otevíral přímo Claude, nainstalujte a přihlaste GitHub CLI:

```bash
brew install gh
```

```bash
gh auth login
```

Až PR otevřete, pošlete mi jeho odkaz a navážu ho na tuhle session, abych mohl sledovat CI.

### 👤 Tom

> chci aby tickery na kartách měly tmavou verzi barvy svého pozadí karty jak na landing page tak v paralelně v reklamním banneru

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Bash`

</details>

### 🤖 Claude Code

Na každý pár přidám token „tmavé verze“ pozadí. Skupina páru ho předá kartám (stejně jako teď `--pair-bg`) a reklama použije stejné tokeny.

<details><summary>Nástroje (3)</summary>

- `Bash`
- `Read` – ads/reklama-a.png
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Reklama je hotová. Teď ověřím barvy tickerů na stránce.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: javascript_tool`
- `Bash`
- `Bash`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Malé karty teď odpovídají reklamě. Zapíšu rozhodnutí a commitnu.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `SendUserFile`

</details>

### 🤖 Claude Code

Tickery mají teď tmavou verzi barvy pozadí své karty, na stránce i v reklamním banneru. Obojí bere barvy ze stejného místa, takže budou vždycky stejné.

| Dvojice | Pozadí karty | Ticker |
|---|---|---|
| VOO ↔ VUAA | světle modrá | tmavě indigová |
| IVV ↔ SXR8 | meruňková | tmavě jantarová |
| SPYM, SPY ↔ SPYL | levandulová | tmavě fialová |

- **Landing page:** tickery na velkých kartách srovnání jsou v barvě své dvojice, ověřeno v prohlížeči. Platí to i pro evropský fond s nejnižším TER, který dřív měl zelený ticker. Zelený rámeček a odznak „nejnižší TER“ mu zůstaly.
- **Malé karty nad otázkou:** měly šedé pozadí, kdežto v banneru jsou podbarvené podle dvojice. Aby stránka a banner vypadaly stejně, dostaly i ony pozadí a ticker své dvojice. Velikost karet se nezměnila, takže horní část stránky se pořád vejde na první obrazovku telefonu.
- **Banner:** znovu jsem ho vygeneroval (`npm run build:ads`), nový obrázek jsem poslal výše.
- **Čitelnost:** všechny tři barvy tickerů mají vůči svému pozadí dostatečný kontrast, hlídá to test.

Testy prošly (354) a změna je v commitu `76de187` na větvi `feat/souhrn-reklama-a`. Na GitHub jsem ji ještě nepushnul. Mám ji pushnout, aby byla i v připravovaném PR?

### 👤 Tom

> na reklamním banneru nechci aby měla karta s otázkou pozadí, stačí jen text a tlacitko s pozadim

<details><summary>Nástroje (2)</summary>

- `Bash`
- `Read` – ads/reklama-a.png

</details>

### 🤖 Claude Code

Karta s otázkou už nemá pozadí, zůstal jen text a žluté tlačítko. Upravím ještě popis vizuálu v podkladech a commitnu.

<details><summary>Nástroje (2)</summary>

- `Bash`
- `SendUserFile`

</details>

### 🤖 Claude Code

Na banneru už otázka nemá tmavě modré pozadí. Zůstal jen tmavý text „Které si koupíte v Česku?“ a pod ním žluté tlačítko přes celou šířku. Nový obrázek jsem poslal výše. Na landing page má otázka tmavě modrou kartu dál.

Upravil jsem i popis vizuálu v `ads/reklama-a.md` a zapsal to do `docs/decisions.md`. Testy prošly (354) a změna je v commitu `2ed58ae`.

Na větvi `feat/souhrn-reklama-a` čekají dva commity, které ještě nejsou na GitHubu: tento a předchozí s barvami tickerů. Mám je pushnout?

### 👤 Tom

> exportuj dnešní konverzaci do ai-log implementace
