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

## Rozhodnutí z implementace (Claude Code)

- **15. 10. 2026 · Tech-spec přesunut z kořene do `docs/05-technicka-implementace.md`.** CLAUDE.md, brief i tech-spec kap. 3 ho tam očekávají; obsah beze změny.
- **15. 10. 2026 · Fonty zatím jako systémový font stack v `tokens.css` (`--font-sans`), `next/font` přidáme po výběru písem (Tom).** Nechceme vybírat písmo za Toma a systémový stack nemá žádnou síťovou zátěž ani riziko chybějící diakritiky.
- **15. 10. 2026 · Dočasná paleta v `tokens.css` a test kontrastu `src/shared/styles/tokens.test.ts`.** Test počítá kontrast podle WCAG přímo z `tokens.css` (text ≥ 4,5 : 1, okraje a fokus ≥ 3 : 1), takže finální paleta od Toma se ověří stejným `npm run test`. První návrh šedé americké karty (`#efedea`) s oranžovým číslem měl jen 4,43 : 1, opraveno na `#f3f1ee` (4,59 : 1).
- **15. 10. 2026 · Aliasy `@data/*` a `@content/*` vedle `@/*`.** Složky `data/` a `content/` jsou podle tech-spec kap. 3 mimo `src/`; aliasy jsou v `tsconfig.json` i `vitest.config.mts`.
- **15. 10. 2026 · Z šablony create-next-app vypnuté `cacheComponents` a `partialPrefetching`.** Stránka je statická, experimentální režimy nepotřebujeme; méně překvapení při buildu.
- **15. 10. 2026 · `@types/node` 22 místo 20 ze šablony.** Vitest 5 vyžaduje typy Node ≥ 22 a lokálně běží Node 22.
- **15. 10. 2026 · Všechny verze balíčků v `package.json` přesně (bez `^`).** Tech-spec kap. 1 nechce `latest`; přesné verze zaručí stejný build lokálně i na Vercelu.
- **15. 10. 2026 · `AGENTS.md` v kořeni je commitnutý.** Generuje ho `next dev` (Next.js 16.4) a při každém spuštění ho vrací; bez commitu by byl strom věčně „špinavý“.
- **15. 10. 2026 · `check-data` běží přes `node --experimental-strip-types`, bez `tsx`/`ts-node`.** Node 22 umí TypeScript spustit sám, nemusíme přidávat závislost; proto `"type": "module"` v `package.json` a importy s příponou `.ts` (`allowImportingTsExtensions`).
- **15. 10. 2026 · Logika `check-data` je čistá funkce `checkData()` s testy (`scripts/check-data.test.ts`), CLI ji jen volá.** Tech-spec 13.1 chce testovat chybějící zdroj a jednostranný pár.
- **15. 10. 2026 · `check-data` navíc hlásí chybu, když má neověřená hodnota jinou hodnotu než `null`.** Pojistka proti číslu bez zdroje („Neznámé = null + unverified“); dál kontroluje duplicitní id, kótace bez fondu a výchozí předpoklady mimo rozsah.
- **15. 10. 2026 · Rozpor brief kap. 10 × tech-spec 4.4: fond bez zdroje shodí build jen v produkci (`NODE_ENV=production`), ve vývoji varuje.** Brief prostředí nerozlišuje, tech-spec ano a vývoj s neověřenými daty by jinak nešel spustit. Lokální `npm run build` běží bez `NODE_ENV=production`, takže projde; Vercel nastavuje `production`, tam build spadne, dokud data nejsou ověřená.
- **15. 10. 2026 · Rozpor brief kap. 10 / tech-spec 4.3 × zadání session: hodnoty State Street (SPYM, SPYL, SPY5) jsou zatím `null`.** Dokumenty je vedou jako ověřené, ale bez URL a data; bez zdroje je `check-data` nepřijme. Ověřují se v kroku 2b.
- **15. 10. 2026 · `hedged: false` u všech 8 fondů.** Schéma vyžaduje boolean bez zdroje; žádný z fondů nemá v názvu „Hedged“. Ověřit spolu s ostatními údaji.
- **15. 10. 2026 · Jedna kótace na fond (ticker z briefu), burza i měna obchodování `null`.** UCITS fondy se obchodují na více burzách; kterou kótaci ukázat, rozhodne ověření u správce.
