# BRIEF – ETF Reality Check (konverzní landing page)

> Jediný zdroj pravdy pro **co** stavíme a **proč**. Technické **jak** je v `docs/05-technicka-implementace.md` (verze 3), pravidla pro agenta v `CLAUDE.md`.
> Při rozporu s tech-spec **platí tento brief**; rozpor zapsat do `docs/decisions.md`.
> Stav: 15. 10. 2026, odevzdání pá 16. 10. 2026 dopoledne.

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
| 1 | **Hero** = H1 a vizuál z reklamy + 4 karty tickerů | Message match: člověk vidí totéž, na co klikl v reklamě. |
| 2 | **Otázka 1** (ANO / NE) přímo v hero | První klik je odpověď, ne „zjistit více“. Mikro-závazek s nulovým tlakem. |
| 3 | **Odhalení**: vysvětlení + páry NYSE ↔ UCITS + 3 jezdce | Hlavní hodnota zdarma: „můj“ fond, jeho evropské dvojče a poplatky v Kč. |
| 4 | **LeadCapture**: most „Tohle byl jen S&P 500“ + 3 body + jediné pole e-mail | Hned po hodnotě, kdy si návštěvník klade otázku „a co dál, co si tedy koupit?“. Žádný další krok mezi hodnotou a formulářem. |
| 5 | **Pojmy a FAQ** (rozbalovací): TER, KID/UCITS, ACC/DIST, měnové riziko | Pro ty, kdo potřebují kontext, ostatní nebrzdí. |
| 6 | **Zdroje, metodika, upozornění, patička** | Důvěra, dohledatelnost, GDPR. |

**Sticky CTA (mobil)** se objeví, když návštěvník odscrolluje z odhalení, ale formulář ještě není vidět (typicky při hraní s jezdci): „Získat tahák zdarma“ → scroll na LeadCapture. Skrytá, když je formulář ve viewportu nebo po úspěchu.

---

## 4. Otázka – Můžete si je koupit v Česku?

**Znění:** „VOO, IVV, SPYM a SPY sledují stejný S&P 500. Můžete si je koupit u českého brokera?“ → **ANO / NE**

**Odhalení (stejné pro obě odpovědi, liší se jen první řádek):**
> Většinou ne. Americká ETF nemají dokument KID, který pravidla EU vyžadují, takže je drobný investor z EU obvykle nekoupí. Každé z nich má ale evropské dvojče na stejný index. A poplatky se liší.

**Páry podle správce** (`FundPairGrid`, levý sloupec zašedlý „USA · v ČR obvykle nekoupíte“, pravý „Evropské dvojče · koupíte“):

| NYSE | UCITS dvojče | Pozn. |
|---|---|---|
| VOO (Vanguard) | VUAA | akum. |
| IVV (iShares) | CSPX | akum. |
| SPYM (State Street) | SPYL | akum. |
| SPY (State Street) | SPY5 | **dist.** – jediné distribuční, ukázat na kartě |

**Karta fondu:** ticker, správce, ACC/DIST (u UCITS), TER, **jedno velké číslo: „přijdete o … Kč na poplatcích“**. Čísla na kartách oranžově.

**Zvýraznění:** odznak **„nejnižší TER“** u evropského fondu (nebo fondů) s nejnižším TER. Při shodě dostanou odznak všechny shodné. Formulovat jako fakt, ne jako doporučení („ten, který si koupíte“ **ne**).

**Pod jezdci jedna souhrnná věta:** „Vložíte X Kč. Bez poplatků by to modelově bylo Y Kč, poplatky z toho uberou Z až W Kč podle fondu.“

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

**Most (nadpis):** Tohle byl jen S&P 500. Co když chcete víc než Ameriku?
**Text:** Evropská dvojčata dalších populárních ETF a jak z nich poskládat celé portfolio najdete v taháku:
- ✓ evropská dvojčata populárních NYSE ETF, nejen na S&P 500
- ✓ jak poskládat celý svět ze dvou až tří fondů
- ✓ na co si dát pozor u českého brokera a u daní

**Formulář:** `[ vas@email.cz ]` `[ Poslat tahák ]`. Jediné pole, honeypot, validace a chybové stavy podle tech-spec kap. 7.

**Pod tlačítkem:** „Tahák stáhnete hned po odeslání.“ + „Žádný spam, odhlásit se můžete jedním kliknutím.“ + odkaz na zásady zpracování údajů.
- Větu „**pošleme vám ho i e-mailem**“ zobrazit **jen** při `EMAIL_ENABLED=true` (ověřená doména v Resendu). Jinak se nesmí objevit.

**Po odeslání:** stav úspěchu na místě formuláře, tlačítko **Stáhnout tahák (PDF)** (`rc_pdf_download`), skrýt sticky CTA.

---

## 8. Tahák (PDF) – „Z amerického videa do českého portfolia“

4–5 stran, první strana sama splní slib.

| Strana | Obsah |
|---|---|
| 1. Rychlá odpověď | Hlavní zjištění z kvízu (KID, dvojčata, poplatky) ve 3 větách + schéma „chci USA / svět / rozvíjející se trhy → tyto evropské fondy“ |
| 2. Překladový slovník NYSE → UCITS | S&P 500 (4 páry), celý US trh, MSCI World, rozvíjející se trhy, celý svět. U každého: TER, ISIN, ACC/DIST, měna, datum ověření |
| 3. Mapa indexů | S&P 500 ⊂ World, World + EM = celý svět (kvalitativně, s odkazem na metodiku MSCI; váhy jen pokud je stihneme ověřit). 3 **ilustrační** způsoby pokrytí světa, označené „ilustrace, ne doporučení“ |
| 4. ACC vs. DIST | Rozdíl pro reinvestici a pro papírování v ČR |
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
| Vizuál | 4 karty VOO · IVV · SPYM · SPY | 2 karty vedle sebe (dražší a levnější fond na S&P 500) a velké oranžové číslo rozdílu v Kč |
| Text | NENÍ ETF JAKO ETF. Stejný index S&P 500. Jiný ticker. Jiný poplatek. Které si koupíte v Česku? Otestujte se jednou otázkou → | STEJNÝ S&P 500. ROZDÍL X Kč. Při 3 000 Kč měsíčně za 20 let. A ten levnější v Česku obvykle nekoupíte. Spočítejte si to → |
| H1 na stránce | NENÍ ETF JAKO ETF | STEJNÝ S&P 500, ROZDÍL X Kč |
| Podnadpis | VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem. Které z nich si koupíte u českého brokera? | Tolik dělá rozdíl v poplatku mezi fondy na stejný index za 20 let. Které z nich si ale koupíte u českého brokera? |
| URL | `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a` | totéž s `utm_content=ad_b` |

- Bez UTM se zobrazí A. Liší se jen hero (H1 a podnadpis), otázka a zbytek stránky jsou stejné.
- **B: X a dvojice fondů** se doplní z `projection.ts` po ověření TER. Pracovně SPY vs. SPYM (největší rozdíl mezi americkými fondy, srovnání „stejný trh, stejný typ fondu“). Číslo v hero musí přesně odpovídat výchozímu nastavení jezdců a kartám pod ním.
- Každé tvrzení v reklamě musí stránka doložit.
- Do souborů reklam patří: text, popis vizuálu, formát, URL, který hero ukazuje, na jakou motivaci cílí a odkud je každé tvrzení.

---

## 10. Data (`data/etf.json`, schéma podle tech-spec kap. 4)

Fondy a kótace odděleně, každá hodnota jako `Sourced<T>` (hodnota, zdroj, `asOf`, `verifiedAt`, status). Páry NYSE ↔ UCITS přes `relatedFundIds`.

| Stav k 15. 10. 2026 | |
|---|---|
| ✅ ověřeno u State Street | SPYM 0,02 % (NYSE Arca), SPYL 0,03 %, SPY5 0,03 % (dist.) |
| ⏳ **ověřit u správce** | VOO, IVV, SPY (NYSE), **VUAA a CSPX** (0,07 % zatím jen z Lightyear, tedy agregátor, ne primární zdroj) |
| ⏳ ověřit | ISINy všech fondů |

- Fond bez `source_url` a `verified_at` neprojde `check-data` a build spadne.
- Volitelně na kartě SPYM „(dříve SPLG)“, protože ve starších videích má jiný ticker. Ověřit u State Street.

---

## 11. Měření (prefix `rc_`)

| Event | Kdy | Vlastnosti |
|---|---|---|
| (pageview) | automaticky | UTM |
| `rc_view` | kvíz ≥ 50 % ve viewportu, 1× | variant |
| `rc_answer` | odpověď na otázku | answer, variant |
| `rc_slider_change` | první pohyb každého jezdce (debounce 1 s) | slider |
| `rc_cta_click` | sticky CTA / jiné CTA na formulář | location |
| `rc_form_view` | formulář ≥ 50 % ve viewportu, 1× | variant |
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
3. **Text tlačítka** „Poslat tahák“ vs. „Chci evropská dvojčata“ → lead / `rc_form_focus`.

---

## 13. Vizuál

- Off-white podklad, tmavý inkoust, **akcent oranžová**: čísla poplatků, CTA, zvýraznění. Pravidlo: oranžově vždy to, co je mezi kartami společné (poplatky).
- Zelená jen pro odznak „nejnižší TER“ a vždy s textem, ne jen barvou.
- Americké karty zašedlé, ale čitelné (kontrast AA i u šedé!).
- Hero + otázka + tlačítka ANO/NE se musí vejít **above the fold na 360 × 640 px**. Pokud ne, 4 tickery jako jeden řádek „čipů“, ne velké karty.
- Tabulární číslice, české formáty (`0,03 %`, `4 975 Kč`), text min. 16 px, žádné gradienty, glassmorphism ani stock fotky.

---

## 14. Rozsah podle priority

**MUSÍ:** `etf.json` ověřený · hero A/B · otázka + páry + jezdce · LeadCapture → Neon · stav po odeslání + PDF · `rc_` eventy · Vercel + test na telefonu · `ads/` · README · `ai-log/`
**MĚLO BY:** PDF generované z dat · sticky CTA · FAQ · `/metodika`
**MŮŽE (jinak do „Co chybí“):** e-mail přes Resend · Playwright · obrázkové kreativy

## 15. Zakázané

Čísla mimo `etf.json`/`projection.ts` · „doporučujeme / koupíte tento“ · „zaručený výnos“ · konkrétní brokeři · slib e-mailu bez ověřené domény · druhé povinné pole · daňová tvrzení bez zdroje a data.

## 16. Otevřené body (Tom)

1. Schválit **reklamu B** (nebo dodat vlastní).
2. Vlastní doména pro Resend? Pokud ne, e-mail vypínáme a větu „pošleme i e-mailem“ mažeme.
3. Kdo je provozovatel v patičce.
