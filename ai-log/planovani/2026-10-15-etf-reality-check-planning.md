# AI log – plánování feature „ETF Reality Check"

- **Nástroj:** Claude (claude.ai, projekt CLIENTELO PROJECT), model Claude Opus 5.5
- **Datum:** 14.–15. 10. 2026
- **Účel konverzace:** navrhnout hlavní interaktivní prvek landing page (srovnávač ETF), který návštěvníka něco naučí a dovede ho k odeslání e-mailu
- **Forma logu:** zadání uživatele jsou citována doslova (u dlouhých zpráv zkráceně), odpovědi AI jsou shrnuté. Na konci je přehled rozhodnutí, chyb AI a otevřených bodů.

---

## 1. Průzkum existujících platforem

**Uživatel:**
> Chci se chvíli zabývat konkrétní feature a tou je interaktivní pole, které bude mít srovnávač, který jednoduše ukáže a naučí věci potenciálního leada tak, že se z něj stane ten správný lead a poskytne následně svůj e-mail. Chci aby to bylo originální a proto potřebuji něco podobného vidět i na existujících platformách.

**AI (shrnutí):** Webové vyhledávání a přehled pěti opakujících se mechanik:
1. Odhalení překryvu fondů (ETF Research Center, ETF.com, ETF Database)
2. Kalkulačka dopadu poplatků (Banker on Wheels, BrokerChooser)
3. Dotazník → doporučená skladba portfolia (Vanguard, Portu, Fondee)
4. Backtest a propady (Curvo Backtest)
5. Tabulkový srovnávač (justETF)

Závěr: existující nástroje jsou buď pro pokročilé, nebo dlouhé. Pro mobil a pár sekund pozornosti AI navrhla formát **„Tipni si, pak uvidíš"**: tři karty (poplatky, překryv, česká past s KID/PRIIPs), jedno ťuknutí na kartu, e-mail výměnou za tahák.

---

## 2. Doba výpočtu poplatků

**Uživatel:**
> Bod 1 – poplatky: co kdybychom dali srovnání na pouze 5 let kvůli rychlosti návratnosti, nebo nechali uživatele vybrat periodu na jezdci a číslo Y v otázce „Který fond vás za Y let stojí víc?" bude dynamické?

**AI (shrnutí):** Spočítala model SPY vs VOO (3 000 Kč/měsíc, 6 % ročně): rozdíl za 5 let ~360 Kč, za 20 let ~10 600 Kč, za 30 let ~37 000 Kč. Doporučení: pevných 5 let ne (rozdíl je příliš malý, aha moment nevznikne). Jezdec ano, ale až po tipu. Na mobilu zvážit čipy místo jezdce. Otázku přeformulovat na tipování částky.

---

## 3. Návrh uživatele: tip → jezdce → srovnání → česká past

**Uživatel:**
> 1. Poplatky: „Který fond vás stojí víc?" – vybere jednu ze dvou
> 2. Potom místo překryvu dva jezdci pro počet let a výši měsíční investice
> 3. Pak se zobrazí srovnání SPY vs VOO s čísly
> 4. Česká past: „Koupíte si VOO u běžného evropského brokera?"
>
> Proč mě to napadlo? Já jsem drobný investor, ale nevím, co znamená překryv v % – ten bod číslo 2 jsem vlastně vůbec nepochopil. Udělej tabulku pro výhody a nevýhody pro obě varianty srovnávače.

**AI (shrnutí):** Tabulka výhod a nevýhod. Varianta uživatele vyhrála (osobní číslo, srozumitelnost, lepší vazba na e-mail). Navržené úpravy: neukazovat TER v kroku 1, spojit jezdce a výsledek do jedné obrazovky, jezdce stavět pro palec.

---

## 4. Překryv u fondů stejného indexu

**Uživatel:**
> Ale proč bychom řešili překryv, když srovnáváme ETF stejného indexu?

**AI (shrnutí):** Uznala chybu. SPY a VOO sledují stejný index, překryv je ~100 %. Překryv dává smysl jen u různých indexů (VOO vs VTI, VOO vs QQQ). Návrh: „Stejný obsah, jiná cena" jako formulace pro začátečníky.

**Uživatel:**
> Nebo myslíš si, že je lepší srovnávat indexy stejné nebo různé kvůli překryvu?

**AI (shrnutí):** Pro kartu s poplatky stejný index (čistý experiment, jeden modelový výnos, jednoduchá zpráva). Různé indexy přesunout do taháku za e-mail.

---

## 5. Výběr hlavního aha momentu

**Uživatel:**
> Buď můžeme srovnávat ETF stejného indexu a řešit otázku PROČ PLATIT VÍC ZA STEJNOU VĚC (předvoleno 3 000 Kč měsíčně na 20 let) … nebo ukázat srovnání 3 různých ETF různých indexů (S&P 500, World, Emerging) a nechat ho tipnout překryv – tím mu nabídnu odpověď na JESTLI OPRAVDU DIVERZIFIKUJE. Co si myslíš, že je lepší varianta?

**AI (shrnutí):** Doporučila variantu 1. Spočítala celkové poplatky za 20 let: VOO ~5 000 Kč, SPY ~15 600 Kč, tedy trojnásobek. Návrh tipovat poměr (1,1× / 1,5× / 3×). Diverzifikaci přesunout do taháku.

---

## 6. Obrácení pořadí poplatků v UCITS verzích

**Uživatel:**
> Já ten překryv nepochopil, protože nebyl dost vysvětlený a hlavně tam svítily tickery stejného indexu, takže překryv by byl téměř 100 %. Druhá věc: k čemu je zjistit, že SPY je dražší než VOO, když pak pro UCITS to vychází naopak? V jiném chatu, kde jsme si dělali předběžné tabulky, vycházel State Street levněji než Vanguard a iShares.

**AI (shrnutí):** Uznala obě výtky. Ověřila: SPYL (State Street UCITS) 0,03 % (factsheet SSGA k 14. 10. 2026), VUAA a CSPX 0,07 % (srovnávač Lightyear). Návrh udělat z obrácení pořadí twist: „Značka neříká nic o ceně."

---

## 7. Je mapování NYSE → UCITS opravdová hodnota?

**Uživatel:**
> Jenže je to opravdová hodnota? Vždyť čeští brokeři stejně primárně nabízí evropské tickery, a tím pádem si každý může najít, co je dražší, a Amerika ho vůbec nemusí zajímat. Maximálně kdyby se učil investovat na anglofonních zdrojích, kde se řeší jen americké tickery na NYSE.

**AI (shrnutí):** Uznala, že samotný tahák „ticker → TER" je slabá hodnota. Upřesnila cílovou skupinu: **samouk z anglofonního obsahu (YouTube, Reddit), který chce převést americkou radu do české reality**. Skutečná hodnota je v tom, co broker neukáže: akumulační vs distribuční verze, domicil a srážková daň, měna a směna, český časový test.

---

## 8. Hybrid: poplatky + diverzifikace

**Uživatel:**
> Co kdyby to moje interaktivní pole bylo hybrid a nabídlo dvě hodnoty? První: visitor zjistí, že to, co je dražší na NYSE, je levnější v EU. Druhá: S&P 500, World, Emerging – tipne si překryv mezi dvěma dvojicemi: S&P 500 vs World (nízká diverzifikace), World vs Emerging (World v sobě nemá žádné emerging markets). Co bude v PDF?

**AI (shrnutí):** Podpořila hybrid se spojovacím příběhem „3 mýty z anglických videí". Ověřila factsheet MSCI World k 30. 9. 2026: 1 249 firem, 23 vyspělých zemí, USA 72,94 %, bez rozvíjejících se trhů. Otázky přeformulovala na „kolik z každé stokoruny jde do USA" místo procent překryvu. Navrhla obsah PDF (mapa indexů, překladový slovník NYSE → UCITS). Upozornila na mix poskytovatelů indexů (MSCI vs FTSE).

**Uživatel:**
> Takže v PDF by mohl být extenzivní srovnávač i s upozorněním na zákony, akumulační vs distribuční ETF, zdanění, porovnání ETF i jiných než S&P 500 apod.

**AI (shrnutí):** Ano, ale struktura jádro + přílohy. Daňové informace jen z aktuálního zákona s datem. Hlubší témata do navazujících e-mailů. Doporučila jeden JSON soubor jako single source of truth pro web i PDF.

---

## 9. Formulace otázky o diverzifikaci

**Uživatel:**
> Co otázka typu: Máte v portfoliu S&P 500, ale nechcete sázet pouze na USA. Který index vám pomůže lépe diverzifikovat? MSCI World / MSCI Emerging Markets. Nebo otázka: Máte v portfoliu S&P 500 a přidáte celosvětové ETF (MSCI World). O kolik si reálně rozšíříte investici mimo USA?

**AI (shrnutí):** První otázka nemá nespornou odpověď a zní jako doporučení. Druhá je lepší, ale musí obsahovat poměr (stejná částka). Výpočet: 10 000 Kč v S&P 500 + 10 000 Kč ve World → mimo USA ~2 700 Kč (~13,5 %).

**Uživatel:**
> Co když mi visitor uteče, protože je tam moc dlouhých čísel? Co kdyby odpovědi byly něco jako 50 % USA 50 % svět / 80 % USA 20 % svět, a třeba s hezkým vizuálním obdélníkem, kde by každá % strana měla jinou vlajku (barvu)?

**AI (shrnutí):** Vytvořila funkční náhled karty s barevnými pruhy. Správná odpověď je ~86/14, ne 80/20 (0,5 × 100 % + 0,5 × 72,94 %). Vlajky nedoporučila (emoji vlajky se na Windows nezobrazují, „svět" nemá vlajku), místo nich barvy s popiskem.

**Uživatel:**
> Odpovědi super. Ale co otázka? Co třeba: Přikoupíte k S&P 500 ještě „celosvětový" fond MSCI World. Jak bude vypadat vaše nové portfolio?

**AI (shrnutí):** Dobrá otázka, jen doplnit „stejnou částku", jinak odpověď není jednoznačná.

---

## 10. Kontrola proti zadání

**Uživatel:**
> Držíme se tím stále zadání „landing page se srovnáním ETF obchodovaných na NYSE pro českého drobného investora, který přichází z reklamy na mobilu a stránce věnuje jen několik sekund"?

**AI (shrnutí):** Částečně ne. Karty začaly mluvit o indexech místo o NYSE ETF. Náprava: ptát se přes tickery (VOO, URTH, EEM), přidat viditelné srovnání NYSE ETF před formulář, ověřit burzu u každého fondu (QQQ je na Nasdaqu, ne na NYSE).

---

## 11. Finální pořadí otázek

**Uživatel:**
> Co toto pořadí s tímto konceptem? Lépe to navazuje za sebou.
> 1. Vybrat správný S&P 500: na newyorské burze se prodává populární VOO 0,03 % a SPY 0,0945 %. Můžu si tato ETF koupit u českého brokera za stejný TER?
> 2. Pak si k tomu S&P 500 přidám MSCI World. Kolik procent USA vs kolik procent World?
> 3. Zjistil jste v reklamě, že indická ekonomika roste. Je v URTH zahrnutá?

**AI (shrnutí):** Pořadí podpořila (příběh stavby portfolia). Upravila formulace: oddělit „koupit" a „stejný TER", doplnit u URTH „nebo jeho evropské dvojče", nahradit „Zjistil jste v reklamě" neutrální formulací.

**Uživatel:**
> První zjistit, jestli může v ČR koupit VOO a SPY. Za druhé zjistit, jestli za stejný TER. Pak ukázat všechny 4 karty VOO, SPY, VUAA, SPYL a pro každou dynamická čísla zisk a poplatek podle jezdců. Třetí otázka se týká MSCI World a rovnou se zeptá i na Indii. Zkus zformulovat otázky a odpovědi.

**AI (shrnutí):** Zformulovala všechny tři otázky s odhaleními. Spočítala výchozí hodnoty (3 000 Kč, 20 let, 6 %): poplatky VOO/SPYL ~5 000 Kč, VUAA ~11 600 Kč, SPY ~15 600 Kč. Otázku 3 spojila do jednoho pruhu se třemi částmi (USA / ostatní / Indie).

---

## 12. Finální verze: dva dotazy

**Uživatel:**
> Nakonec chci verzi se dvěma dotazy a větším podílem interakce. První dotaz: Nejpopulárnější ETF kopírující index S&P 500 mají tyto tickery: VOO, IVV, SPYM, SPY. Můžete si je koupit u českého brokera? ANO/NE … Vysvětlení … Dále dva sloupce: levý sloupec karty NYSE tickerů, pravý sloupec jejich ekvivalenty UCITS. Dole 3 slidery s předvolbou: modelový výnos před TER 6 %, doba investování 20 let, pravidelná investice 3 000. Slider si user hýbe a mění se hodnoty.

**AI (shrnutí):** Ověřila SPYM (0,02 %, NYSE Arca, SSGA k 14. 10. 2026) a SPY5 (0,03 %, distribuční, SSGA k 15. 10. 2026). Vytvořila funkční prototyp: otázka Ano/Ne, páry VOO → VUAA, IVV → CSPX, SPYM → SPYL, SPY → SPY5, tři jezdce (výnos 2–10 %, doba 1–30 let, 500–20 000 Kč). Na kartách jen jedno číslo (poplatky za celou dobu), konečná hodnota jen jednou pod jezdci.

---

## 13. Hláška pro PDF a obsah PDF

**Uživatel:**
> Připrav hlášku, která uživateli vysvětlí více v PDF, napiš, co všechno by v tom PDF mělo být.

**AI (shrnutí):** Mezititulek po otázce 1 a hlavní hláška u formuláře po otázce 2 (otázka v nadpisu, tři body s hodnotou, „stáhnete hned", odkaz na zásady GDPR). PDF „Z amerického videa do českého portfolia" na 4–5 stran: rychlá odpověď, překladový slovník NYSE → UCITS, mapa indexů, akumulační vs distribuční, kontrolní seznam před nákupem, zdroje a metodika.

---

## 14. Název feature pro implementaci

**Uživatel:**
> Jak nazvat anglicky celou tuto feature a container pro implementaci?

**AI (shrnutí):** `ETF Reality Check` (`EtfRealityCheck`). Komponenty: `QuizStep`, `AnswerReveal`, `FundPairGrid`, `FundCard`, `ProjectionSliders`, `AllocationBar`, `LeadCapture`. Data v `funds.json`, výpočet v `projection.ts`. Analytické události s prefixem `rc_` (`rc_view`, `rc_q1_answer`, `rc_slider_change`, `rc_q2_answer`, `rc_form_focus`, `rc_form_submit`, `rc_lead_success`, `rc_pdf_download`).

---

## Výsledné rozhodnutí

**Cílová skupina:** český drobný investor, samouk z anglofonních zdrojů, který slyšel „kup VOO" a chce to převést do české reality.

**Feature „ETF Reality Check":**
1. **Otázka 1:** Lze VOO, IVV, SPYM, SPY koupit u českého brokera? (Ano/Ne) → vysvětlení (KID, PRIIPs) → dva sloupce NYSE ↔ UCITS dvojčata → tři jezdce (výnos, doba, částka) s živým přepočtem poplatků.
2. **Otázka 2:** Přikoupím stejnou částku MSCI World. Jak bude vypadat portfolio a kolik v něm bude Indie? → pruhy USA / ostatní / Indie, správně ~86 / 14 / 0.
3. **Formulář s jedním polem** → tahák PDF (stažení ihned + e-mailem).

## Kde se AI spletla nebo ji uživatel opravil

| Situace | Chyba AI | Kdo ji odhalil |
|---|---|---|
| Karta „překryv" | Navržena bez konkrétních fondů a bez vysvětlení. U fondů stejného indexu je překryv ~100 %, takže karta nedávala smysl. | Uživatel |
| Vysvětlení, proč uživatel překryv nepochopil | AI to přisoudila složitosti pojmu, skutečný důvod byl špatný výklad a nevhodný příklad. | Uživatel |
| Karta „SPY je dražší než VOO" | AI nedomyslela, že v UCITS verzích je pořadí opačné, takže by karta učila zavádějící závěr. | Uživatel |
| Hodnota taháku NYSE → UCITS | AI ji nadhodnotila („nejsilnější aha moment"), přitom TER si každý najde v aplikaci brokera. | Uživatel |
| Odklon od zadání | Karty začaly pracovat s indexy místo s NYSE ETF. | Uživatel se zeptal, AI potvrdila a navrhla nápravu |
| Návrh 80/20 v odpovědích | Uživatel navrhl 80/20, AI spočítala skutečnou hodnotu ~86/14. | AI (oprava návrhu uživatele) |
| QQQ jako NYSE ETF | AI v první odpovědi upozornila, že QQQ je na Nasdaqu, ne na NYSE. | AI |

## Ověřená data (k datu konverzace)

| Údaj | Hodnota | Zdroj | Datum |
|---|---|---|---|
| SPYL (State Street S&P 500 UCITS Acc) TER | 0,03 % | ssga.com, ISIN IE000XZSV718 | 14. 10. 2026 |
| SPY5 (State Street S&P 500 UCITS Dist) TER | 0,03 %, distribuční | ssga.com, ISIN IE00B6YX5C33 | 15. 10. 2026 |
| SPYM (NYSE Arca) TER | 0,02 % (gross) | ssga.com | 14. 10. 2026 |
| VUAA, CSPX TER | 0,07 % | lightyear.com (sekundární zdroj) | bez data |
| MSCI World | 1 249 firem, 23 zemí, USA 72,94 %, bez EM | factsheet MSCI | 30. 9. 2026 |

## Otevřené body k ověření před nasazením

- TER u VOO, IVV, SPY (NYSE) přímo u správců
- TER u VUAA (Vanguard) a CSPX (iShares) z primárních zdrojů
- Dostupnost VOO a SPY u 2–3 brokerů používaných v ČR (formulovat „obvykle")
- Burza u každého fondu (URTH, EEM a další)
- Česká daňová pravidla pro PDF (časový a hodnotový test, limit osvobození) z aktuálního znění zákona nebo z webu Finanční správy
- UCITS dvojčata pro MSCI World a rozvíjející se trhy, držet jednoho poskytovatele indexů

## Metodika modelového výpočtu

- Měsíční vklad, měsíční úročení
- Měsíční výnos = (roční výnos − TER) / 12
- Náklad poplatku = hodnota stejného fondu bez poplatku − hodnota s poplatkem (zahrnuje ušlé zhodnocení)
- Výnos je předpoklad pro výpočet, ne zaručený výnos
- Nezahrnuje poplatky brokera, směnu měn ani daně
