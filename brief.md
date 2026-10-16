# BRIEF – ETF Reality Check (konverzní landing page)

> Jediný zdroj pravdy pro **co** stavíme a **proč**. Technické **jak** je v `docs/05-technicka-implementace.md` (verze 3.2), pravidla pro agenta v `CLAUDE.md`.
> Při rozporu s tech-spec **platí tento brief**; rozpor zapsat do `docs/decisions.md`.
> Stav: aktualizováno 15. 10. 2026 večer podle rozhodnutí v `docs/decisions.md` (Tom průběžně mění obsah; při nové změně brief upravit). Odevzdání pá 16. 10. 2026 dopoledne.

---

## 1. Koncept jednou větou

Americká videa radí „kup VOO“. **ETF Reality Check** jednou otázkou ukáže, že to z Česka obvykle nejde, které evropské dvojče si koupit místo něj a kolik vás poplatky stojí v korunách. Za e-mail pak dostanete tahák, jak z toho poskládat celé portfolio.

**Konverze = uložený lead** (`rc_lead_success` + řádek v tabulce `leads`).

---

## 2. Cílová skupina

| | |
|---|---|
| **Kdo** | Čech 25–40 let, začíná nebo se rozkoukává. Informace bere z (často amerických) YouTube videí a sociálních sítí, chce posílat 1 000–5 000 Kč měsíčně. |
| **Co ví** | Zná tickery VOO, SPY a „S&P 500“. Neví o KID/PRIIPs, UCITS ani ACC/DIST. |
| **Co ho trápí** | Že koupí špatný fond nebo přeplatí. Že rady z videí v ČR nefungují. |
| **Kontext** | Mobil, Meta feed, pár sekund pozornosti. |
| **Co nechce** | Registraci, telefon, „ozve se vám poradce“, dlouhé čtení. |

**Tón:** vykání, věcně, trochu „aha“ momentů, žádné slibování výnosů ani „doporučujeme koupit“.

---

## 3. Uživatelská cesta a pořadí sekcí

| # | Sekce | Proč právě tady |
|---|---|---|
| 1 | **Hero** = H1 z reklamy + podnadpis na 3 řádky + 4 malé karty amerických fondů (ticker + TER, zdroj TER v řádku pod nimi) | Message match: člověk vidí totéž, na co klikl v reklamě. Po odpovědi malé karty zmizí (fondy jsou pak ve velkých kartách v levém sloupci). |
| 2 | **Otázka 1** (ANO / NE) přímo pod hero | První klik je odpověď, ne „zjistit více“. Mikro-závazek s nulovým tlakem. Zvolená odpověď se obarví: NE zeleně ✓ (správně), ANO červeně ✗ (špatně). |
| 3 | **Odhalení**: vysvětlení + páry NYSE ↔ UCITS + 3 jezdce | Hlavní hodnota zdarma: „můj“ fond, jeho evropské dvojče a poplatky v Kč. |
| 4 | **LeadCapture**: text nabídky + tlačítko „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ → po kliknutí jediné pole e-mail | Hned po hodnotě, kdy si návštěvník klade otázku „a co dál?“. Dvoukrokový formulář (rozhodl Tom, kap. 7). **Zobrazí se jen spolu se srovnáním** (po odpovědi, pod jezdci), nikdy bez něj. |
| 5 | **Pojmy a FAQ** (rozbalovací): TER, KID/UCITS, ACC/DIST, měnové riziko | Pro ty, kdo potřebují kontext, ostatní nebrzdí. |
| 6 | **Zdroje, metodika, upozornění, patička** | Důvěra, dohledatelnost, GDPR. |

**Sticky CTA (mobil)** se objeví, když návštěvník odscrolluje z odhalení, ale formulář ještě není vidět (typicky při hraní s jezdci): „Získat tahák zdarma“ → scroll na LeadCapture. Skrytá, když je formulář ve viewportu nebo po úspěchu.

---

## 4. Otázka – Můžete si je koupit v Česku?

**Znění:** „Můžete si je koupit v Česku?“ → **ANO / NE** (tickery a index říká podnadpis hero těsně nad otázkou). Správně je **NE**.

**Odhalení (stejné pro obě odpovědi, liší se jen první řádek):**
> Většinou ne. Americká ETF nemají dokument KID, který pravidla EU vyžadují, takže je drobný investor z EU obvykle nekoupí. Každé z nich má ale evropské dvojče na stejný index. A poplatky se liší.

**Páry podle správce** (`FundPairGrid`, levý sloupec zašedlý „USA · v ČR obvykle nekoupíte“, pravý „Evropské dvojče · koupíte“):

| NYSE | UCITS dvojče | Pozn. |
|---|---|---|
| VOO (Vanguard) | VUAA | akum. |
| IVV (iShares) | CSPX – na kartě ticker **SXR8** (zobrazená kótace na Xetře; CSPX je ticker v Londýně) | akum. |
| SPYM (State Street) | SPYL | akum. |
| SPY (State Street) | SPYL | akum. – SPY5 vyřazen 15. 10. 2026 |

SPYL je dvojčetem SPYM i SPY: v mřížce je **jedna** karta SPYL vedle obou amerických karet, nikdy dvakrát. Na stránce tak je 7 karet (4 americké + 3 evropské). Žádný evropský fond na stránce není distribuční.

**Karta fondu:** ticker (z kótace v datech), správce, ACC/DIST (u UCITS), TER s odkazem na zdroj a datem, **jedno velké číslo: „přijdete o … Kč na poplatcích“**. Čísla na kartách v barvě akcentu (fialová, kap. 13).

**Zvýraznění:** odznak **„nejnižší TER“** u evropského fondu (nebo fondů) s nejnižším TER. Při shodě dostanou odznak všechny shodné. Formulovat jako fakt, ne jako doporučení („ten, který si koupíte“ **ne**).

**Pod jezdci souhrn ve 4 řádcích** (Tom 16. 10.: místo jedné věty; popisek, krátké vysvětlení, výrazná částka): Celkem vložíte X Kč (M Kč měsíčně po dobu N let) · Modelová hodnota bez poplatků Y Kč (vklady i zhodnocení r % ročně, kdyby fond nic nestál) · Poplatky fondu vám uberou nejméně Z Kč (fond s nejnižším TER ve srovnání) · … nejvíce W Kč (fond s nejvyšším TER). Pod tím: ztráta zahrnuje i ušlé zhodnocení.

---

## 5. Jezdce a výpočet (`projection.ts`)

| Jezdec | Výchozí | Rozsah | Krok |
|---|---|---|---|
| Modelový výnos **před TER** | 6 % | 2–10 % | 0,5 % |
| Doba | 20 let | 1–40 let | 1 rok |
| Měsíčně | 3 000 Kč | 500–20 000 Kč | 500 Kč |

**Vzorec** (shodný s tech-spec 5.2): měsíční vklad na konci měsíce, roční sazba převedená na efektivní měsíční.
- `i = (1 + r)^(1/12) − 1`, `n = roky × 12`, `FV(r) = M × ((1 + i)^n − 1) / i`
- hrubá hodnota: `FV(g)`; hodnota fondu: `FV(g − TER)`
- **poplatky fondu** = `FV(g) − FV(g − TER)` (zahrnuje i ušlé zhodnocení, proto text „přijdete o“, ne „zaplatíte“)
- při `g − TER = 0` → `FV = M × n`

**Povinná věta pod výsledkem:** „Modelový výpočet, výnos je předpoklad, ne záruka. Měsíční úročení, TER odečten od výnosu. Bez poplatků brokera, směny měn a daní.“

**Čísla se nikdy nepíšou ručně do textů ani do reklam.** Vše počítá `projection.ts` z `etf.json`. Testy (Vitest) přepočítají výchozí scénář a výsledky se zapíšou do README a `ads/`.

---

## 6. Otázka 2 – zrušena (15. 10. 2026)

Kvíz má jedinou otázku. Téma „World není celý svět“ a skládání portfolia z více indexů zůstává jen v taháku (kap. 8). Důvod v `docs/decisions.md`.

---

## 7. LeadCapture – nabídka a formulář

**Dvoukrokový (Tom, 15. 10. 2026):** nejdřív text nabídky a tlačítko **„CHCI KOMPLETNÍ SROVNÁNÍ V PDF“**, po kliknutí formulář `[ vas@email.cz ]` `[ Odeslat PDF ]`. Jediné pole, honeypot, sanitizace a validace na klientu i serveru, chybové stavy podle tech-spec kap. 7.

**Text nabídky nad tlačítkem:** zatím `[[CHYBÍ TEXT]]` (dodá Tom). Původní návrh (nepoužit, k dispozici):
- Most: Tohle byl jen S&P 500. Co když chcete víc než Ameriku?
- Text: Evropská dvojčata dalších populárních ETF a jak z nich poskládat celé portfolio najdete v taháku:
  ✓ evropská dvojčata populárních NYSE ETF, nejen na S&P 500 · ✓ jak poskládat celý svět ze dvou až tří fondů · ✓ na co si dát pozor u českého brokera a u daní

⚠️ **„Odeslat PDF“** slibuje odeslání, ale e-mail je vypnutý (`EMAIL_ENABLED=false`); otevřený bod kap. 16.

**Pod tlačítkem:** „Tahák stáhnete hned po odeslání.“ + „Žádný spam, odhlásit se můžete jedním kliknutím.“ + odkaz na zásady zpracování údajů.
- Větu „**pošleme vám ho i e-mailem**“ zobrazit **jen** při `EMAIL_ENABLED=true` (ověřená doména v Resendu). Jinak se nesmí objevit.

**Po odeslání:** stav úspěchu na místě formuláře, tlačítko **Stáhnout tahák (PDF)** (`rc_pdf_download`), skrýt sticky CTA.

---

## 8. Tahák (PDF) – „Z amerického videa do českého portfolia“

4–5 stran, první strana sama splní slib. **V této verzi se PDF nevytváří (Tom, 16. 10. 2026)**; obsah je popsaný v README → „Co lead dostane za e-mail“ (včetně toho, které podklady v projektu jsou a které chybí).

| Strana | Obsah |
|---|---|
| 1. Rychlá odpověď | Hlavní zjištění z kvízu (KID, dvojčata, poplatky) ve 3 větách + schéma „chci USA / svět / rozvíjející se trhy → tyto evropské fondy“ |
| 2. Překladový slovník NYSE → UCITS | S&P 500 (4 americké fondy → 3 evropská dvojčata, SPYL sdílené), celý US trh, MSCI World, rozvíjející se trhy, celý svět. U každého: ticker a burza, TER, ISIN, ACC/DIST, měna, zdroj a datum ověření |
| 3. Mapa indexů | S&P 500 ⊂ World, World + EM = celý svět (váhy zemí z factsheetů MSCI s datem, jinak kvalitativně). 3 **ilustrační** způsoby pokrytí světa dvěma až třemi fondy, označené „ilustrace, ne doporučení“ – plní slib „jak poskládat celý svět“ |
| 4. ACC vs. DIST | Rozdíl pro reinvestici a pro papírování v ČR (na stránce: evropská dvojčata „akum.“, americké fondy vyplácejí čtvrtletně) |
| 5. Kontrolní seznam | KID, měna a směna, domicil, poplatek brokera, časový a hodnotový test u daní |
| Zdroje a metodika | Odkazy, data ověření, vzorec, „nejde o investiční ani daňové poradenství“ |

- Daňová pravidla **jen** ze zákona nebo z webu Finanční správy, s datem (pravidla se od 2025 měnila). Nejisté věci raději vynechat než odhadnout.
- **Srovnání brokerů do PDF nedávat.** Data se často mění, nemáme je ověřená a vyžadovalo by to další den práce. Patří do README → „Co chybí / co by přišlo v dalších e-mailech“.
- Generovat z `etf.json` (tech-spec 7.5). Záložní plán při nedostatku času: HTML stránka taháku → PDF jednorázově, v README přiznat.

---

## 9. Reklamy (`ads/reklama-a.md`, `ads/reklama-b.md`)

Meta (IG/FB), feed 4:5 (1080 × 1350), CTA „Zjistit více“. Obě reklamy vedou na tutéž otázku, liší se **motivací** (a tím i hero). Zároveň tak testujeme A/B hypotézu č. 1 (otázka vs. číslo v hero).

| | **A – „Není ETF jako ETF“** (zvědavost: jde to vůbec koupit?) | **B – „Poplatek v korunách“** (strach z přeplácení) – návrh ke schválení |
|---|---|---|
| Vizuál | 4 karty VOO · IVV · SPYM · SPY | 2 karty vedle sebe (dražší a levnější fond na S&P 500) a velké číslo rozdílu v Kč v barvě akcentu |
| Text | NENÍ ETF JAKO ETF. Stejný index S&P 500. Jiný ticker. Jiný poplatek. Které si koupíte v Česku? Otestujte se jednou otázkou → | STEJNÝ S&P 500. ROZDÍL X Kč. Při 3 000 Kč měsíčně za 20 let. A ten levnější v Česku obvykle nekoupíte. Spočítejte si to → |
| H1 na stránce | NENÍ ETF JAKO ETF | STEJNÝ S&P 500, ROZDÍL X Kč |
| Podnadpis | 3 řádky se stupňovanou velikostí: „VOO, IVV, SPYM a SPY jsou populární americká ETF“ / „všechny sledují stejný index S&P 500“ / „Liší se poplatkem (TER)“ | Tolik dělá rozdíl v poplatku mezi fondy na stejný index za {doba z výchozích jezdců}. |
| URL | `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a` | totéž s `utm_content=ad_b` |

- Bez UTM se zobrazí A. Liší se jen hero (H1 a podnadpis), otázka a zbytek stránky jsou stejné.
- Podnadpisy na stránce nekončí otázkou (jediná otázka v hero je otázka kvízu); reklamy svou otázku mají.
- **B: X a dvojice fondů** se doplní z `projection.ts` po ověření TER. Pracovně SPY vs. SPYM (největší rozdíl mezi americkými fondy, srovnání „stejný trh, stejný typ fondu“). Číslo v hero musí přesně odpovídat výchozímu nastavení jezdců a kartám pod ním.
- Každé tvrzení v reklamě musí stránka doložit.
- Do souborů reklam patří: text, popis vizuálu, formát, URL, který hero ukazuje, na jakou motivaci cílí a odkud je každé tvrzení.

---

## 10. Data (`data/etf.json`, schéma podle tech-spec kap. 4)

7 fondů (VOO, IVV, SPYM, SPY → VUAA, CSPX, SPYL). Každá hodnota má `value`, `sourceUrl`, `sourceLabel`, `asOf` a volitelně `note`; kótace (burza, ticker, měna) je objekt `listing` uvnitř fondu; `czRetailAvailable` říká, zda fond drobný investor v ČR koupí. Páry přes `relatedFundIds`.

| Stav k 15. 10. 2026 | |
|---|---|
| ✅ ověřeno Tomem (stránky a dokumenty správců, PRIIPs) | TER, ISIN, index, ACC/DIST, měna, domicil, zajištění, kótace a dostupnost v ČR u všech 7 fondů |
| ℹ️ | ISIN VOO a IVV odvozen z CUSIP (ISO 6166, kontrolní číslice ověřena); VUAA: KID existuje, ČR jmenovitě neuvádí – podle PRIIPs stačí (Tom) |

- TER se v datech zapisuje v procentech (`0.03` = 0,03 %).
- Hodnota bez zdroje neprojde `check-data`; v produkci nesmí být povinná hodnota kvízu `null`.
- Volitelně na kartě SPYM „(dříve SPLG)“ – na stránce State Street zatím nenalezeno.

---

## 11. Měření (prefix `rc_`)

| Event | Kdy | Vlastnosti |
|---|---|---|
| (pageview) | automaticky | UTM |
| `rc_view` | kvíz ≥ 50 % ve viewportu, 1× | variant |
| `rc_answer` | odpověď na otázku | answer, variant |
| `rc_slider_change` | první pohyb každého jezdce (debounce 1 s) | slider |
| `rc_cta_click` | sticky CTA / jiné CTA na formulář | location |
| `rc_form_view` | formulář ≥ 50 % ve viewportu po odpovědi, 1× | variant |
| `rc_form_focus` | první focus do e-mailu | variant |
| `rc_form_submit` | klik na odeslat | variant |
| `rc_lead_success` | odpověď 200 `{ok:true}` | variant |
| `rc_lead_error` | 4xx/5xx/síť | code |
| `rc_pdf_download` | stažení taháku | variant |

- Hodnotu jezdce **neposílat** (Umami počítá každou vlastnost jako event). Stačí název jezdce.
- Funnel: `pageview → rc_answer → rc_form_view → rc_form_focus → rc_form_submit → rc_lead_success`. Zdroj pravdy pro leady je tabulka `leads`.

---

## 12. Očekávaná konverze a A/B hypotézy (podklad pro README)

**Odhad (neověřeno na provozu):** 3–6 % návštěv → lead, pracovní cíl **4–5 %**.
- Pro horní hranici: jediné pole, hodnota zdarma před formulářem, první klik v hero je už interakce, mezi hodnotou a formulářem není žádný další krok.
- Pro spodní hranici: studený provoz z Meta na mobilu; část lidí si odnese „aha“ z odhalení a odejde bez e-mailu.
- Rozpad: ~60 % odpoví na otázku → ~65–70 % z nich doscrolluje k formuláři → ~11–14 % z nich odešle. To dává ~4,3–5,9 %. Upravit podle benchmarků, které v README ocitujeme.

**Hypotézy (dle dopadu):**
1. **Hero s otázkou (ANO/NE) vs. hero s konkrétním číslem v Kč** („Stejný S&P 500, rozdíl X Kč“) → lead / návštěva, sekundárně `rc_answer` / návštěva. Hero rozhoduje o tom, kolik lidí vůbec začne; částečně ho testují už reklamy A a B.
2. **Formulář nad jezdci (hned za páry) vs. pod jezdci** → lead / návštěva a `rc_form_view` / `rc_answer`. Jezdce zvyšují zapojení, ale prodlužují cestu k formuláři na mobilu.
3. **Dvoukrokový formulář (tlačítko → pole e-mail) vs. pole rovnou** → lead / `rc_form_view`. Krok navíc může snižovat konverzi.
4. **Text tlačítka** „CHCI KOMPLETNÍ SROVNÁNÍ V PDF“ vs. „Chci evropská dvojčata“ → `rc_cta_click` / `rc_form_view`.

---

## 13. Vizuál (Tom, 16. 10. 2026 – inspirace Sheba Online a Urban Tech Republic)

- **Pozadí:** čistě bílé (`#ffffff`), vzdušné sekce s velkými mezerami, tenké linky jako oddělovače, karty s 1px rámečkem a jemným stínem při najetí.
- **Hero nadpis:** dva řádky „NENÍ etf / jako ETF“ – velká a malá slova v poměru 2 : 1, každé slovo jinou barvou (petrolejová, fialová #57008E, královská modrá, jantarová), **bez zelené** (ta patří správné odpovědi) a bez červené (ztráta). Asymetrie symbolizuje rozdíl v poplatcích u fondů na stejný index.
- **Dvojice fondů:** každá dvojice (americký fond ↔ evropské dvojče) má vlastní světlé pozadí obou karet – modré, meruňkové, levandulové; bez zelené a červené.
- **Barevně odlišená klíčová slova:** fakta (tickery, index, vložené částky) indigo, ztráta na poplatcích červeně, nejvýhodnější evropské dvojče zeleně – vždy jako zvýrazněný text, ne jen barva.
- **Odznaky na kartách:** americké „V ČR obvykle nekoupíte“ (červený), evropské s nejnižším TER „✓ nejnižší TER“ (zelený, karta se zeleným rámečkem).
- **CTA:** žlutá plocha #FFC349 s tmavým textem a obrysem.
- **Tmavé karty:** otázka kvízu v navy kartě (jemná mřížka, odlesk), nabídka PDF ve fialové kartě (odlesk); bílý text, žlutý fokus a fajfky.
- **Písma:** nadpisy Outfit, text Plus Jakarta Sans (obojí `next/font`, latin-ext). Základní text 18 px, drobné poznámky min. 16 px.
- **Animace:** `motion` jen pro interakce (odhalení, karty, odpověď, formulář); nezpomalují načtení (měřeno Lighthouse).
- Hero + otázka + tlačítka ANO/NE se musí vejít **above the fold na 360 × 640 px**.
- Tabulární číslice, české formáty (`0,03 %`, `4 557 Kč`), žádný glassmorphism ani stock fotky.

---

## 14. Rozsah podle priority

**MUSÍ:** `etf.json` ověřený · hero A/B · otázka + páry + jezdce · LeadCapture → Neon · stav po odeslání + PDF · `rc_` eventy · Vercel + test na telefonu · `ads/` · README · `ai-log/`
**MĚLO BY:** PDF generované z dat · sticky CTA · FAQ · `/metodika`
**MŮŽE (jinak do „Co chybí“):** e-mail přes Resend · Playwright · obrázkové kreativy

## 15. Zakázané

Čísla mimo `etf.json`/`projection.ts` · „doporučujeme / koupíte tento“ · „zaručený výnos“ · konkrétní brokeři · slib e-mailu bez ověřené domény · druhé povinné pole · daňová tvrzení bez zdroje a data.

## 16. Otevřené body (Tom)

1. Schválit **reklamu B** (nebo dodat vlastní) a dvojici fondů pro částku (pracovně SPY vs. SPYM).
2. Vlastní doména pro Resend? Pokud ne, e-mail vypínáme a větu „pošleme i e-mailem“ mažeme – a pak i text tlačítka „Odeslat PDF“.
3. Kdo je provozovatel (patička, zásady zpracování údajů).
4. Chybějící texty: nabídka nad tlačítkem PDF, první řádek odhalení po ANO/NE, popisek pole e-mail, chybové hlášky, stav po odeslání, FAQ, zásady, poznámka k SXR8/CSPX.
5. Řádek se zdrojem TER pod malými kartami v hero (navrhl Claude) – schválit znění.
