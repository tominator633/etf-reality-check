# Rozhodnutí

Formát: datum · co · proč. Nová rozhodnutí připisuj na konec. Podklad pro README (sekce „Rozhodnutí v nejasných bodech“ a „Práce s AI“).

## Produkt a obsah

- **15. 10. 2026 · Srovnáváme NYSE ETF spolu s jejich evropskými (UCITS) dvojčaty.** Zadání chce ETF z NYSE, ale český drobný investor je kvůli chybějícímu KID (PRIIPs) u běžného brokera obvykle nekoupí. Srovnání jen amerických fondů by bylo zavádějící; páry NYSE ↔ UCITS splní zadání i realitu.
- **15. 10. 2026 · Interaktivní prvek = kvíz ETF Reality Check místo samostatné kalkulačky a srovnávače.** Návštěvník z reklamy má pár sekund; první klik je rovnou odpověď (ANO/NE), hodnota (páry + poplatky v Kč) se ukáže hned po něm, ještě před formulářem.
- **15. 10. 2026 · Páry podle správce: VOO → VUAA, IVV → CSPX, SPYM → SPYL, SPY → SPY5.** Kdo zná ticker z videa, hned vidí „svůj“ fond a jeho evropskou verzi od stejného správce.
- **15. 10. 2026 · Informace, že US ETF z ČR obvykle nekoupíte, je zdarma, ne za e-mailem.** Bez ní by obsah stránky byl zavádějící; za e-mailem je rozšíření na celé portfolio (tahák).
- **15. 10. 2026 · Žádný hypotetický „dražší fond s TER 0,40 %“.** Srovnáváme jen reálné fondy se zdrojem; vymyšlený fond by porušil požadavek na skutečná data.
- **15. 10. 2026 · Na kartě „přijdete o X Kč na poplatcích“, ne „zaplatíte“.** Rozdíl `FV(g) − FV(g − TER)` obsahuje i ušlé zhodnocení, nejen strženou částku.
- **15. 10. 2026 · Odznak „nejnižší TER“ místo „ten si koupíte“.** Fakt, ne doporučení; při shodě (SPYL i SPY5 mají 0,03 %) dostanou odznak oba.
- **15. 10. 2026 · Jezdec výnosu omezen na 2–10 %.** Vyšší hodnoty by působily jako slib výnosu.
- **15. 10. 2026 · Srovnání brokerů není v taháku.** Data se často mění a nemáme je ověřená; uvedeno v README jako další krok (obsah dalších e-mailů).
- **15. 10. 2026 · Tvrzení „poplatky vám ukradnou až 20 % zisku“ z podkladů nepoužíváme.** Kontrolní výpočet ho pro realistické scénáře nepotvrdil.
- **15. 10. 2026 · Otázka 2 („Je MSCI World celý svět?“) zrušena, kvíz má jedinou otázku.** Rozhodl Tom. Kratší cesta k formuláři (návštěvník z reklamy má pár sekund), méně dat k ověření (váhy MSCI) před termínem. Téma zůstává v taháku, kde podporuje slib „jak poskládat celý svět“.

## Konverze

- **15. 10. 2026 · Formulář hned po odhalení, s jediným polem (e-mail).** Most „Tohle byl jen S&P 500…“ navazuje na to, co návštěvník právě zjistil; mezi hodnotou a formulářem není další krok. Umístění vůči jezdcům je A/B hypotéza č. 2.
- **15. 10. 2026 · Formulář je v DOM od začátku (pod kvízem).** Sticky CTA i přímý scroll mají vždy kam vést; A/B test umístění se řeší jen přesunem v `src/app/`.
- **15. 10. 2026 · Dvě reklamy = dvě motivace na tutéž otázku** (A: „Není ETF jako ETF“ – zvědavost, jde to koupit?; B: „Stejný S&P 500, rozdíl X Kč“ – strach z přeplácení). Liší se jen hero; zároveň částečně testují hypotézu č. 1 (otázka vs. číslo v hero).

## Technika

- **15. 10. 2026 · CSS Modules + design tokeny místo Tailwindu.** Každá hodnota je záměrná, vzhled nepůsobí jako výchozí šablona; Tom je zná z Joinella.
- **15. 10. 2026 · Neon místo Supabase, bez ORM.** Jedna tabulka a jeden INSERT; Tom má s Neonem zkušenost.
- **15. 10. 2026 · Umami místo Vercel Web Analytics.** Vercel Hobby nepodporuje vlastní eventy, bez nich nejde měřit funnel.
- **15. 10. 2026 · Výpočet s efektivní měsíční sazbou `i = (1 + r)^(1/12) − 1`.** Modelových 6 % je pak skutečně 6 % ročně. Čísla z prvního mockupu (počítaná jinak) se nepoužívají.
- **15. 10. 2026 · Do tabulky `leads` ukládáme i odpověď kvízu (`quiz_answer`).** Umožní vyhodnotit, jestli odpověď (např. „ANO“ = překvapení) souvisí s konverzí, bez dalších eventů.

## Chyby AI zachycené při kontrole (podklad pro README → Práce s AI)

- **15. 10. 2026 · První verze briefu vycházela ze starších poznámek** (kalkulačka + srovnávač) místo z aktuálního konceptu Reality Check; zachyceno Tomem, brief přepsán.
- **15. 10. 2026 · Brief měl jiný vzorec (`r/12`) a jiný datový soubor (`funds.json`) než tech-spec;** srovnáno na tech-spec.
- **15. 10. 2026 · Tabulka v mockupu měla „modelový zisk“ bez odečtení poplatků** a čísla spočítaná jinou konvencí; nahrazeno výpočtem z `projection.ts` a testy.
- **15. 10. 2026 · TER VUAA a CSPX pocházely z agregátoru (Lightyear),** ne od správce; označeno jako neověřené do ověření u primárního zdroje.
