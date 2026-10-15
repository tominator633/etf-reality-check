# AI log: plánování hero sekce a reklamy A

- **Datum:** 15. 10. 2026, 14:16–16:07
- **Nástroj:** Claude (claude.ai, projekt „CLIENTELO PROJECT“), model Claude Opus 5.5
- **Kontext, ze kterého AI vycházela:** zadání B (instrukce projektu), poznámky v projektu (7 dokumentů podle kategorií: marketing, UX/UI, investiční doména, data, technika, analytika, dokumentace), dokument „ETF Reality Check“ vložený Tomem
- **Fáze:** plánování (texty reklamy a hero, maketa vizuálu). Žádný kód v tomto chatu nevznikl.

---

## Shrnutí rozhodnutí

| Téma | Rozhodnutí | Kdo rozhodl |
|---|---|---|
| Hlavní interaktivní prvek | ETF Reality Check (kvíz 2 otázky + karty NYSE ↔ UCITS + jezdce poplatků) | Tom (dodal hotový návrh) |
| Úhel reklamy A | „Není ETF jako ETF“: stejný index S&P 500, jiný ticker, jiný poplatek | Tom (vlastní koncept), AI upravila |
| Čtvrtý řádek reklamy | Otázka „Které si koupíte v Česku?“ místo tvrzení, aby reklama neprozradila odpověď na otázku 1 kvízu | AI navrhla, Tom přijal |
| CTA reklamy | „Otestujte se ve 2 otázkách →“ místo obecného „Udělejte si v ETF jasno“ | AI navrhla, Tom přijal |
| Hero | Stejný nadpis jako reklama, stejné 4 karty tickerů, primární CTA = tlačítka Ano / Ne (otázka 1 kvízu) | AI navrhla |
| Barvy | Tmavé pozadí, oranžově to, co mají fondy společné („S&P 500“), rozdílné TER bíle | Tom (oranžová pro společné), AI rozpracovala |
| Formáty reklamy | Meta feed 4 : 5 (1080 × 1350) a stories 9 : 16 (1080 × 1920) | AI |

## Kde se AI spletla nebo co bylo potřeba opravit

1. **Podklady v projektu obsahovaly tvrzení „poplatky vám mohou ukrást až 20 % zisku“.** AI ho označila jako nedoložené (modelový výpočet dává zhruba 7 %) a do reklamy ho nepoužila.
2. **První návrh reklamy od AI („Koupíte si VOO v Česku?“) Tom nahradil vlastním konceptem „Není ETF jako ETF“.** AI ho vyhodnotila jako lepší výchozí bod, ale upozornila, že chybí nejsilnější háček (americké ETF v ČR obvykle nekoupíte) a že CTA je příliš obecné.
3. **Riziko prozrazení odpovědi:** varianta s větou „a v Česku je nekoupíte“ by zničila překvapení kvízu. Vyřešeno otázkou místo tvrzení.
4. **Neověřená data v maketě:** maketa ukazuje TER všech čtyř fondů, ale z primárního zdroje je ověřené jen SPYM (0,02 %). VOO, IVV a SPY je nutné ověřit u správců (Vanguard, iShares, State Street) dřív, než se reklama použije. Do té doby neplatí řádek „TER: stránky správců fondů, 10/2026“.
5. **Formulace „v ČR nekoupíte“** musí znít „obvykle nekoupíte“ (výjimky: profesionální klient, zvláštní režimy u brokerů).

## Co zbývá

- Ověřit TER u VOO, IVV, SPY (NYSE) a VUAA, CSPX (UCITS) u správců a zapsat datum.
- Navrhnout reklamu B (pravděpodobně úhel „poplatky v Kč za 20 let“, až budou čísla ověřená).
- Uložit reklamy do `ads/reklama-a.md` a `ads/reklama-b.md` s UTM odkazy.
- Implementovat varianty hero podle `utm_content`.

---

## Průběh konverzace

### 👤 Tom

*(Vloženo celé zadání B včetně členění do 7 kategorií. Plné znění je v instrukcích projektu a v README.)*

> vem v potaz všechny zdroje tohoto projektu a zaměřme se na hero sekci a reklamy. shrň co se po nás chce v zadání a co potřebujeme vymyslet

### 🤖 Claude

*(Přečetla paměť projektu a prohledala dokumenty projektu: hero, message match, lead magnet, cílová skupina.)*

**Co chce zadání (hero a reklamy):**

| Požadavek ze zadání | Co to znamená prakticky |
|---|---|
| Dvě verze reklamy | Dvě různé reklamy, každá s jiným příslibem, obě v `ads/` |
| První obrazovka navazuje na příslib reklamy | Message match: kdo klikne na reklamu A, vidí v hero to, co mu A slíbila |
| Hero okamžitě komunikuje, co návštěvník získá | Do 5 sekund pochopí nabídku a ví, co má udělat |
| Hodnota zřejmá ještě před formulářem | Hero musí rovnou ukázat kus hodnoty (číslo nebo náhled srovnání) |
| Cílová skupina a co dostane za kontakt | Reklamy i hero se píšou pro konkrétního člověka s konkrétním problémem |
| Nesmí působit jako výstup od Claude | Žádné generické fráze ani fintech šablona |
| „Mohli bychom zítra spustit reklamu?“ | Reklama hotová k nasazení: text, vizuál, formát, URL s UTM |
| Skutečná data se zdrojem | Každé číslo v reklamě a v hero musí být doložitelné |

**Co už je v podkladech rozhodnuto:** lead magnet (PDF průvodce + odemčené srovnání), dva úhly reklam (A = poplatky, B = jednoduchost a začátek), technika přepínání hero podle `utm_content`, struktura hero (H1, podnadpis, CTA, vizuální důkaz), obsah souborů reklam.

**Co neprošlo kontrolou:** „až 20 % zisku“ (výpočet dává ~7 %), slovo „amerických“ v H1 (rozpor s UCITS), ilustrativní TER 0,07 % vs. 0,40 % (musí to být reálné fondy), obecné „pro váš dlouhodobý majetek“.

**Co musíme vymyslet:**
1. Cílovou skupinu v jedné větě (začínající český investor, zhruba 25–40 let, slyšel o ETF, bojí se chyby).
2. Klíčové číslo (proof point), které ukáže reklama, hero i kalkulačka stejně.
3. Texty hero A a hero B (H1, podnadpis, CTA).
4. Kam vede CTA v hero: doporučení ke kalkulačce nebo srovnání (hodnota nejdřív), přímý skok na formulář jako kandidát na A/B test.
5. Vizuální důkaz v hero (číslo pro A, tabulka pro B) + řádek se zdrojem a datem.
6. Reklamy jako hotové podklady (Meta feed 4 : 5 a stories 9 : 16, texty, vizuál, UTM).
7. Vazbu na A/B hypotézy (měřit `lead_success` podle `utm_content`).

Doporučení: začít klíčovým číslem, protože na něm závisí vše ostatní.

---

### 👤 Tom

*(Vložen dokument „ETF Reality Check“: návrh hlavní interaktivní komponenty. Obsahuje: název feature, strukturu komponent (QuizStep, AnswerReveal, FundPairGrid, FundCard, ProjectionSliders, AllocationBar, LeadCapture), analytické události s prefixem `rc_`, otázku 1 „VOO, IVV, SPYM, SPY: můžete si je koupit u českého brokera?“, páry NYSE → UCITS (VOO → VUAA, IVV → CSPX, SPYM → SPYL, SPY → SPY5), jezdce (výnos 6 %, 20 let, 3 000 Kč), hlášku před formulářem po otázce 2, obsah PDF „Z amerického videa do českého portfolia“ a seznam toho, co ještě ověřit.)*

> zatím se zaměříme na jednu verzi reklamy. navrhni její text a text pro hero

### 🤖 Claude

Navrhla reklamu A postavenou na otázce 1 z Reality Checku. Celá cesta drží jeden příslib: reklama položí otázku → hero zopakuje stejnou otázku → první klik na stránce je odpověď.

**Reklama A (Meta, feed 4 : 5 a stories 9 : 16):**
- Hlavní text: „Na YouTube radí VOO nebo SPY. Zkusili jste si je koupit u českého brokera? 🇨🇿 Tipněte si ve 2 otázkách a uvidíte, co koupit místo nich a kolik vás který fond stojí na poplatcích za 20 let.“
- Nadpis: „Koupíte si VOO v Česku? Otestujte se“
- Popis: „Data ze stránek správců fondů · zdarma“
- Tlačítko: Další informace (Learn More)
- Vizuál: tmavé pozadí, čtyři čipy VOO · IVV · SPY · SPYM, otázka a tlačítka Ano / Ne ve stylu ankety, žádná čísla v Kč
- URL: `/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a`

**Hero A:**
- Eyebrow: ETF Reality Check · 2 otázky
- H1: VOO, SPY, IVV… Koupíte je u českého brokera?
- Podnadpis: Tipněte si. Hned pak uvidíte jejich evropská dvojčata a kolik vás každé stojí na poplatcích za 20 let.
- CTA: tlačítka Ano / Ne (spustí AnswerReveal)
- Mikrotext: Zdarma, bez registrace. Data ze stránek správců fondů, ověřeno 10/2026.

**Proč:** 100% message match, CTA je samotná interakce (nejlepší ochrana proti odchodu v prvních sekundách), hodnota před formulářem, „bez registrace“ snižuje obavu, měření `rc_view` → `rc_q1_answer` přímo z hero.

**Upozornění:** „obvykle nekoupíte“ místo „nekoupíte“; žádná Kč čísla v reklamě, dokud nejsou ověřená TER u VOO, IVV, SPY, VUAA, CSPX; „ověřeno 10/2026“ jen pokud platí pro všechny fondy.

---

### 👤 Tom

> NENÍ ETF JAKO ETF
>
> STEJNÝ INDEX S&P 500
> RŮZNÉ TICKERY
> RŮZNÉ POPLATKY
>
> Udělejte si v ETF jasno →

### 🤖 Claude

Vyhodnotila Tomův koncept jako lepší výchozí bod než vlastní návrh.

**Co funguje:** nadpis zastaví scrollování (známý vzorec „není pivo jako pivo“), tři řádky přesně popisují obsah kvízu, žádná riziková čísla.

**Co změnit:**
1. Chybí nejsilnější překvapení (americké ETF v ČR obvykle nekoupíte). „Různé tickery“ člověka nebolí.
2. „Udělejte si v ETF jasno“ je obecné, neříká, co návštěvník udělá ani co dostane.
3. Reklama nesmí prozradit odpověď na otázku 1, proto čtvrtý řádek jako otázka.

**Upravená reklama:**
```
NENÍ ETF JAKO ETF

Stejný index S&P 500.
Jiný ticker. Jiný poplatek.

Které si koupíte v Česku?

Otestujte se ve 2 otázkách →
```
- Vizuál: čtyři karty (VOO · IVV · SPYM · SPY), na každé stejný štítek „S&P 500“ a jiné TER, TER barevně zvýrazněné
- Hlavní text: „VOO, IVV, SPYM i SPY kopírují stejný index. Liší se poplatkem a ne každý si u českého brokera koupíte. Tipněte si které a uvidíte, kolik vás každý stojí za 20 let.“
- Tlačítko Meta: Další informace

**Navazující hero:** H1 „Není ETF jako ETF“, podnadpis „VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem. Které z nich si koupíte u českého brokera?“, stejné karty jako v reklamě, CTA Ano / Ne (otázka 1), mikrotext „Zdarma, bez registrace · 2 otázky“.

**Před spuštěním:** TER ve vizuálu musí být ověřené u všech čtyř fondů; z primárního zdroje je zatím jen SPYM.

---

### 👤 Tom

> ano prosím, zatím jen pro mě

*(Odpověď na nabídku udělat maketu vizuálu reklamy.)*

### 🤖 Claude

Vytvořila soukromé designové plátno se dvěma maketami reklamy A:

- **Feed 4 : 5 (1080 × 1350)**
- **Stories 9 : 16 (1080 × 1920)** s volnými okraji nahoře ~260 px a dole ~360 px (aby text nezakrylo jméno účtu ani tlačítko Meta)

**Designová rozhodnutí:**
- Tmavé pozadí (#0F1312), oranžový akcent (#FF8A3D) pro to, co mají fondy společné („S&P 500“), rozdílné TER bíle. Akcent přepínatelný (oranžová, žlutá, mátová).
- Tickery v IBM Plex Mono (působí jako burzovní data), nadpis v Bricolage Grotesque (ne běžný fintech default typu Inter).
- Oranžové CTA pole „Otestujte se ve 2 otázkách →“, pod ním drobný řádek „TER: stránky správců fondů, 10/2026 · Nejde o investiční doporučení“.

**Upozornění:** TER na maketě jsou z Tomova dokumentu; ověřené z primárního zdroje je jen SPYM (0,02 %). VOO, IVV a SPY je potřeba ověřit před použitím reklamy.

---

### 👤 Tom

> udělej md file tohoto chatu abych ji vložil do ai-log/planning

### 🤖 Claude

Vytvořila tento soubor.
