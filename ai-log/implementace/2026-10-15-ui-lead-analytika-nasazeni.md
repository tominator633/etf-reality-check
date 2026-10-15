# AI log: implementace – data od Toma, UI, design, formulář, analytika a nasazení

- **Datum:** 15. 10. 2026 (odpoledne a večer)
- **Nástroj:** Claude Code (desktopová aplikace), model Claude Opus 5.5
- **Navazuje na:** `2026-10-15-init.md` (kroky 0–4). Tento log začíná zprávou, kde v desktopové aplikaci nefungoval `/export`.
- **Fáze:** převod logu, SPY5 → SPYL, ověřená data od Toma a nové schéma, krok 5 (hero, kvíz, odhalení), design (písma, paleta, gradient), krok 6 (formulář, `/api/lead`, Neon), úprava výchozích dokumentů, krok 8 (Umami, `rc_` eventy, CSP), push na GitHub a nasazení na Vercel (oprava CSP pro bránu Umami).
- **Forma logu:** převedeno z exportu session (zip z aplikace). Zprávy Toma a odpovědi Claude Code jsou doslova; volání nástrojů jen jako seznam (název + popis), bez výstupů. Interní úvahy modelu a výstupy nástrojů nejsou zahrnuty, e-mailové adresy jsou anonymizované.

---

### 👤 Tom

> nefunguje zde prikaz export v terminalu

### 🤖 Claude Code

Rozumím, v desktopové aplikaci `/export` nefunguje. Postupuju jinak: export z aplikace už mám, převedu ho na markdown sám.

<details><summary>Nástroje (3)</summary>

- `Bash` – Count record and block types in transcript
- `Bash` – Convert transcript to markdown AI log
- `Bash` – Spot-check generated log

</details>

### 🤖 Claude Code

Log je čitelný a e-maily jsou anonymizované. Končí v okamžiku exportu, tedy před tvým přerušením. Do README ještě doplním, že v desktopové aplikaci `/export` nefunguje, a commituju.

<details><summary>Nástroje (1)</summary>

- `Bash` – Update ai-log README and commit implementation log

</details>

### 🤖 Claude Code

Log implementace je v repu jako `ai-log/implementace/2026-10-15-init.md` a je commitnutý (`ed5b66a`, `docs: ai-log implementace kroků 0–4`).

Protože `/export` v desktopové aplikaci nefunguje, exportoval jsem session přes aplikaci. Vznikl zip s transkriptem a ten jsem převedl na markdown:
- **Struktura:** stejná jako u plánovacích logů. Tvoje zprávy a moje odpovědi jsou doslova, volání nástrojů jen jako sbalitelný seznam (název a popis, bez výstupů).
- **Co v logu není:** moje interní úvahy a výstupy nástrojů.
- **Anonymizace:** e-mailové adresy jsou nahrazené `[e-mail]`, šlo hlavně o autora commitů.
- **Rozsah:** log končí v okamžiku exportu, takže poslední výměna (tvoje přerušení a tenhle převod) v něm není.

Do `ai-log/README.md` jsem doplnil, jak se v desktopové aplikaci exportuje.

Zip zůstal ve Stažených souborech jako `session-export-1792075066327.zip`. Obsahuje i surová data session, včetně výstupů nástrojů a mých úvah, takže ho nikam nesdílej. Do repa nepatří, smaž ho, až ho nebudeš potřebovat.

### 👤 Tom

> Odstraň fond SPY5 z etf.json i ze všech textů. Páry v pairs.ts uprav na: VOO→VUAA, IVV→CSPX, SPYM→SPYL, SPY→SPYL. Jeden UCITS fond tedy může být dvojčetem víc amerických fondů. Ověř, že UI, odznak nejnižšího TER a PDF tahák to zvládnou: SPYL se v seznamu UCITS fondů nesmí zobrazit dvakrát. Zkontroluj texty v content/, které zmiňují „4 páry“ nebo počty fondů. Aktualizuj testy, spusť npm run test a npm run check:data. Rozhodnutí zapiš do docs/decisions.md.

### 🤖 Claude Code

Nejdřív zjistím, kde všude se SPY5 a počty fondů nebo párů vyskytují.

<details><summary>Nástroje (4)</summary>

- `Bash` – Find SPY5 references and counts in content
- `Bash` – Remove SPY5 and remap SPY to SPYL in etf.json
- `Write` – src/features/etf-reality-check/lib/pairs.ts
- `Write` – src/features/etf-reality-check/lib/pairs.test.ts

</details>

### 🤖 Claude Code

Do `check-data` přidám pravidlo, které při buildu odhalí to, na čem by `buildPairs` spadl: americký fond v kvízu musí mít právě jedno UCITS dvojče.

<details><summary>Nástroje (1)</summary>

- `Bash` – Add one-twin rule to check-data with tests, run suite

</details>

### 🤖 Claude Code

Testy prochází (136). Teď `check:data` ve vývoji i v produkci.

<details><summary>Nástroje (3)</summary>

- `Bash` – Run check-data in dev and production
- `Bash` – Record decisions and stage changes
- `Bash` – Commit SPY5 removal

</details>

### 🤖 Claude Code

SPY5 je vyřazený a SPY i SPYM mají teď jako dvojče SPYL. Data a výpočtová vrstva sdílené dvojče zvládnou. UI ani PDF tahák zatím neexistují (přijdou v kroku 5 a 7), takže tam to ověřit nejde, jen jsem pro ně připravil správný seznam fondů. Commit `8a979ef`.

**Co se změnilo**
- **Data:** SPY5 je pryč z `data/etf.json` i z kótací. SPY odkazuje na SPYL a SPYL zpátky na SPYM i SPY.
- **`pairs.ts`:** páry jsou VOO→VUAA, IVV→CSPX, SPYM→SPYL, SPY→SPYL. Přibyly dvě funkce:
  - `groupByUcits()` vrací 3 skupiny (VUAA←VOO, CSPX←IVV, SPYL←SPYM+SPY);
  - `uniqueUcitsFunds()` vrací VUAA, CSPX, SPYL, každý jednou.
  - Seznamy UCITS fondů se mají brát jen z těchto funkcí. Kdyby se braly přímo z párů, SPYL by tam byl dvakrát.
- **Odznak nejnižšího TER:** vrací každý fond jen jednou, i když dostane SPYL dvakrát. Test to pokrývá.
- **`check-data`:** nové pravidlo, že americký fond v kvízu má právě jedno UCITS dvojče. Oboustrannost vazby kontroloval už dřív a funguje i pro sdílené dvojče.
- **Texty v `content/`:** žádné „4 páry“, počty fondů ani SPY5 v nich nebyly, nic jsem neměnil. Zmiňují jen 4 americké tickery a ty zůstávají.

**Výsledky**
- `npm run test`: 136 testů prošlo, 6 souborů.
- `npm run check:data` ve vývoji: 0 chyb, 2 varování (ISIN VOO a IVV), exit 0.
- `npm run check:data` v produkci: 2 chyby (stejné dvě hodnoty), exit 1.

Rozhodnutí jsou v `docs/decisions.md`.

**Na co si dát pozor**
1. **Brief a tech-spec SPY5 pořád uvádějí** (brief kap. 4 a 10, tech-spec 4.3). Podle CLAUDE.md má brief při rozporu přednost, takže příští session by mohla SPY5 vrátit. Doporučuju dokumenty upravit. Mám to udělat?
2. **Mřížka párů v kroku 5:** tech-spec 6.3 počítá s tím, že jeden řádek je jeden pár. Se sdíleným dvojčetem by se v tom rozložení SPYL zobrazil dvakrát. Zapsal jsem, že mřížka bude stavět na `groupByUcits()`: jedna karta SPYL vedle SPYM a SPY. Odhalení tak bude mít 7 karet místo 8, se kterými počítá e2e test v tech-spec 13.1.
3. **Na stránce teď není žádný distribuční evropský fond.** SPY vyplácí výnos čtvrtletně, ale jeho dvojče SPYL ho reinvestuje (je akumulační). Brief chtěl na kartě SPY5 ukázat „dist.“. Jestli má rozdíl ACC/DIST zůstat vidět, patří spíš do FAQ nebo do taháku.

### 👤 Tom

> tak ETF data jsou ověřena a my můžeme pokračovat:
>
>
> Rozšiř schéma podle nových dat (listing jako objekt s exchange, ticker, tradingCurrency; baseCurrency; domicile; czRetailAvailable; sourceLabel u každé hodnoty). Odstraň SPY5, páry nastav na VOO→VUAA, IVV→CSPX, SPYM→SPYL, SPY→SPYL. Nahraď data v etf.json těmito 7 objekty :
>
> <pasted_content id="cabb">
> {
>   "id": "voo",
>   "name": "Vanguard S&P 500 ETF",
>   "issuer": "Vanguard",
>   "type": "US",
>
>   "domicile": {
>     "value": "US",
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28",
>     "note": "Fond je americká registrovaná investiční společnost (Investment Company Act of 1940)."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28"
>   },
>
>   "ter": {
>     "value": 0.0003,
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28",
>     "note": "Total Annual Fund Operating Expenses 0.03 %"
>   },
>
>   "isin": {
>     "value": "US9229083632",
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO (CUSIP)",
>     "asOf": "2026-04-28",
>     "note": "Odvozeno z CUSIP 922908363 podle ISO 6166. Shoda ověřena na Cbonds (https://cbonds.com/etf/33/), 15. 10. 2026."
>   },
>
>   "distribution": {
>     "value": "DIST",
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28",
>     "note": "Dividendy se vyplácejí čtvrtletně (březen, červen, září, prosinec)."
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28",
>     "note": "Odvozeno: NAV a finanční údaje jsou v USD, „base currency“ prospekt výslovně neuvádí."
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>     "sourceLabel": "Vanguard – prospekt VOO",
>     "asOf": "2026-04-28",
>     "note": "Odvozeno: fond drží americké akcie v USD, měnové zajištění prospekt nezmiňuje."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "NYSE Arca",
>       "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>       "sourceLabel": "Vanguard – prospekt VOO",
>       "asOf": "2026-04-28"
>     },
>     "ticker": {
>       "value": "VOO",
>       "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>       "sourceLabel": "Vanguard – prospekt VOO",
>       "asOf": "2026-04-28"
>     },
>     "tradingCurrency": {
>       "value": "USD",
>       "sourceUrl": "https://personal1.vanguard.com/pub/Pdf/p968.pdf",
>       "sourceLabel": "Vanguard – prospekt VOO",
>       "asOf": "2026-04-28",
>       "note": "Odvozeno: americká burza obchoduje v USD."
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": false,
>     "sourceUrl": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:02014R1286-20240109",
>     "sourceLabel": "Nařízení Evropského parlamentu a Rady (EU) č. 1286/2014 (PRIIPs), čl. 13",
>     "asOf": "2026-10-15",
>     "note": "Nařízení vyžaduje KID pro retailové investory v EU. Vanguard pro VOO KID nevydává (na stránkách správce není, ověřeno 15. 10. 2026), proto ho EU broker retailovému investorovi obvykle nenabídne. Znění nařízení ke 2024-01-09."
>   }
> }
> </pasted_content id="cabb">
>
> <pasted_content id="cabb">
> {
>   "id": "ivv",
>   "name": "iShares Core S&P 500 ETF",
>   "issuer": "iShares (BlackRock)",
>   "type": "US",
>
>   "domicile": {
>     "value": "US",
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Fond je americká registrovaná investiční společnost (Investment Company Act of 1940)."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Benchmark Index: S&P 500 Index"
>   },
>
>   "ter": {
>     "value": 0.0003,
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Expense Ratio 0.03 % podle aktuálního prospektu (stránka neuvádí datum, asOf = den ověření)."
>   },
>
>   "isin": {
>     "value": "US4642872000",
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV (CUSIP)",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno z CUSIP 464287200 podle ISO 6166. Shoda ověřena na Cbonds (https://cbonds.com/etf/45/), 15. 10. 2026."
>   },
>
>   "distribution": {
>     "value": "DIST",
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Distribution Frequency: Quarterly (čtvrtletní výplata dividend)."
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: NAV a čistá aktiva jsou uvedeny v USD, „base currency“ stránka výslovně neuvádí."
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>     "sourceLabel": "iShares – stránka produktu IVV",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: fond drží americké akcie v USD, měnové zajištění stránka nezmiňuje."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "NYSE Arca",
>       "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>       "sourceLabel": "iShares – stránka produktu IVV",
>       "asOf": "2026-10-15"
>     },
>     "ticker": {
>       "value": "IVV",
>       "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>       "sourceLabel": "iShares – stránka produktu IVV",
>       "asOf": "2026-10-15"
>     },
>     "tradingCurrency": {
>       "value": "USD",
>       "sourceUrl": "https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf",
>       "sourceLabel": "iShares – stránka produktu IVV",
>       "asOf": "2026-10-15",
>       "note": "Odvozeno: americká burza obchoduje v USD, závěrečná cena je uvedena v USD."
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": false,
>     "sourceUrl": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:02014R1286-20240109",
>     "sourceLabel": "Nařízení Evropského parlamentu a Rady (EU) č. 1286/2014 (PRIIPs), čl. 13",
>     "asOf": "2026-10-15",
>     "note": "Nařízení vyžaduje KID pro retailové investory v EU. iShares pro IVV KID nevydává (mezi dokumenty fondu není, ověřeno 15. 10. 2026), proto ho EU broker retailovému investorovi obvykle nenabídne. Znění nařízení ke 2024-01-09."
>   }
> }
> </pasted_content id="cabb">
>
> <pasted_content id="cabb">
> {
>   "id": "spym",
>   "name": "State Street SPDR Portfolio S&P 500 ETF",
>   "issuer": "State Street Investment Management",
>   "type": "US",
>
>   "domicile": {
>     "value": "US",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM",
>     "asOf": "2026-10-15",
>     "note": "Fond je klasifikován podle amerického Investment Company Act of 1940."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Benchmark: S&P 500 Index (od 24. 1. 2020, dříve jiné indexy)."
>   },
>
>   "ter": {
>     "value": 0.0002,
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Gross Expense Ratio 0.02 % (hrubý, před případnými slevami; dle stránky převzato z aktuálního prospektu)."
>   },
>
>   "isin": {
>     "value": "US78464A8541",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM, Listing Information",
>     "asOf": "2026-10-15"
>   },
>
>   "distribution": {
>     "value": "DIST",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Distribution Frequency: Quarterly (čtvrtletní výplata dividend)."
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM, Fund Information",
>     "asOf": "2026-10-15"
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>     "sourceLabel": "State Street – stránka produktu SPYM",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: fond drží americké akcie v USD, měnové zajištění stránka nezmiňuje."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "NYSE Arca",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>       "sourceLabel": "State Street – stránka produktu SPYM, Listing Information",
>       "asOf": "2026-10-15"
>     },
>     "ticker": {
>       "value": "SPYM",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>       "sourceLabel": "State Street – stránka produktu SPYM, Listing Information",
>       "asOf": "2026-10-15"
>     },
>     "tradingCurrency": {
>       "value": "USD",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-portfolio-sp-500-etf-spym",
>       "sourceLabel": "State Street – stránka produktu SPYM, Listing Information",
>       "asOf": "2026-10-15"
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": false,
>     "sourceUrl": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:02014R1286-20240109",
>     "sourceLabel": "Nařízení Evropského parlamentu a Rady (EU) č. 1286/2014 (PRIIPs), čl. 13",
>     "asOf": "2026-10-15",
>     "note": "Nařízení vyžaduje KID pro retailové investory v EU. State Street pro SPYM KID nevydává a stránka fondu uvádí, že produkty jsou určeny jen osobám v USA (Information for Non-U.S. Investors), ověřeno 15. 10. 2026. Proto ho EU broker retailovému investorovi obvykle nenabídne. Znění nařízení ke 2024-01-09."
>   }
> }
> </pasted_content id="cabb">
>
> <pasted_content id="cabb">
> {
>   "id": "spy",
>   "name": "State Street SPDR S&P 500 ETF Trust",
>   "issuer": "State Street Investment Management",
>   "type": "US",
>
>   "domicile": {
>     "value": "US",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: SPY je americký unit investment trust (podílový trust) kotovaný na NYSE Arca, správce i trustee jsou americké společnosti State Street."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Benchmark: S&P 500 Index"
>   },
>
>   "ter": {
>     "value": 0.000945,
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Gross Expense Ratio 0.0945 % (hrubý, před případnými slevami; dle stránky převzato z aktuálního prospektu)."
>   },
>
>   "isin": {
>     "value": "US78462F1030",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY, Listing Information",
>     "asOf": "2026-10-15"
>   },
>
>   "distribution": {
>     "value": "DIST",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY, Fund Information",
>     "asOf": "2026-10-15",
>     "note": "Distribution Frequency: Quarterly (čtvrtletní výplata dividend)."
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY, Fund Information",
>     "asOf": "2026-10-15"
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>     "sourceLabel": "State Street – stránka produktu SPY",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: fond drží americké akcie v USD, měnové zajištění stránka nezmiňuje."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "NYSE Arca",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>       "sourceLabel": "State Street – stránka produktu SPY, Listing Information",
>       "asOf": "2026-10-15"
>     },
>     "ticker": {
>       "value": "SPY",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>       "sourceLabel": "State Street – stránka produktu SPY, Listing Information",
>       "asOf": "2026-10-15"
>     },
>     "tradingCurrency": {
>       "value": "USD",
>       "sourceUrl": "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
>       "sourceLabel": "State Street – stránka produktu SPY, Listing Information",
>       "asOf": "2026-10-15"
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": false,
>     "sourceUrl": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:02014R1286-20240109",
>     "sourceLabel": "Nařízení Evropského parlamentu a Rady (EU) č. 1286/2014 (PRIIPs), čl. 13",
>     "asOf": "2026-10-15",
>     "note": "Nařízení vyžaduje KID pro retailové investory v EU. State Street pro SPY KID nevydává a stránka fondu uvádí, že produkty jsou určeny jen osobám v USA (Information for Non-U.S. Investors), ověřeno 15. 10. 2026. Proto ho EU broker retailovému investorovi obvykle nenabídne. Znění nařízení ke 2024-01-09."
>   }
> }
> </pasted_content id="cabb">
>
> <pasted_content id="cabb">
> {
>   "id": "vuaa",
>   "name": "Vanguard S&P 500 UCITS ETF (USD) Accumulating",
>   "issuer": "Vanguard",
>   "type": "UCITS",
>
>   "domicile": {
>     "value": "IE",
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29",
>     "note": "Podfond Vanguard Funds plc, UCITS schválený Central Bank of Ireland."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29",
>     "note": "Fond sleduje Standard and Poor's 500 Index."
>   },
>
>   "ter": {
>     "value": 0.0007,
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29",
>     "note": "Management fees and other administrative or operating costs 0.07 % p.a."
>   },
>
>   "isin": {
>     "value": "IE00BFMXXD54",
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29"
>   },
>
>   "distribution": {
>     "value": "ACC",
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29",
>     "note": "Výnosy se reinvestují a promítají do ceny akcií."
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating",
>     "sourceLabel": "Vanguard UK – stránka produktu VUAA, Purchase information",
>     "asOf": "2026-10-15"
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>     "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>     "asOf": "2026-09-29",
>     "note": "Odvozeno: KID upozorňuje na měnové riziko a zajištění nezmiňuje."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "Xetra (Deutsche Börse)",
>       "sourceUrl": "https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating",
>       "sourceLabel": "Vanguard UK – stránka produktu VUAA, Fund codes: EUR – Deutsche Boerse",
>       "asOf": "2026-10-15"
>     },
>     "ticker": {
>       "value": "VUAA",
>       "sourceUrl": "https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating",
>       "sourceLabel": "Vanguard UK – stránka produktu VUAA, Fund codes: EUR – Deutsche Boerse",
>       "asOf": "2026-10-15"
>     },
>     "tradingCurrency": {
>       "value": "EUR",
>       "sourceUrl": "https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating",
>       "sourceLabel": "Vanguard UK – stránka produktu VUAA, Fund codes: EUR – Deutsche Boerse",
>       "asOf": "2026-10-15"
>     }
>   },
>
>   "czRetailAvailable": {
>   "value": true,
>   "sourceUrl": "https://fund-docs.vanguard.com/ie00bfmxxd54_priipskid_en.pdf",
>   "sourceLabel": "Vanguard – KID VUAA (29. 9. 2026)",
>   "asOf": "2026-09-29",
>   "note": "Fond má PRIIPs KID vyžadovaný pro retailové investory v EU a podle KID je registrován k prodeji v dalších státech EHP. Českou republiku KID jmenovitě neuvádí."
> }
>
> }
>
>
> {
>   "id": "cspx",
>   "name": "iShares Core S&P 500 UCITS ETF USD (Acc)",
>   "issuer": "iShares (BlackRock)",
>   "type": "UCITS",
>
>   "domicile": {
>     "value": "IE",
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15",
>     "note": "Domicile: Ireland; UCITS: Yes; Issuing Company: iShares VII plc."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15",
>     "note": "Benchmark Index: S&P 500 Index"
>   },
>
>   "ter": {
>     "value": 0.0007,
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15",
>     "note": "Total Expense Ratio 0.07 % (stránka neuvádí datum, asOf = den ověření)."
>   },
>
>   "isin": {
>     "value": "IE00B5BMR087",
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15"
>   },
>
>   "distribution": {
>     "value": "ACC",
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15",
>     "note": "Use of Income: Accumulating"
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Key Facts",
>     "asOf": "2026-10-15"
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX",
>     "asOf": "2026-10-15",
>     "note": "Odvozeno: podle stránky mají měnově zajištěné třídy v názvu slovo „Hedged“; třída USD (Acc) ho nemá."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "Xetra (Deutsche Börse)",
>       "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>       "sourceLabel": "iShares – stránka produktu CSPX, Listings: Deutsche Boerse Xetra",
>       "asOf": "2026-10-15"
>     },
>     "ticker": {
>       "value": "SXR8",
>       "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>       "sourceLabel": "iShares – stránka produktu CSPX, Listings: Deutsche Boerse Xetra",
>       "asOf": "2026-10-15",
>       "note": "Na Xetře se fond obchoduje pod tickerem SXR8, ne CSPX (CSPX je ticker na London Stock Exchange v USD)."
>     },
>     "tradingCurrency": {
>       "value": "EUR",
>       "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>       "sourceLabel": "iShares – stránka produktu CSPX, Listings: Deutsche Boerse Xetra",
>       "asOf": "2026-10-15"
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": true,
>     "sourceUrl": "https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund",
>     "sourceLabel": "iShares – stránka produktu CSPX, Registered Locations",
>     "asOf": "2026-10-15",
>     "note": "Česká republika je výslovně uvedena mezi zeměmi registrace fondu."
>   }
> }
> </pasted_content id="cabb">
>
> <pasted_content id="cabb">
> {
>   "id": "spyl",
>   "name": "State Street SPDR S&P 500 UCITS ETF (Acc)",
>   "issuer": "State Street Investment Management",
>   "type": "UCITS",
>
>   "domicile": {
>     "value": "IE",
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14",
>     "note": "Domicile: Ireland; UCITS Compliant: Yes; Fund Umbrella: SSGA SPDR ETFs Europe I plc."
>   },
>
>   "index": {
>     "value": "S&P 500",
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14",
>     "note": "Benchmark: S&P 500 Index"
>   },
>
>   "ter": {
>     "value": 0.0003,
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14",
>     "note": "TER 0,03 %"
>   },
>
>   "isin": {
>     "value": "IE000XZSV718",
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14"
>   },
>
>   "distribution": {
>     "value": "ACC",
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14",
>     "note": "Income Treatment: Accumulation"
>   },
>
>   "baseCurrency": {
>     "value": "USD",
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information",
>     "asOf": "2026-10-14",
>     "note": "Share Class Currency: USD (stránka uvádí měnu třídy, ne základní měnu celého fondu)."
>   },
>
>   "hedged": {
>     "value": false,
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, výběr tříd",
>     "asOf": "2026-10-14",
>     "note": "Třída je označena jako USD Unhedged (Acc)."
>   },
>
>   "listing": {
>     "exchange": {
>       "value": "Xetra (Deutsche Börse)",
>       "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>       "sourceLabel": "State Street – stránka produktu SPYL, Listing and Ticker Information",
>       "asOf": "2026-10-14",
>       "note": "Deutsche Börse je primární burza fondu."
>     },
>     "ticker": {
>       "value": "SPYL",
>       "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>       "sourceLabel": "State Street – stránka produktu SPYL, Listing and Ticker Information",
>       "asOf": "2026-10-14"
>     },
>     "tradingCurrency": {
>       "value": "EUR",
>       "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>       "sourceLabel": "State Street – stránka produktu SPYL, Listing and Ticker Information",
>       "asOf": "2026-10-14"
>     }
>   },
>
>   "czRetailAvailable": {
>     "value": true,
>     "sourceUrl": "https://www.ssga.com/nl/en_gb/intermediary/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy",
>     "sourceLabel": "State Street – stránka produktu SPYL, Fund Information: Countries of Registration",
>     "asOf": "2026-10-14",
>     "note": "Česká republika je výslovně uvedena mezi zeměmi registrace fondu."
>   }
> }
> </pasted_content id="cabb">
>
>  UI ať zobrazuje ticker z listing.ticker (u CSPX tedy SXR8). Spusť npm run test a npm run check:data v produkčním režimu a oprav vše, co neprojde. Rozhodnutí zapiš do docs/decisions.md

### 🤖 Claude Code

Než sáhnu do schématu, ověřím dvě věci, které z dat plynou: kontrolní číslice ISINů (u VOO a IVV jsou odvozené z CUSIP) a jednotky TER.

<details><summary>Nástroje (3)</summary>

- `Bash` – Validate ISIN checksums and TER unit conversion
- `Write` – /private/tmp/claude-501/-Users-tomasruzicka-Documents-DEV-MY-PROJECTS-CLIENTELO/9f764277-a6c3-4712-8514-ff3a500ed018/scratchpad/tom-funds.json
- `Bash` – Build etf.json from Tom's objects with TER conversion

</details>

### 🤖 Claude Code

Všech 7 převodů sedí s procenty v `note`. Teď přepíšu schéma podle nového tvaru dat.

<details><summary>Nástroje (1)</summary>

- `Write` – data/schema.ts

</details>

### 🤖 Claude Code

Teď `check-data`, přepsaný pro nový tvar. Přidávám kontrolu ISIN (ISO 6166), pojistku na jednotky TER a pravidlo, že dostupnost v ČR musí odpovídat nadpisům sloupců na stránce.

<details><summary>Nástroje (2)</summary>

- `Write` – scripts/check-data.ts
- `Bash` – Run production check-data on new data

</details>

### 🤖 Claude Code

Produkční kontrola na nových datech prochází. Teď `pairs.ts`: ticker se bere z `listing.ticker`, místo `regime` se používá `type`.

<details><summary>Nástroje (1)</summary>

- `Bash` – Update pairs.ts for new schema

</details>

### 🤖 Claude Code

Teď testy. Nejdřív `pairs.test.ts`: tickery z kótací (SXR8), `type` místo `regime` a test, že ticker nebere id fondu.

<details><summary>Nástroje (1)</summary>

- `Bash` – Update pairs tests and run them

</details>

### 🤖 Claude Code

Teď přepíšu testy `check-data` pro nový tvar dat. Výchozí dataset je platný i v produkci a každý test v něm rozbije jednu věc.

<details><summary>Nástroje (6)</summary>

- `Write` – scripts/check-data.test.ts
- `Bash` – Check state of check-data test file
- `Read` – scripts/check-data.test.ts
- `Write` – scripts/check-data.test.ts
- `Bash` – Run all tests and typecheck
- `Bash` – Typecheck and grep for stale field references

</details>

### 🤖 Claude Code

Testy (141), typy i kontrola dat procházejí. Spustím ještě build a pak zapíšu rozhodnutí.

<details><summary>Nástroje (2)</summary>

- `Bash` – Run check-data dev/prod and production build
- `Bash` – Record decisions and commit new data and schema

</details>

### 🤖 Claude Code

Nová data jsou v repu a `npm run test` i `npm run check:data` v produkci prochází bez chyb. Commit `691b211`. Jednu věc jsem ale musel změnit oproti tvým datům: jednotky TER.

**TER jsem převedl na procenta.** V tvých datech je TER jako desetinný zlomek (`0.0003`), ale `projection.ts` a tech-spec 5.2 počítají s procenty (`0.03` = 0,03 %). Beze změny by výpočet ukázal poplatky stokrát menší. Převedl jsem tedy VOO 0.03, IVV 0.03, SPYM 0.02, SPY 0.0945, VUAA 0.07, CSPX 0.07 a SPYL 0.03. Každou hodnotu jsem porovnal s procenty v její `note` a převod jsem do `note` připsal. Kdybys chtěl mít v datech raději zlomky, změní se jen `projection.ts` a formátování. Řekni.

**Co se změnilo ve schématu**
- Kótace je objekt `listing` (burza, ticker, měna obchodování) přímo ve fondu.
- Zdroj mají nově i `domicile`, `hedged` a `czRetailAvailable`. Každá hodnota má `sourceUrl` a `sourceLabel`.
- Místo `regime` je `type` (US/UCITS). Pole `status`, `aum` a `kidAvailableForEURetail` zmizela.
- Datum ověření je jedno pro celý soubor (`verifiedAt: 2026-10-15`). Jednotlivá hodnota ho může přepsat.
- Schéma je přísné: neznámé pole shodí kontrolu.
- Doplnil jsem jen vazby párů (`relatedFundIds`) a `role`, které v datech chyběly. SPY5 a páry VOO→VUAA, IVV→CSPX, SPYM→SPYL, SPY→SPYL už byly z minulého commitu (`8a979ef`).

**Ticker:** komponenty stránky zatím nejsou (přijdou v kroku 5), takže to platí pro `pairs.ts`, ze kterého je bude brát. Ticker se tam čte z `listing.ticker`, u CSPX je to tedy SXR8. Test to hlídá.

**Nové kontroly v `check-data`**
- **ISIN:** kontroluje se kontrolní číslice podle ISO 6166. Všech 7 je platných, včetně VOO a IVV odvozených z CUSIP.
- **Jednotky TER:** hodnota pod 0,01 % se hlásí jako chyba, protože nejspíš jde o zlomek.
- **Dostupnost v ČR:** musí odpovídat nadpisům sloupců. Americký fond = „v ČR obvykle nekoupíte“, evropský = „koupíte“.
- **Ticker:** je povinný i ve vývoji, bez něj stránka nefunguje.

**Výsledky**
- `npm run test`: 141 testů prošlo, typy bez chyb.
- `npm run check:data`: vývoj i produkce 0 chyb, 0 varování.
- Produkční build: prošel.

Rozhodnutí jsou v `docs/decisions.md`.

**Na co si dát pozor**
1. **VUAA:** dostupnost v ČR je `true`, ale podle tvé poznámky KID Českou republiku jmenovitě neuvádí. U SPYL a CSPX je ČR výslovně mezi zeměmi registrace. Věta „Evropské dvojče · koupíte“ je tedy u VUAA nejslabší.
2. **ISIN VOO a IVV:** odvození z CUSIP jsem ověřil kontrolní číslicí. Shodu jsi ale potvrzoval na Cbonds, což je agregátor, ne správce.
3. **Brief a tech-spec jsou zastaralé:** pořád uvádějí SPY5, ticker CSPX a staré schéma (4.2). Podle CLAUDE.md má brief při rozporu přednost. Mám dokumenty upravit?
4. **Hero B:** s ověřenými TER už jde spočítat částku pro hero B (SPY vs. SPYM při výchozích jezdcích). Spočítám ji, až schválíš dvojici fondů.

### 👤 Tom

> vanguard sice ČR neuvádí, ale KID dokument existuje a to dle EU legislativy stačí. chci ted videt prehled poslednich commitu

<details><summary>Nástroje (1)</summary>

- `Bash` – List commits with change stats

</details>

### 🤖 Claude Code

Rozumím, existující KID u VUAA bereme jako dostatečný důvod pro „koupíte“.

V repu je 11 commitů, nejnovější nahoře. Nic není pushnuté a pracovní strom je čistý:

| Hash | Čas | Commit | Souborů | +/− |
|---|---|---|---|---|
| `691b211` | 18:59 | `data: ověřená data 7 fondů a nové schéma` | 7 | +669 / −786 |
| `8a979ef` | 18:09 | `feat(data): SPY5 vyřazen, SPY i SPYM mají dvojče SPYL` | 6 | +118 / −132 |
| `ed5b66a` | 16:44 | `docs: ai-log implementace kroků 0–4` | 2 | +763 / −1 |
| `4de233f` | 16:35 | `docs: ai-log z plánování (claude.ai)` | 3 | +412 |
| `3edffd2` | 16:18 | `fix: nálezy kontroly – texty jen z content/, aktualizace rozhodnutí` | 6 | +17 / −4 |
| `ed231b4` | 16:16 | `feat(content): texty stránky` | 4 | +226 |
| `2f743f3` | 16:14 | `feat(reality-check): výpočet poplatků + testy` | 7 | +343 |
| `aa9d7bf` | 16:12 | `data: TER a ISIN ověřené u správců k 15. 10. 2026` | 3 | +392 / −224 |
| `a178520` | 16:08 | `feat(data): schéma a validace dat` | 8 | +1074 / −2 |
| `773bf31` | 16:06 | `chore: init projektu` | 14 | +2526 |
| `a588719` | 16:03 | `docs: zadání projektu (brief, tech-spec, decisions, CLAUDE.md)` | 4 | +924 |

Zdůvodnění u VUAA zatím není v `docs/decisions.md`. Mám ho tam připsat a commitnout jako `docs: …`?

### 👤 Tom

> ano

<details><summary>Nástroje (1)</summary>

- `Bash` – Record VUAA decision and commit

</details>

### 🤖 Claude Code

Zdůvodnění u VUAA je v `docs/decisions.md` a je commitnuté (`33dadab`, `docs: zdůvodnění dostupnosti VUAA v ČR`). Testy před commitem prošly a pracovní strom je čistý.

Zápis říká, že VUAA vedeme jako dostupný v ČR, i když jeho KID Českou republiku jmenovitě neuvádí. Rozhodl jsi tak ty: podle PRIIPs rozhoduje, že KID existuje. U CSPX a SPYL je ČR navíc výslovně mezi zeměmi registrace.

### 👤 Tom

> tak si ted pojdme rict v jake casti projektu jsme a co je potreba udelat. zde uvadim hero sekci schema:
>
>
> NENÍ ETF JAKO ETF                       ← H1 (stejně jako reklama)
>
> VOO, IVV, SPYM a SPY sledují stejný     ← podnadpis
> S&P 500. Liší se poplatkem. Které
> z nich si koupíte u českého brokera?
>
> [ VOO ] [ IVV ] [ SPYM ] [ SPY ]        ← stejné karty jako v reklamě
>
>
>
> zde začíná container ETF Reality Check
>
> Můžete si je koupit v Česku?
>   [ ANO ]      [ NE ]                   ← CTA = TO UŽ JE otázka 1 kvízu
>
> Zdarma, bez registrace · 
> Hero tak opakuje nadpis i vizuál z reklamy a první klik je rovnou odpověď v kvízu.
>
> …..Vysvětlení…….
> Dále dva sloupce: 
> Levý sloupec - karty nyse tickerů 
> Pravý sloupec - jejich ekvivalenty ucits
> Dole 3 sliders s předvoleným
>
>  Modelový výnos před TER 6 %
>  Doba investování 20 let
> Pravidelná investice 3000
> Slider si user hýbe a mění se hodnoty

### 🤖 Claude Code

## Kde jsme

**Hotovo** (kroky 1–4 z plánu a navíc krok 11 – ověřená data):
- projekt, tokeny a testy;
- data 7 fondů ověřená u správců a validace dat;
- výpočet poplatků, páry fondů (včetně SPYL jako dvojčete SPYM i SPY) a české formáty čísel;
- texty v `content/`, kde chybějící místa jsou `[[CHYBÍ TEXT]]`;
- 142 testů prochází, `check:data` v produkci je čistý.

**Ještě neexistuje nic viditelného.** Stránka má jen nadpis.

**Zbývá podle plánu** (odevzdání zítra dopoledne):

| # | Krok | Priorita |
|---|---|---|
| 5 | Hero + otázka + odhalení (páry, karty, jezdce) – **to je tvoje schéma** | MUST |
| 6 | Formulář, `/api/lead`, Neon | MUST |
| 7 | Stav po odeslání + PDF tahák | MUST |
| 8 | Umami + `rc_` eventy | MUST |
| 9 | Hero A/B podle UTM, `ads/` | MUST |
| 10 | Vercel + test na telefonu | MUST |
| 12–13 | Sticky CTA, FAQ, `/metodika`, e2e testy | SHOULD |

## Tvoje schéma proti tomu, co je v repu

Struktura sedí s briefem i tech-specem. Rozchází se v těchto bodech:

1. **Znění otázky.** Ve schématu je „Můžete si je koupit v Česku?“. V `copy.ts` je text z briefu kap. 4: „VOO, IVV, SPYM a SPY sledují stejný S&P 500. Můžete si je koupit u českého brokera?“. Krátká verze je lepší, protože podnadpis tickery i S&P 500 těsně nad otázkou už říká. Na mobilu navíc ušetří 2 řádky.
2. **Dvě otázky za sebou.** Podnadpis končí „Které z nich si koupíte u českého brokera?“ a hned pod ním je „Můžete si je koupit v Česku?“. Ptáme se tedy dvakrát na totéž. Doporučuju podnadpis ukončit u „Liší se poplatkem.“ a otázku nechat jen v kvízu. Podnadpis je ale doslovně z briefu a reklamy (message match), takže rozhodni ty.
3. **Text pod tlačítky** končí ve schématu „Zdarma, bez registrace ·“ a za tečkou nic není. V `copy.ts` je „Zdarma, bez registrace · 1 otázka“ podle tech-specu 6.2. Mám nechat „1 otázka“?
4. **Pravý sloupec nemá 4 karty, ale 3.** SPYL je dvojče SPYM i SPY. Plánuju jednu kartu SPYL přes dva řádky vedle SPYM a SPY, ne SPYL dvakrát (zapsáno v rozhodnutích).
5. **Ticker CSPX se na stránce ukáže jako SXR8** (kótace na Xetře podle tvých dat). Kdo zná „CSPX“ z videí, nemusí ho poznat. Navrhuju malý dovětek na kartě, například „SXR8 (v Londýně CSPX)“. Text dodáš ty.
6. **Ve schématu chybí věci, které brief pod jezdci vyžaduje:**
   - souhrnná věta „Vložíte X Kč. Bez poplatků by to modelově bylo Y Kč…“;
   - povinná věta „Modelový výpočet, výnos je předpoklad, ne záruka…“;
   - na kartách velké oranžové „přijdete o X Kč na poplatcích“ a odznak „nejnižší TER“ (dostane ho SPYL, 0,03 %).
   
   Počítám s nimi, pokud neřekneš jinak.
7. **„Vysvětlení“** je v `copy.ts`, ale chybí první řádek pro odpověď ANO a pro NE (`[[CHYBÍ TEXT]]`). Bez nich krok 5 udělám, jen s viditelnými zástupnými texty.
8. **Na šířku 360 × 640 px** se H1, třířádkový podnadpis, řádek čipů, otázka, tlačítka a text pod nimi vejdou jen těsně. Zkrácení podle bodů 1 a 2 by pomohlo. Ověřím to v kroku 5 v prohlížeči na mobilním rozměru.

## Co od tebe potřebuju před krokem 5

- Rozhodnutí k bodům **1, 2 a 3** (znění otázky, konec podnadpisu, text pod tlačítky).
- Pokud je máš: první řádky odhalení po ANO a NE a text k SXR8/CSPX.
- **Paleta a fonty** můžou počkat. Krok 5 postavím na dočasných tokenech a výměna pak bude jen v `tokens.css`.

Jakmile odpovíš, pustím se do kroku 5.

### 👤 Tom

> <!-- reply 1 -->
> > Rozhodnutí k bodům 1, 2 a 3 (znění otázky, konec podnadpisu, text pod tlačítky).
>
> nevim co myslis

### 🤖 Claude Code

Mám na mysli tři drobnosti v textech hero sekce. U každé je potřeba vybrat jednu variantu:

<details><summary>Nástroje (1)</summary>

- `AskUserQuestion`

</details>

### 🤖 Claude Code

Zapracuju. Podnadpis zkrátím i u hero B: končí stejnou otázkou („Které z nich si ale koupíte u českého brokera?“) a platí pro něj stejný důvod.

<details><summary>Nástroje (2)</summary>

- `Bash` – Apply chosen hero/question texts and run tests
- `Bash` – Commit content text changes

</details>

### 🤖 Claude Code

Texty jsou upravené podle tvých voleb a commitnuté (`bf9add2`). Testy prochází.

Hero A teď vypadá takhle:
```
NENÍ ETF JAKO ETF
VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem.
[ VOO ] [ IVV ] [ SPYM ] [ SPY ]

Můžete si je koupit v Česku?
  [ ANO ]      [ NE ]
Zdarma, bez registrace
```

- **Otázka kvízu:** „Můžete si je koupit v Česku?“
- **Podnadpis hero A:** končí „…Liší se poplatkem.“
- **Podnadpis hero B:** zkrátil jsem i ten, i když ses ptal jen na A. Končil stejnou otázkou, takže teď je „Tolik dělá rozdíl v poplatku mezi fondy na stejný index za 20 let.“ (počet let se dosazuje z jezdců). Jestli má B zůstat celý, vrátím to.
- **Pod tlačítky:** „Zdarma, bez registrace“.
- **Reklamy** si svou otázku „Které si koupíte v Česku?“ ponechávají. V `ads/` je to v pořádku, protože tam kvíz není.

Rozhodnutí je zapsané v `docs/decisions.md`.

Ještě chybí první řádek odhalení po ANO a po NE a text k SXR8/CSPX. Krok 5 můžu stavět i bez nich, na jejich místě budou viditelné zástupné texty `[[CHYBÍ TEXT]]`. Mám začít?

### 👤 Tom

> ano prosim

### 🤖 Claude Code

Začínám krokem 5. Plán:
- **Server** (`page.tsx`): načte a ověří data a připraví z nich malý „view model“. Do prohlížeče nepůjde celý `etf.json` s poznámkami.
- **Hero:** vykreslí se na serveru.
- **Klient:** jen kontejner kvízu, ve kterém je stav (odpověď a jezdce).
- **Zdroj k tvrzení o KID:** místo zástupného textu použiju zdroj, který máš u `czRetailAvailable` amerických fondů (nařízení PRIIPs, čl. 13).

Nejdřív view model s testy.

<details><summary>Nástroje (3)</summary>

- `Bash` – Check bundled Next.js docs location
- `Bash` – Skim Next.js 16 docs for client components
- `Bash` – Read Next 16 server/client components guide

</details>

### 🤖 Claude Code

Server a client komponenty fungují v Next 16 standardně. Píšu view model.

<details><summary>Nástroje (2)</summary>

- `Bash` – Write view model and its tests
- `Bash` – Adjust copy for card fee split and source note

</details>

### 🤖 Claude Code

Píšu komponenty podle tech-spec kap. 3. Nejdřív doplním tokeny pro jezdce a karty, ať v CSS modulech není žádná pevná hodnota.

<details><summary>Nástroje (5)</summary>

- `Bash` – Add slider and chip tokens, create component folders
- `Bash` – Write hero and quiz-step components
- `Bash` – Write reveal, fund card and pair grid components
- `Bash` – Write sliders and container components
- `Bash` – Add hero values, public API, page; typecheck and test

</details>

### 🤖 Claude Code

Úprava: kdyby chyběl TER, stránka by ve vývoji spadla, i když hero A částku nepotřebuje. `buildHeroValues` proto místo `null` vrátí „— (neověřeno)“, stejně jako karty.

<details><summary>Nástroje (1)</summary>

- `Bash` – Make hero values never null and retest

</details>

### 🤖 Claude Code

Testy prochází. Spouštím dev server a ověřím stránku v prohlížeči na mobilní šířce 360 × 640.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: preview_start`
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Hero, otázka i tlačítka se na 360 × 640 vejdou nad ohyb s rezervou, celý blok končí zhruba v polovině obrazovky. Klikám na NE.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: find`
- `Prohlížeč: browser_batch`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Obojí bylo jen zachycení uprostřed animace. Styly sedí: ANO je bílé, NE tmavé, odhalení je u horního okraje a fokus je na jeho prvním řádku. Projdu zbytek odhalení.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: browser_batch`
- `Prohlížeč: browser_batch`

</details>

### 🤖 Claude Code

Souhrnná věta sedí s referencí: 1 360 316 Kč (případ 5.3 #1) a nejvíc 14 295 Kč u SPY (0,0945 %). Teď zkusím pohnout jezdcem klávesnicí a ověřit přepočet.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: find`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: browser_batch`

</details>

### 🤖 Claude Code

Jezdec funguje i z klávesnice. Při 25 letech se přepočítala souhrnná věta i částky na kartách a `aria-valuetext` je „25 let“. Teď opravím obě vady na kartách.

<details><summary>Nástroje (8)</summary>

- `Bash` – Shorten TER source note and remove bottom-pinned fee
- `Prohlížeč: browser_batch`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: read_console_messages`

</details>

### 🤖 Claude Code

Desktop je v pořádku a konzole je bez chyb. Kontroly před commitem: testy, typy, build a pevné barvy nebo `px` mimo tokeny.

<details><summary>Nástroje (3)</summary>

- `Bash` – Lint for hardcoded values, run tests and build
- `Bash` – Grep CSS for hardcoded colors/px, find empty dirs
- `Bash` – Record step 5 decisions and commit

</details>

### 🤖 Claude Code

Krok 5 je hotový a ověřený v prohlížeči na 360 × 640 i na desktopu. Commit `72a5f03`. Prochází 152 testů a produkční build (`check-data` 0 chyb).

**Co stránka teď dělá** (pořadí podle tvého schématu):
1. **Hero:** H1, zkrácený podnadpis a čipy VOO · IVV · SPYM · SPY, které se berou z dat.
2. **Kvíz:** otázka, tlačítka ANO / NE a pod nimi „Zdarma, bez registrace“. Celý blok se vejde nad ohyb na 360 × 640 a zabere zhruba polovinu obrazovky.
3. **Po odpovědi:** tlačítka se zablokují a zvolená odpověď zůstane zvýrazněná. Stránka se plynule posune k odhalení, s ohledem na `prefers-reduced-motion`, a fokus přejde na jeho první řádek.
4. **Odhalení:**
   - Vysvětlení o KID má zdroj přímo z tvých dat (nařízení PRIIPs, čl. 13).
   - Pod ním jsou dva sloupce. Americké karty jsou zašedlé, evropské bílé.
   - SXR8 je v pravém sloupci místo CSPX.
   - SPYL je jedna karta vedle SPYM i SPY a má odznak „✓ nejnižší TER“.
   - Každá karta má TER s odkazem na zdroj a datem a velké oranžové „přijdete o X Kč na poplatcích“.
5. **Jezdce:** výnos 6 %, doba 20 let a 3 000 Kč měsíčně, souhrnná věta a povinná věta o modelovém výpočtu.

**Co jsem ověřil v prohlížeči**
- Částky na kartách sedí s referencemi z tech-spec 5.3: 4 557 Kč (0,03 %), 10 605 Kč (0,07 %), 3 040 Kč (0,02 %), 14 295 Kč (0,0945 %). Výchozí scénář dává 1 360 316 Kč.
- Jezdec jde ovládat klávesnicí. Po posunu na 25 let se přepočítaly karty i souhrnná věta a `aria-valuetext` je „25 let“.
- V CSS nejsou pevné barvy ani `px`, nejsou prázdné složky ani importy mezi features. Konzole je bez chyb.

**Co je ještě otevřené**
- **Chybějící texty:** první řádek odhalení se zatím ukazuje jako `[[CHYBÍ TEXT: první řádek odhalení po odpovědi NE (správně)]]` (stejně u ANO). Chybí i text k SXR8/CSPX.
- **Karta SPYL:** pod jejím obsahem zůstává volné místo, protože pokrývá výšku dvou amerických karet. Vyřeším ho spolu s finální paletou.
- **Pod jezdci zatím nic není:** formulář je krok 6.

Další na řadě je krok 6: formulář s e-mailem, `/api/lead` a Neon. Na ten potřebuju `DATABASE_URL` pro Neon. Můžu ale začít i bez něj: připravím schéma a API a ověřím je přes testy. Uložení leadu do databáze pak vyzkoušíme, až URL pošleš.

### 👤 Tom

> zde je zatím jediný google font, který chci použít. 
>
> <style>
> @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');
> </style>
>
>
>
> vše prosím podle next.js konvenci jako next font. 
>
>
> líbí se mi tyhle 4 barvy 
>
> <pasted_content id="cabb">
> #FFC349
> #525EA7
> #5FACD3
> #97DDE9
> </pasted_content id="cabb">
>
> ale chci aby pozadí bylo bílé s lehkým gradientem. zbytek zatím nechám na tobě a pak se to upraví

### 🤖 Claude Code

Nejdřív ověřím, co `next/font` pro IBM Plex Sans Condensed nabízí: jaké sady znaků (kvůli české diakritice potřebuju latin-ext) a jaké řezy.

<details><summary>Nástroje (1)</summary>

- `Bash` – Look up IBM Plex Sans Condensed in next/font data

</details>

### 🤖 Claude Code

Font má latin-ext a řezy 100–700, ale 800 (`--font-weight-black`) ne, takže ho zmapuju na 700. Teď spočítám kontrasty tvých barev a navrhnu, kde kterou použít.

<details><summary>Nástroje (3)</summary>

- `Bash` – Compute contrast ratios for the new palette
- `Read` – src/shared/styles/tokens.css
- `Bash` – Rewrite color and font tokens for new palette

</details>

### 🤖 Claude Code

Překlep: azurová musí být `#97dde9`, ne `#97ddea`. Opravuju. Test kontrastu navíc zatím umí číst jen přímé hex hodnoty, ne odkazy `var(--palette-…)`, takže ho rozšířím.

<details><summary>Nástroje (1)</summary>

- `Bash` – Fix cyan typo and extend contrast test

</details>

### 🤖 Claude Code

Všech 32 kontrastních párů prochází i s novou paletou. Teď font přes `next/font` a použití nových barev v komponentách.

<details><summary>Nástroje (2)</summary>

- `Bash` – Add next/font, apply gradient and palette in components
- `Bash` – Tint shadows to new ink color and test

</details>

### 🤖 Claude Code

Testy procházejí. Ověřím vzhled v prohlížeči. Font se načítá přes `next/font`, takže restartuju dev server, aby se načetl čistě.

<details><summary>Nástroje (7)</summary>

- `Prohlížeč: preview_list`
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Barvy i font jsou na kartách použité správně. Úzký řez pomohl: názvy správců se teď vejdou na jeden řádek. Teď nedělitelná mezera v „S&P 500“.

<details><summary>Nástroje (3)</summary>

- `Bash` – Use non-breaking space in S&P 500 and enforce in test
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

„S&P 500“ už se nerozděluje. Poslední kontrola je produkční build, protože `next/font` při něm stahuje písmo z Googlu. Pak commit.

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Production build with fonts and hardcoded value check
- `Bash` – Record design decisions and commit

</details>

### 🤖 Claude Code

Písmo i paleta jsou nasazené, ověřené v prohlížeči a commitnuté (`2c6fbd8`). Prochází 159 testů a produkční build.

**Písmo:** IBM Plex Sans Condensed je přes `next/font/google` v `src/shared/lib/fonts.ts` a napojené v `layout.tsx`.
- **Diakritika:** načítá se i sada latin-ext.
- **Řezy:** jen 400, 500, 600 a 700 bez kurzív. Stránka víc nepoužívá a každý řez navíc zpomaluje první vykreslení. Kdybys chtěl kurzívu nebo tenké řezy, přidám je.
- **Načítání:** písmo stahuje Next při buildu a servíruje ho z vlastní domény, prohlížeč na Google nesahá.

**Barvy:**

| Barva | Kde |
|---|---|
| `#FFC349` žlutá | tlačítka ANO / NE (a později „Poslat tahák“), s tmavým textem |
| `#525EA7` indigo | částky „přijdete o X Kč“, výplň jezdců, zvolená odpověď, rámeček fokusu |
| `#5FACD3` modrá | proužek nahoře na evropských kartách |
| `#97DDE9` azurová | čipy tickerů v hero, konec gradientu pozadí |

- **Pozadí:** horní třetina je čistě bílá, pak jemně přechází do světle azurové.
- **Doplňkové odstíny:** tmavě modrošedý inkoust, šedé americké karty a hover tlačítek jsem dopočítal, aby ladily. Počítám s tím, že je doladíš.
- **Odznak:** „nejnižší TER“ zůstal zelený, jak chce brief.
- **Kontrasty:** všechny textové kombinace mají aspoň 4,5 : 1, kontroluje je test v `tokens.test.ts`. Žlutou ani světle modrou proto nikde nepoužívám jako text, na bílé by byly nečitelné (1,6 : 1 a 2,5 : 1).

**Jedna oprava navíc:** s užším písmem se „S&P 500“ v podnadpisu lámalo na dva řádky. V textech je teď mezi „S&P“ a „500“ nedělitelná mezera a test hlídá, aby se to nevrátilo.

Paleta a gradient nahrazují brief kap. 13, který chtěl oranžový akcent a žádné gradienty. Je to zapsané v `docs/decisions.md`.

Další na řadě je krok 6: formulář s e-mailem, `/api/lead` a Neon.

### 👤 Tom

> zkus tuto barvu spojit do gradientu s #fff na pozadí

*(Tom přerušil práci.)*

### 👤 Tom

> zkus tuto barvu FFC349 spojit do gradientu s #fff na pozadí

<details><summary>Nástroje (1)</summary>

- `Bash` – Compute yellow tint candidates and contrasts

</details>

### 🤖 Claude Code

Všechny texty mají i na žlutém konci gradientu dost kontrastu. Beru 20 % žluté (`#fff3db`): gradient je jemný, ale viditelný.

<details><summary>Nástroje (4)</summary>

- `Bash` – Switch gradient tint to light yellow and test contrast
- `Prohlížeč: resize_window`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Gradient se zobrazuje správně. Commitnu to a rozhodnutí doplním do `decisions.md`.

<details><summary>Nástroje (1)</summary>

- `Bash` – Record decision and commit gradient change

</details>

### 🤖 Claude Code

Pozadí teď přechází z bílé do světle žluté odvozené z `#FFC349` (20 % žluté, výsledek `#fff3db`). Horní třetina stránky zůstává čistě bílá, dál se jemně přidává žlutá. Ověřil jsem to v prohlížeči a commitnul jako `168b24f`.

Všechny texty mají i na nejžlutějším místě kontrast aspoň 4,5 : 1 a hlídá to test.

Jedna věc na pozor do kroku 6: tlačítko formuláře „Poslat tahák“ bude dole na stránce, kde je pozadí nejžlutější. Žluté tlačítko na žlutém pozadí má rozdíl ploch jen 1,45 : 1, takže by mohlo splývat. Tlačítka ANO / NE jsou nahoře na bílé, tam problém není. U formuláře proto dám tlačítku tmavý obrys nebo ho postavím na bílou kartu.

Kdyby chtěl gradient výraznější, můžu žlutou zvýšit na 25–30 %. Texty pořád projdou, nejhůř vychází šedý text, a to 6,8 : 1.

### 👤 Tom

> chci aby ta žlutá byla ýraznější a byla nahoře

### 🤖 Claude Code

Žlutou dám nahoru a zesílím ji. Musím ale pohlídat, aby žlutá tlačítka ANO / NE nestála na žlutém pozadí. Nejdřív kontrasty pro silnější odstíny:

<details><summary>Nástroje (5)</summary>

- `Bash` – Compute contrasts for stronger yellow tints
- `Bash` – Reverse gradient: strong yellow on top fading to white
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Žlutá je teď výrazná nahoře za nadpisem a k otázce přechází do bílé, takže tlačítka ANO / NE stojí na bílém. Commitnu to.

<details><summary>Nástroje (1)</summary>

- `Bash` – Record decision and commit gradient change

</details>

### 🤖 Claude Code

Žlutá je teď nahoře a výraznější. Nadpis stojí na sytě žlutém pozadí (55 % `#FFC349`, výsledek `#ffde9b`), které k otázce plynule přejde do bílé. Zbytek stránky je bílý. Ověřil jsem to v prohlížeči na 360 × 640 a commitnul jako `fe0d6d0`.

- **Tlačítka ANO / NE** stojí už na bílém, protože přechod končí těsně nad nimi. Žluté tlačítko na žlutém pozadí by splývalo.
- **Texty na žluté** pořád vycházejí dobře: nadpis 13 : 1, šedý podnadpis 6 : 1. Hlídá to test.
- **Tlačítko formuláře v kroku 6** bude dole na bílém, takže předchozí obava o splývání odpadá.

Kdyby měla žlutá sahat níž nebo být ještě sytější, ladí se to dvěma tokeny v `tokens.css`:
- **`--gradient-page-length`** (teď `18rem`) určuje, jak daleko žlutá sahá;
- **`--color-bg-tint`** určuje její sytost.

### 👤 Tom

> použijme tento font pro nadpisy:
>
>
> <style>
> @import url('https://fonts.googleapis.com/css2?family=Bakbak+One&family=IBM+Plex+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');
> </style>
>
> opet jako next font

<details><summary>Nástroje (2)</summary>

- `Bash` – Check Bakbak One availability in next/font
- `Bash` – Add Bakbak One via next/font and apply to headings

</details>

### 🤖 Claude Code

Nadpisy dostaly Bakbak One. Ověřím v prohlížeči, že se písmo načetlo a že má všechna česká písmena.

<details><summary>Nástroje (7)</summary>

- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Bash` – Test, build, record decision and commit

</details>

### 🤖 Claude Code

Nadpisy jsou teď v písmu Bakbak One, načteném přes `next/font` stejně jako IBM Plex Sans Condensed. Ověřil jsem to v prohlížeči a commitnul jako `f90e474`. Testy (159) i produkční build prochází.

- **Kde je použité:** v nadpisech a v otázce kvízu „Můžete si je koupit v Česku?“, protože vizuálně funguje jako nadpis. Běžný text, tickery a částky zůstávají v IBM Plex Sans Condensed, které má číslice stejně široké a čísla pod sebou lícují.
- **Řez:** Bakbak One má jen jeden řez (400). Nadpisy proto nejsou uměle ztučněné, to by vypadalo rozmazaně.
- **Diakritika:** v prohlížeči jsem ověřil, že se všechna česká písmena (ěščřžýáíéůúťďňó i velká) vykreslí přímo v Bakbak One, ne záložním písmem.
- **Stránka:** nadpis „NENÍ ETF JAKO ETF“ se teď láme na dva řádky, protože písmo je širší. Hero, otázka i tlačítka se pořád vejdou na první obrazovku mobilu 360 × 640 a tlačítka zůstávají na bílém pozadí.

S tímhle máme dvě rodiny písma, což je limit podle tech-spec 11.1. Rozhodnutí je zapsané v `docs/decisions.md`.

### 👤 Tom

> chci větší podíl žluté v gradientu a zespoda gradient fialové

<details><summary>Nástroje (7)</summary>

- `Bash` – Compute indigo tint contrasts for bottom gradient
- `Read` – src/shared/styles/tokens.css
- `Edit` – src/shared/styles/tokens.css
- `Bash` – Add CTA outline tokens, contrast pairs, button border
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Žlutá teď pokrývá celý hero včetně otázky, tlačítka mají tmavý obrys a dole je indigo. Podívám se ještě, jak vypadá konec stránky po odhalení.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Dole na stránce je indigo vidět kolem bílé karty s jezdci. Commitnu to.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Record decisions and commit gradient update

</details>

### 🤖 Claude Code

Upravil jsem gradient a ověřil ho v prohlížeči na mobilu. Commit `bf5028f`, prochází 163 testů.

- **Žlutá nahoře:** pokrývá celý hero včetně otázky a tlačítek. První kus je plně žlutý, do bílé přechází až pod tlačítky.
- **Fialová dole:** použil jsem indigo z tvé palety (`#525EA7`), ve 25 % síle, takže výsledek je světle fialovošedá. Kdybys myslel jiný odstín, pošli mi hex.
- **Tlačítka ANO / NE:** dostala tmavý obrys, protože teď stojí na žluté a žlutá plocha by s pozadím splynula.

Indigo dole je slabší, než by možná chtěl, kvůli čitelnosti. Při vyšší síle už šedý text na pozadí neprojde kontrastem. Zatím to nevadí, protože dole je jen bílá karta s jezdci. U formuláře v kroku 6 proto obarvené texty dám na bílé karty, ne přímo na pozadí.

Délku i sílu obou barev nastavíš v `tokens.css`:
- **`--gradient-top-solid`** a **`--gradient-top-end`**: kam až sahá žlutá;
- **`--gradient-bottom-length`**: jak vysoko je fialová;
- **`--color-bg-tint`** a **`--color-bg-tint-bottom`**: odstíny obou barev.

### 👤 Tom

> hero text nadpis 1 je fialový

<details><summary>Nástroje (6)</summary>

- `Bash` – Color hero H1 indigo and add contrast test
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Bash` – Record decision and commit H1 color

</details>

### 🤖 Claude Code

Nadpis „NENÍ ETF JAKO ETF“ je teď fialový. Použil jsem indigo z tvé palety (`#525EA7`), stejné jako dole v gradientu. Ověřil jsem to v prohlížeči a commitnul jako `302b9df`.

Na žlutém pozadí je dobře čitelný (kontrast 4,6 : 1), hlídá to test. Barva má vlastní token `--color-hero-title` v `tokens.css`, takže ji změníš na jednom místě.

### 👤 Tom

> text zdarma bez registrace smažeme. 4 karty nysa burzy co se zobrazuji v levem sloupci srovnavače (americka etf) zobrazime nejprve nahoře pod nadpisem 1 ve zmenšené verzi misto modrých kartiček. když visitor vybere odpověď karty nahoře zmizí a budou v té zvětšené verzi v levém sloupci tak jako doposud

### 🤖 Claude Code

Rozumím. Čtyři americké karty v malé verzi nahradí modré čipy pod nadpisem. Po odpovědi zmizí a dál se ukazují jen velké karty v levém sloupci. Text „Zdarma, bez registrace“ smažu.

Malé karty závisí na odpovědi, takže je přesunu z hero (vykresluje ho server) do kontejneru kvízu. Na stránce budou na stejném místě, hned pod podnadpisem.

Malá karta ukáže ticker a TER. TER je ověřený údaj a podle pravidel u něj musí být zdroj a datum. Na kartu širokou 76 px se odkaz nevejde, proto pod řadu karet dám jeden řádek se zdrojem a datem ověření z dat.

<details><summary>Nástroje (2)</summary>

- `Bash` – Find usages of chips and usTickers
- `Bash` – Remove hint and chips, extend view model, add preview copy

</details>

### 🤖 Claude Code

Teď malá varianta karty a nová komponenta `us-fund-preview` s řadou čtyř malých karet.

<details><summary>Nástroje (1)</summary>

- `Bash` – Add compact card variant and preview component

</details>

### 🤖 Claude Code

Testy prochází. Kontrola v prohlížeči na 360 × 640: vejde se všechno nad ohyb?

<details><summary>Nástroje (3)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Skoro to sedí, jen u SPY se „0,0945 %“ zalomilo a znak % spadl na další řádek. V malé kartě dám „TER“ a hodnotu na samostatné řádky a hodnotu nenechám lámat.

<details><summary>Nástroje (4)</summary>

- `Bash` – Keep compact TER value on one line
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Žádná karta nepřetéká a tlačítka končí na 459 px z 640, takže se vejdou nad ohyb. Teď kliknu na odpověď a ověřím, že malé karty zmizí.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Bash` – Checks, build, record decisions, commit

</details>

### 🤖 Claude Code

Hotovo a ověřené v prohlížeči na mobilu (commit `fdb8657`). Prochází 165 testů i produkční build.

- **Před odpovědí:** pod nadpisem jsou místo modrých čipů 4 malé karty VOO, IVV, SPYM a SPY. Každá ukazuje ticker a TER se stejnými daty jako levý sloupec srovnávače.
- **Po odpovědi:** malé karty zmizí a stejné fondy jsou ve velkých kartách v levém sloupci jako doteď.
- **Text „Zdarma, bez registrace“** je smazaný.
- **Na první obrazovce mobilu** se vejde nadpis, podnadpis, karty, otázka i tlačítka. Tlačítka končí zhruba na dvou třetinách výšky.

**Jeden text navíc ke schválení.** Pod malými karty jsem přidal řádek: „TER podle stránek a dokumentů správců, ověřeno 15. 10. 2026. Zdroje u karet po odpovědi.“ Pravidla projektu chtějí u každého ověřeného údaje zdroj a datum. Na kartu širokou 76 px se odkaz na zdroj nevejde, proto je zdroj pro všechny čtyři karty v tom jednom řádku pod nimi. Datum se bere z dat. Znění jsem navrhl já, tak ho klidně přepiš nebo zkrať.

Malé karty jsem musel přesunout z hero (vykresluje ho server) do kontejneru kvízu, protože mizí podle odpovědi. Na stránce stojí na stejném místě. Rozhodnutí je zapsané v `docs/decisions.md`.

### 👤 Tom

> #57008E. bude místo 525EA7

<details><summary>Nástroje (7)</summary>

- `Bash` – Compute contrasts for new purple
- `Bash` – Find indigo references in code
- `Bash` – Find indigo references in code
- `Bash` – Replace indigo with purple #57008E in tokens
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Nová fialová je vidět v nadpisu i dole v gradientu. Kontroluju ještě odhalení (částky, jezdce, zvolenou odpověď) a pak commitnu.

<details><summary>Nástroje (4)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: resize_window`
- `Bash` – Record decision and commit purple change

</details>

### 🤖 Claude Code

Fialová `#57008E` teď všude nahrazuje `#525EA7`. Ověřil jsem to v prohlížeči na mobilu a commitnul jako `7b4dc98`, 165 testů prochází.

- **Kde je vidět:** nadpis v hero, částky „přijdete o X Kč“, výplň jezdců, zvolená odpověď a rámeček fokusu.
- **Čitelnost se zlepšila:** nová barva je tmavší. Na bílé má kontrast 11,7 : 1 (dřív 6 : 1), na žlutém pozadí 9 : 1.
- **Spodek gradientu:** je z barvy odvozený, takže jsem ho přepočítal na 15 % nové fialové (`#e6d9ee`). Je zhruba stejně světlý jako dosud. Při silnějším odstínu by červený text chybových hlášek přestal být dost čitelný.

Rozhodnutí je zapsané v `docs/decisions.md`.

### 👤 Tom

> ano nebo ne budou mít po kliknutí bud zelenou nebo červenou barvu podle toho jestli visitor stikl spravne NE nebo špatně - ANO.
>
>
> Text
> VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem.
>
> chci zmenit a rozdelit do více řádků a změnít velikosti každého z nich aby to bylo vizuálně chytlavější:
>
> hned pod nadpisem prvni radek:
>
> VOO, IVV, SPYM a SPY jsou populární americká ETF
>
> potom druhy radek:
> všechny sledují stejný index S&5 500
>
> potom treti radek:
> Liší se poplatkem (TER)

### 🤖 Claude Code

Rozumím. Dvě změny:
1. **Barva odpovědi:** po kliknutí zezelená NE (správně), nebo zčervená ANO (špatně). Barva nesmí být jediný nositel významu, protože ji část lidí nerozliší a čtečka obrazovky ji neoznámí. Tlačítko proto dostane i symbol ✓ nebo ✗ a pro čtečky skrytý text „správně“ / „špatně“.
2. **Podnadpis na tři řádky** s různou velikostí. Ve druhém řádku opravuju překlep „S&5 500“ na „S&P 500“.

Brief chtěl zelenou jen pro odznak „nejnižší TER“, zapíšu to tedy do rozhodnutí. Nejdřív spočítám kontrast bílého textu na zelené a červené.

<details><summary>Nástroje (1)</summary>

- `Bash` – Compute contrasts for green/red answer states

</details>

### 🤖 Claude Code

Zelená `#15803d` (bílý text 5 : 1) a červená = stávající barva chyb `#b42318` (6,6 : 1). Obě se od žlutého pozadí odliší aspoň 3,9 : 1.

<details><summary>Nástroje (10)</summary>

- `Bash` – Review quiz-step and quiz copy
- `Bash` – Color chosen answer green/red with symbol and SR text
- `Bash` – Tokenize hidden size, remove unused selected token
- `Bash` – Split hero subtitle into three styled lines
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

ANO po kliknutí zčervená a dostane symbol ✗. Text „špatně“ je pro čtečky. Ověřím, že je vizuálně opravdu skrytý, a vyzkouším i NE.

<details><summary>Nástroje (8)</summary>

- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: resize_window`
- `Bash` – Checks, build, record decisions, commit

</details>

### 🤖 Claude Code

Obojí je hotové a vyzkoušené v prohlížeči na mobilu. Commit `b840be8`, prochází 174 testů i produkční build.

**Barva odpovědi**
- **ANO (špatně)** po kliknutí zčervená a dostane ✗.
- **NE (správně)** zezelená a dostane ✓.
- Druhé tlačítko zbělá a zablokuje se.
- Symboly jsem přidal, aby význam nenesla jen barva, kterou část lidí nerozliší. Čtečka obrazovky navíc přečte „ANO – špatně“ nebo „NE – správně“.
- Bílý text je dobře čitelný na zelené (5 : 1) i na červené (6,6 : 1).

**Podnadpis na tři řádky**, velikost stoupá:
1. „VOO, IVV, SPYM a SPY jsou populární americká ETF“: střední, šedý.
2. „všechny sledují stejný index S&P 500“: větší, tučný. Opravil jsem překlep „S&5 500“.
3. „Liší se poplatkem (TER)“: největší, písmem nadpisů, jako pointa těsně před otázkou.

Na mobilu 360 × 640 se pořád všechno vejde na první obrazovku: tlačítka ANO / NE končí na 556 px z 640. Rezerva je ale malá, takže další řádek nahoře už by je posunul pod okraj.

Brief chtěl zelenou jen pro odznak „nejnižší TER“, proto je tvoje rozhodnutí o barvách odpovědi zapsané v `docs/decisions.md`.

### 👤 Tom

> dobře design nechme ted stranou. co je dále v pořadí na implementaci?

### 🤖 Claude Code

Hotové jsou kroky 1–5 a navíc krok 11 (ověřená data). Další podle plánu (tech-spec kap. 14) je **krok 6: formulář a ukládání leadů**. Je to první krok, bez kterého stránka nesplní svůj účel, protože konverze = uložený e-mail.

## Co zbývá

| # | Krok | Priorita | Co obnáší |
|---|---|---|---|
| **6** | **Formulář + `/api/lead` + Neon** | MUST | Úvodní text nad formulářem („Tohle byl jen S&P 500…“), 3 body, pole e-mail, past na boty (skryté pole). Server ověří e-mail, omezí počet pokusů a uloží lead do Neonu. Ošetřené chyby: neplatný e-mail, server, timeout. |
| 7 | Stav po odeslání + PDF tahák | MUST | Potvrzení, tlačítko „Stáhnout tahák (PDF)“, zapamatování „už odesláno“. Samotné PDF: 4–5 stran z `etf.json`. |
| 8 | Umami + `rc_` eventy | MUST | Měření cesty od zobrazení stránky po uložený lead. |
| 9 | Hero A/B podle UTM + `ads/` | MUST | `proxy.ts` (v Next 16 nahrazuje `middleware.ts`), stránky `/v/a` a `/v/b`, soubory reklam. Částku pro hero B už umíme spočítat. |
| 10 | Nasazení na Vercel | MUST | Napojení Neonu, test na skutečném telefonu. |
| 12 | Sticky CTA, FAQ, `/metodika`, zásady ochrany údajů | SHOULD | |
| 13 | E2E testy (Playwright), Lighthouse | SHOULD | |
| 14 | E-mail přes Resend | COULD | Jen s vlastní doménou. |

Termín je zítra dopoledne, takže navrhuju jet 6 → 7 → 9 → 8 → 10 a SHOULD jen podle času. Hero B jsem posunul dopředu, protože hlavní výpočet už je hotový.

## Co od tebe potřebuju na krok 6

**Abych mohl začít:**
- Odsouhlasit dva nové balíčky: `@neondatabase/serverless` a `server-only`. Oba jsou ve stacku z tech-specu, jen je ještě nemám nainstalované.

**Aby šlo ukládat doopravdy** (kód napíšu i bez toho):
- **`DATABASE_URL`** pro Neon (ideálně dev větev). Vlož ho prosím sám do `.env.local`, do chatu ho nepiš. Bez něj server poctivě vrátí chybu 500, falešný úspěch stránka neukáže, a celé to otestuju s napodobenou databází.

**Texty, které zatím chybí** (do té doby budou `[[CHYBÍ TEXT]]`):
- popisek pole e-mail;
- hláška pro neplatný e-mail a pro chybu serveru;
- nadpis a text po odeslání (krok 7);
- provozovatel do zásad ochrany údajů a do patičky. Odkaz na zásady je pod tlačítkem povinný, takže stránka `/zasady-ochrany-udaju` musí existovat aspoň jako kostra.

**Mimo implementaci:**
- Brief a tech-spec jsou zastaralé: pořád v nich je SPY5, ticker CSPX, staré schéma dat a původní barvy. Podle CLAUDE.md má brief při rozporu přednost, takže by bylo dobré je srovnat se stavem v `decisions.md`. Můžu je upravit, když budeš chtít.
- Na konci session je potřeba uložit `ai-log`. Udělám to stejně jako minule, přes export z aplikace.

Mám pustit krok 6? Pokud ano, potvrď prosím ty dva balíčky.

### 👤 Tom

> dobře připrav cta tlacitko na CHCI KOMPLETNÍ SROVNÁNÍ V PDF. nad nim bude text o tom co visitor ziska. zatim staci placeholder. po kliknutí se zobrazí formulář s inputem na mail a tlačítko odeslat pdf, zajisti front end i back end ochranu inputu, postupuj dle tech dokumentace a pouzij input sanitizer. 
>
> priprav mi sql prikaz na neon db

### 🤖 Claude Code

Pustím se do toho. Oproti tech-specu a briefu jsou v zadání tři změny nebo nejasnosti, rozhodnu je takto a zapíšu:

1. **Dvoukrokový formulář.** Brief chce formulář s jediným polem rovnou pod odhalením. Ty chceš nejdřív tlačítko a formulář až po kliknutí. Řídím se tebou.
2. **Text tlačítka „Odeslat PDF“** naznačuje, že PDF přijde e-mailem. E-mail ale zatím vypnutý (`EMAIL_ENABLED=false`) a brief smí slib e-mailu dát jen s ověřenou doménou. Text použiju, jak chceš, a nahlásím to v reportu.
3. **„Input sanitizer“** udělám jako vlastní funkci, ne jako knihovnu. U e-mailu sanitizace znamená vyčistit vstup a pak ho pustit jen přes přísný seznam povolených znaků, na to knihovna není potřeba. Knihovny jako DOMPurify řeší HTML, ne e-mail.

Nejdřív nainstaluju dva balíčky ze stacku tech-specu.

<details><summary>Nástroje (1)</summary>

- `Bash` – Install Neon driver and server-only pinned

</details>

### 🤖 Claude Code

Teď sanitizace vstupu a schéma požadavku. Obojí sdílí klient i server, takže ochrana platí na obou stranách se stejnými pravidly.

<details><summary>Nástroje (1)</summary>

- `Bash` – Write sanitizer, its tests and lead schema

</details>

### 🤖 Claude Code

Beru na vědomí: po dokončení formuláře upravím brief, tech-spec a CLAUDE.md podle všeho, co jsme od začátku změnili, a commitnu to zvlášť. Teď testy schématu.

<details><summary>Nástroje (1)</summary>

- `Bash` – Write lead schema tests and run them

</details>

### 🤖 Claude Code

Sanitizace drží i proti pokusům o vložení skriptu, hlavičky `Bcc:` nebo SQL. Teď serverová část: rate limit, uložení leadu a route `/api/lead`.

<details><summary>Nástroje (3)</summary>

- `Bash` – Write DB schema, saveLead, rate limiter and tests
- `Bash` – Write /api/lead route with tests; update copy
- `Bash` – Write client submit logic, storage helper and tests

</details>

### 🤖 Claude Code

Test zachytil skutečnou chybu: odpověď `{ ok: false }` bez kódu by vrátila `code: undefined`. Opravuju to, aby neznámý nebo chybějící kód vedl vždy na `server_error`.

<details><summary>Nástroje (4)</summary>

- `Bash` – Fall back to server_error for unknown codes
- `Bash` – Write LeadCapture, privacy page skeleton, compose page
- `Bash` – Fix test mock type and rerun
- `Bash` – Move consent version to lead feature constant

</details>

### 🤖 Claude Code

Všech 220 testů prochází. Vyzkouším formulář v prohlížeči. Nejdřív zjistím, jestli `.env.local` obsahuje `DATABASE_URL`. Hodnotu číst nebudu, jen jestli tam klíč je.

<details><summary>Nástroje (1)</summary>

- `Bash` – Check whether DATABASE_URL is configured locally

</details>

### 🤖 Claude Code

`DATABASE_URL` zatím není nastavený. Server tedy musí vrátit chybu 500 a stránka ukázat chybovou hlášku, ne falešný úspěch. Přesně to ověřím.

<details><summary>Nástroje (9)</summary>

- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Prohlížeč: find`
- `Prohlížeč: computer`
- `Prohlížeč: computer`
- `Prohlížeč: computer`
- `Prohlížeč: computer`

</details>

### 🤖 Claude Code

Klik se nepovedl, sáhl jsem na špatnou referenci. Podezřelé ale je, že ani dřívější klik na NE přes JavaScript nic neudělal. Stránka se možná nehydratovala, takže zkontroluju konzoli.

<details><summary>Nástroje (1)</summary>

- `Prohlížeč: read_console_messages`

</details>

### 🤖 Claude Code

Chyby v konzoli nejsou. Klik nejspíš přišel dřív, než se stránka hydratovala. Zkusím to znovu skutečným klikem.

<details><summary>Nástroje (7)</summary>

- `Prohlížeč: browser_batch`
- `Prohlížeč: browser_batch`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: computer`
- `Bash` – Add security headers, focus fix; test and build
- `Bash` – Verify security headers and API method handling

</details>

### 🤖 Claude Code

Hlavičky se posílají a API odmítá jiný typ obsahu (415) i metodu GET (405). Teď zapíšu rozhodnutí a commitnu krok 6. Pak upravím výchozí dokumenty.

<details><summary>Nástroje (2)</summary>

- `Prohlížeč: resize_window`
- `Bash` – Record step 6 decisions and commit

</details>

### 🤖 Claude Code

Krok 6 je commitnutý (`33baedf`). Teď výchozí dokumenty: brief, tech-spec a CLAUDE.md uvedu do souladu se vším, co jsme od rána změnili. Pravidla zůstávají, mění se jen věcný stav.

<details><summary>Nástroje (4)</summary>

- `Bash` – Review brief section layout before editing
- `Bash` – Read brief sections to be updated
- `Bash` – Update brief.md to match later decisions
- `Bash` – Finish brief edits for ad visual and hypotheses

</details>

### 🤖 Claude Code

Teď tech-spec. Upravím hlavičku verze, styly, strukturu, schéma dat, kontroly, komponenty, formulář, testy a plán (stav kroků).

<details><summary>Nástroje (3)</summary>

- `Bash` – Update tech-spec to version 3.2 reflecting decisions
- `Bash` – Fix contrast note in tech-spec, review CLAUDE.md
- `Bash` – Update CLAUDE.md, record decision, commit docs

</details>

### 🤖 Claude Code

Formulář s CTA tlačítkem i backend jsou hotové, ale lead se zatím do Neonu reálně neuložil, protože chybí `DATABASE_URL`. Ověřené je to testy (220) a v prohlížeči proti napodobené databázi. Krok 6 je commit `33baedf`, výchozí dokumenty `f867c1e`.

## Formulář
- **Před kliknutím:** bílá karta pod kvízem. Nahoře je zástupný text `[[CHYBÍ TEXT: …]]` o tom, co návštěvník získá, pod ním tlačítko **CHCI KOMPLETNÍ SROVNÁNÍ V PDF**.
- **Po kliknutí:** pole e-mail (kurzor rovnou v něm), tlačítko **Odeslat PDF**, pod ním texty z briefu a odkaz na zásady zpracování údajů.
- **Po potvrzení serveru:** potvrzení a tlačítko „Stáhnout tahák (PDF)“. Samotné PDF vznikne až v kroku 7, do té doby odkaz vede na neexistující soubor.

## Ochrana vstupu
Stejné pravidlo kontroluje e-mail v prohlížeči i na serveru:
- **Čištění vstupu:** odstraní neviditelné a řídicí znaky, mezery na okrajích a převede na malá písmena.
- **Přísná kontrola formátu:** max. 254 znaků.
- **Testy** zachytí pokusy jako `<script>`, `\r\nBcc:` nebo `'; DROP TABLE`.

Na serveru navíc:
- jen JSON (jinak 415), max. 4 kB (jinak 413);
- 5 pokusů za 10 minut z jedné IP (jinak 429);
- past na boty a odeslání do 2 s: tváří se jako úspěch, ale nic se neuloží;
- duplicitní e-mail vrátí stejnou odpověď jako nový;
- bez databáze vrátí 500, nikdy falešný úspěch;
- data do databáze jdou jen jako parametry dotazu, e-mail se nikam neloguje.

Nově posílám i bezpečnostní hlavičky. „Input sanitizer“ jsem udělal jako vlastní funkci, ne knihovnu: na e-mail stačí vyčistit vstup a pustit ho jen přes povolené znaky.

## SQL pro Neon
Spusť jednou v **Neon Console → SQL Editor**, zvlášť pro dev i produkční větev. Je i v `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL UNIQUE
                              CHECK (char_length(email) BETWEEN 3 AND 254 AND email = lower(email) AND email LIKE '%_@_%'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  variant         text        NOT NULL DEFAULT 'a' CHECK (variant IN ('a', 'b')),
  utm_source      text        CHECK (char_length(utm_source) <= 100),
  utm_medium      text        CHECK (char_length(utm_medium) <= 100),
  utm_campaign    text        CHECK (char_length(utm_campaign) <= 100),
  utm_content     text        CHECK (char_length(utm_content) <= 100),
  quiz_answer     text        CHECK (quiz_answer IN ('ano', 'ne')),
  consent_version text        NOT NULL CHECK (char_length(consent_version) BETWEEN 1 AND 50)
);
```

Kontroly `CHECK` jsou druhá pojistka za API. Databáze nepřijme nic, co by aplikace neměla poslat. IP adresu ani prohlížeč neukládáme.

Pak vlož připojovací URL z Neonu do souboru `.env.local` jako `DATABASE_URL=…` (do chatu ji neposílej) a restartuj `npm run dev`. Odeslání formuláře by pak mělo založit řádek v tabulce.

## Dokumenty
Upravil jsem `brief.md`, tech-spec (teď verze 3.2) a `CLAUDE.md` podle všeho, co jsme dnes změnili. V tech-specu přibyl i sloupec se stavem kroků. Do CLAUDE.md jsem přidal pravidlo, že při změně zadání se upravují i tyhle dokumenty.

## Potřebuju rozhodnout
- **Text tlačítka „Odeslat PDF“** slibuje, že PDF přijde e-mailem. E-mail je ale vypnutý a podle briefu ho bez vlastní domény slíbit nesmíme. Buď text změníme (třeba „Stáhnout PDF“), nebo zapneme e-mail přes Resend.
- **Zástupné texty** (`[[CHYBÍ TEXT]]`): nabídka nad tlačítkem, popisek pole, chybové hlášky, stav po odeslání a zásady zpracování údajů včetně provozovatele.

### 👤 Tom

> jak je to s proměnnými prostředí? mám dát database url do env local nebo do env? k čemu máš reálně přístup?

### 🤖 Claude Code

**Dej to do `.env.local`.** Technicky by Next.js načetl i `.env`, ale tajné hodnoty patří podle konvence do `.env.local`:

| Soubor | K čemu | V gitu? |
|---|---|---|
| `.env.local` | tajné hodnoty pro tvůj počítač (`DATABASE_URL`, později klíče) | ne |
| `.env` | výchozí hodnoty bez tajemství; má nižší prioritu než `.env.local` | u nás také ne |
| `.env.example` | seznam klíčů bez hodnot, aby každý věděl, co nastavit | ano |

Náš `.gitignore` ignoruje všechny `.env*` kromě `.env.example`, takže do repa se nedostane ani jeden. `npm run dev` změnu `.env.local` načte sám, restart by neměl být potřeba.

**Na Vercelu** se žádný soubor nepoužívá. `DATABASE_URL` se nastaví v nastavení projektu (Environment Variables), nebo ji tam zapíše sama integrace Neon ↔ Vercel. Pro produkci tedy nic nikam nekopíruješ.

## K čemu mám reálně přístup
Příkazy spouštím na tvém počítači s tvými právy a v tomhle projektu.
- **Technicky můžu přečíst i `.env.local`.** Nic mi v tom nebrání, pokud to sám nezakážeš.
- **Zatím jsem obsah nečetl.** Dřív jsem jen počítal, jestli soubor obsahuje neprázdný řádek `DATABASE_URL=` (`grep -c`), hodnota se nevypsala.
- **Cokoli přečtu, je v konverzaci** a odchází tedy na servery Anthropicu. Proto hodnoty nevypisuju a připojovací URL mi neposílej do chatu.
- **Aplikaci můžu spustit s tvou databází:** dev server a testy si `.env.local` načtou samy, aniž bych hodnotu viděl. Takhle můžu ověřit, že se lead uloží, bez čtení URL.
- **Do Neonu, Vercelu ani GitHubu přístup nemám.** Mimo tenhle počítač se nepřihlašuju, tabulku tedy musíš založit ty v Neon SQL Editoru.

## Jak riziko snížit
1. **Použij dev větev Neonu**, ne produkční. Kdyby URL unikla, jde jen o testovací data.
2. **Můžeš mi čtení zakázat.** V nastavení Claude Code (`.claude/settings.json`) jde přidat pravidlo `deny` pro čtení `.env*`. Pak soubor technicky číst nemůžu a dev server ho dál používá. Mám to nastavit?
3. **Volitelně omezená role v Neonu:** aplikace potřebuje jen `INSERT` (a `SELECT` kvůli `RETURNING id`) na tabulku `leads`. Vlastník databáze není nutný.

Až bude `DATABASE_URL` v `.env.local` a tabulka založená, dej vědět. Odešlu testovací lead přes formulář na `localhost`, ověřím, že API vrátí 200 a stránka ukáže úspěch, a vyzkouším i duplicitní e-mail. Řádek v tabulce si pak zkontroluješ v Neonu, já do něj nevidím.

### 👤 Tom

> dobře, obě větve mají table, v env local je database url

### 🤖 Claude Code

Vyzkouším to. Nejdřív zkontroluju, že dev server načetl nový `.env.local`.

<details><summary>Nástroje (8)</summary>

- `Prohlížeč: preview_logs`
- `Bash` – List env files, check gitignore, show key names only
- `Bash` – Submit a test lead and a duplicate to local API
- `Bash` – Read-only check that the test lead row exists once
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/?utm_source=claude_test&utm_medium=local&utm_content=ad_a
- `Prohlížeč: find`
- `Prohlížeč: browser_batch`

</details>

### 🤖 Claude Code

Formulář přes prohlížeč prošel: server vrátil 200 a ukázal se stav úspěchu. Chyba 500 v seznamu je starší požadavek z doby bez databáze. Ověřím uložený řádek.

<details><summary>Nástroje (3)</summary>

- `Bash` – Verify the UI-submitted test lead row
- `Prohlížeč: resize_window`
- `Bash` – Mark step 6 verified in docs and commit

</details>

### 🤖 Claude Code

Ukládání leadů do Neonu funguje. Ověřil jsem to přímo přes API i přes formulář v prohlížeči a v databázi jsem zkontroloval uložené řádky (commit `2d3ec05`).

| Test | Výsledek |
|---|---|
| Nový e-mail přes API | 200, v tabulce právě 1 řádek |
| Stejný e-mail znovu | 200, žádný další řádek (duplicita se tiše ignoruje) |
| Formulář v prohlížeči (ANO → CTA → e-mail `[e-mail]`) | 200, ukázal se stav úspěchu a řádek se uložil |

Uložený řádek z formuláře obsahuje:
- e-mail převedený na malá písmena;
- odpověď kvízu `ano`;
- UTM z URL (`claude_test`, `ad_a`);
- verzi souhlasu.

Řádky jsem kontroloval dotazem jen pro čtení. Node si `DATABASE_URL` načetl přímo z `.env.local` a připojovací řetězec se nikde nevypsal.

**V tabulce zůstaly 2 testovací řádky** (`[e-mail]` a `[e-mail]`, oba s `utm_source = claude_test`). Nevím, na kterou větev `.env.local` míří; čekám, že na dev. Pokud ano, můžou tam zůstat. Jinak je smaž v Neon SQL Editoru:

```sql
DELETE FROM leads WHERE utm_source = 'claude_test';
```

Mazat jsem je sám nechtěl, protože je to zásah do databáze.

Další krok je 7: PDF tahák a zapamatování „už odesláno“. Ještě zbývá rozhodnout text tlačítka „Odeslat PDF“, protože e-mail je zatím vypnutý.

### 👤 Tom

> text tlačítka a placeholdery ted nemusime resit. co mame dale?

### 🤖 Claude Code

Hotové jsou kroky 1–6 a ověřená data (krok 11). Zbývají tyhle MUST kroky:

| # | Krok | Co obnáší | Co od tebe potřebuju |
|---|---|---|---|
| **7** | **PDF tahák + „už odesláno“** | Zapamatování odeslání (po načtení stránky znovu ukáže úspěch a odkaz na PDF). Generování PDF (`@react-pdf/renderer`) z `etf.json`, 4–5 stran podle briefu kap. 8. | Obsah PDF: texty stran, fondy pro tahák (MSCI World, EM, celý svět), daňová pravidla se zdrojem. Do PDF by šlo hlavně `[[CHYBÍ TEXT]]`. Hotově z dat půjde jen strana 2 (překladový slovník NYSE → UCITS). |
| **9** | **Hero A/B podle UTM + `ads/`** | `proxy.ts`, statické stránky `/v/a` a `/v/b`, hero B s vypočtenou částkou. Soubory `ads/reklama-a.md` a `ads/reklama-b.md` s texty z briefu a čísly z výpočtu. | Nic, dvojici SPY vs. SPYM beru pracovně. |
| **8** | **Umami + `rc_` eventy** | Měřicí skript, `track()`, 11 eventů z tech-spec 9.2, CSP hlavička povolující Umami. | Vyplněné `NEXT_PUBLIC_UMAMI_WEBSITE_ID` v `.env.local`. Klíč tam je, ale nevím, jestli má hodnotu. |
| **10** | **Nasazení na Vercel** | Projekt, proměnné prostředí, integrace s Neonem, test na telefonu. | Tvůj účet na Vercelu a GitHubu, `git push`. Zatím nic nepushuju, repozitář zakládáš ty. |

**Navrhuju pořadí 9 → 8 → 7 → 10.**
- **9 a 8** nemají žádné blokery: všechno potřebné je v briefu a v datech.
- **7** má dvě části. Zapamatování odeslání je malé a hned hotové. PDF postavím jako kostru: slovník z dat plus zástupné texty, aby šlo celé dokola generovat a obsah se doplnil bez změny kódu.
- **10** na konec, ať se nasazuje hotová věc. Klidně ho ale můžeme udělat i hned po kroku 9, abys měl dřív odkaz na skutečný telefon.

Mám začít krokem 9?

### 👤 Tom

> ted bych se venoval kroku 8. umami a rc eventy

### 🤖 Claude Code

Pustím se do kroku 8. Napřed si u Umami ověřím, odkud se načítá jejich skript a kam posílá data. Bez toho nejde správně nastavit CSP hlavičku.

<details><summary>Nástroje (10)</summary>

- `WebFetch` – https://umami.is/docs/tracker-configuration
- `WebFetch` – https://umami.is/docs/tracker-functions
- `WebFetch` – https://docs.umami.is/docs/tracker-configuration
- `WebFetch` – https://docs.umami.is/docs/tracker-functions
- `WebFetch` – https://docs.umami.is/docs/collect-data
- `Bash` – Check which env keys have values, without printing them
- `Bash` – Read Next.js CSP guide for nonce-less setup
- `Bash` – Find the CSP guide in Next docs
- `Bash` – Read rest of nonce-less CSP example
- `Bash` – Create analytics feature: track, utm, config, in-view hook

</details>

### 🤖 Claude Code

Teď testy analytiky. Běží v Node, takže `window`, `document` a `sessionStorage` nahradím jednoduchými atrapami.

<details><summary>Nástroje (2)</summary>

- `Bash` – Write analytics unit tests and run them
- `Bash` – Require site URL for Umami, add script to layout and env example

</details>

### 🤖 Claude Code

Teď napojím eventy do komponent: kvíz, jezdce, formulář a stažení PDF. Formulář navíc bude brát UTM ze společné funkce `getUtm` místo vlastní.

<details><summary>Nástroje (2)</summary>

- `Bash` – Review container before wiring events
- `Bash` – Wire rc_ events into quiz and lead components

</details>

### 🤖 Claude Code

Eventy jsou napojené a všech 230 testů prochází. Teď CSP hlavička v `next.config.ts` s doménou Umami odvozenou z env.

<details><summary>Nástroje (20)</summary>

- `Bash` – Add CSP header derived from Umami origin
- `Prohlížeč: resize_window`
- `Prohlížeč: navigate` – http://localhost:3000/?utm_source=meta&utm_medium=paid_social&utm_campaign=etf_reality_check&utm_content=ad_a
- `Prohlížeč: javascript_tool`
- `Prohlížeč: find`
- `Prohlížeč: find`
- `Prohlížeč: browser_batch`
- `Prohlížeč: browser_batch`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_console_messages`
- `Bash` – Gate rc_form_view on quiz answer
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_console_messages`
- `Prohlížeč: tabs_context`
- `Prohlížeč: resize_window`
- `Bash` – Run tests, build, preview production CSP with Umami
- `Bash` – Build with test Umami env and inspect CSP and script tag
- `Bash` – Update docs, record decisions, commit step 8

</details>

### 🤖 Claude Code

Krok 8 je hotový a commitnutý (`bf024f9`). Testy (230) i produkční build prochází. Do Umami ale zatím nic nechodí, protože v `.env.local` chybí jeho údaje.

**Co je hotové**
- **Umami skript** se vloží jen s vyplněným ID webu, adresou skriptu a adresou webu. Bez adresy webu by se do statistik dostávala i data z localhostu.
- **Eventy:** v prohlížeči jsem prošel celou cestu a chodí všechny: `rc_view`, `rc_answer`, `rc_slider_change`, `rc_cta_click`, `rc_form_focus`, `rc_form_submit`, `rc_lead_error`, `rc_lead_success` a `rc_pdf_download`. Každý nese variantu a nejvýš jednu další vlastnost. E-mail ani hodnoty jezdců se neposílají.
- **UTM** z první URL se uloží do relace a odejdou s leadem.
- **CSP hlavička:** skripty i odesílání dat povolí jen z vlastní domény a z domény Umami. V prohlížeči nic nezablokovala. Testovací build s vymyšlenými hodnotami Umami vygeneroval správnou hlavičku i skript.

**Opravená chyba ve funnelu.** Karta formuláře je na mobilu vidět hned pod otázkou. `rc_form_view` se tak poslal dřív než `rc_answer` a jen jednou za relaci, takže by návštěvník z funnelu `rc_answer → rc_form_view` vypadl. Teď se pošle, až když je formulář vidět po odpovědi.

**Co není ověřené.** Tuhle opravu jsem v prohlížeči nepotvrdil. Panel prohlížeče je skrytý a skrytá stránka nehlásí, co je na obrazovce, takže `rc_view` ani `rc_form_view` se nespustí. Ostatní eventy chodí normálně. Pokud panel zobrazíš (Cmd+Shift+B nebo ikona glóbu), ověřím to během minuty.

**Co od tebe potřebuju pro ostrý provoz**

Do `.env.local` a později do Vercelu vyplň:
- **`NEXT_PUBLIC_UMAMI_WEBSITE_ID`** a **`NEXT_PUBLIC_UMAMI_SCRIPT_URL`** zkopíruj z Umami Cloud (nastavení webu, sekce Tracking code). Adresu skriptu jsem záměrně nehádal, dokumentace Umami ji ukazuje jen jako obrázek. Klíč `NEXT_PUBLIC_UMAMI_SCRIPT_URL` je nový a v `.env.example` jsem ho doplnil.
- **`NEXT_PUBLIC_SITE_URL`** je produkční adresa. Lokálně se proto do Umami nic neposílá, to je záměr. Doopravdy se měření ověří až po nasazení na Vercel.

Funnel `pageview → rc_answer → rc_form_view → rc_form_focus → rc_form_submit → rc_lead_success` se v Umami zakládá ručně v jeho administraci.

Další na řadě je krok 9 (hero A/B podle UTM a `ads/`), nebo 7 (PDF). Kterým pokračujeme?

### 👤 Tom

> pro umami je ted nejlepší už ziskat url, takze to nasadime na vercel. zde jsou prikazy pro repository na git hubu:
>
>
>
> ```
> git remote add origin https://github.com/tominator633/etf-reality-check.git
> git branch -M main
> git push -u origin main
>
>
>
> vercel bude jako další
> ```

### 🤖 Claude Code

Než pushnu, projdu celou historii, jestli se do ní nedostalo nic tajného: připojovací řetězec k databázi, klíče nebo soubor `.env.local`.

<details><summary>Nástroje (1)</summary>

- `Bash` – Scan repo history for secrets before pushing

</details>

### 🤖 Claude Code

Historie je čistá. Jediný sledovaný `.env` soubor je `.env.example` bez hodnot a žádný připojovací řetězec ani klíč jsem nenašel. Pushuju.

<details><summary>Nástroje (2)</summary>

- `Bash` – Add GitHub remote and push main
- `Bash` – Confirm push state and commit author emails

</details>

### 🤖 Claude Code

Repozitář je na GitHubu: https://github.com/tominator633/etf-reality-check. Pushnul jsem všech 27 commitů do `main` a lokální `main` teď sleduje `origin/main`. Před pushem jsem prošel celou historii: jediný `.env` soubor v repu je `.env.example` bez hodnot a žádné heslo ani klíč jsem nenašel.

Pokud je repozitář veřejný, uvidí kdokoli u commitů tvůj e-mail `[e-mail]`, protože tak máš nastavený git. Jestli ti to vadí, dá se to do budoucna změnit na adresu `…@users.noreply.github.com` od GitHubu.

## Postup pro Vercel
Hodnoty začínající `NEXT_PUBLIC_` i povolená doména Umami v bezpečnostní hlavičce (CSP) se zapečou při buildu. Po jejich doplnění je proto potřeba nasadit znovu. Pořadí:

1. **Import projektu:** Vercel → Add New → Project → `etf-reality-check`. Next.js pozná sám, nic dalšího nenastavuj.
2. **Proměnné pro první nasazení:**
   - `DATABASE_URL`: produkční větev Neonu. Nejjednodušší je integrace Neon ve Vercelu, která ji doplní sama.
   - `EMAIL_ENABLED=false`.
   - Umami zatím nevyplňuj.
3. **Deploy.** Build sám spustí kontrolu dat v přísném režimu a ta projde.
4. **Adresa webu:** z adresy, kterou Vercel přidělí, nastav `NEXT_PUBLIC_SITE_URL` (např. `https://etf-reality-check.vercel.app`).
5. **Umami:** přidej web s touto doménou a zkopíruj ID webu a adresu skriptu z Tracking code do `NEXT_PUBLIC_UMAMI_WEBSITE_ID` a `NEXT_PUBLIC_UMAMI_SCRIPT_URL`.
6. **Redeploy**, aby se nové hodnoty propsaly.

Node verzi Vercel vybere sám. Lokálně běží Node 22 a projekt funguje na 22 i 24. Kdyby build hlásil problém s verzí, v Project Settings → Node.js nastav 22.x.

## Co pak ověřím já
Až mi pošleš produkční adresu, ověřím bez přihlašování do Vercelu:
- bezpečnostní hlavičky a CSP s doménou Umami;
- že se Umami skript načítá a stránka funguje na mobilní šířce;
- s tvým souhlasem pošlu i jeden testovací lead na produkci. Tech-spec 7.3 ho chce kvůli screenshotu tabulky do README.

Projekty ve Vercelu za tebe zakládat nebudu. Je to tvůj účet a ty rozhoduješ o propojení s Neonem.

### 👤 Tom

> vercel a umami set up

### 🤖 Claude Code

Ověřím nasazení. Nejdřív zjistím produkční adresu. `NEXT_PUBLIC_SITE_URL` je veřejná hodnota, takže z `.env.local` přečtu jen ji, a zkusím i výchozí adresu na Vercelu.

<details><summary>Nástroje (7)</summary>

- `Bash` – Find production URL and check Umami env presence
- `Bash` – Check production headers, Umami script and routes
- `Prohlížeč: navigate` – https://etf-reality-check.vercel.app/?utm_source=claude_test&utm_medium=deploy_check
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_network_requests`
- `Prohlížeč: read_console_messages`
- `Bash` – Allow Umami gateway in CSP connect-src, test and check build

</details>

### 🤖 Claude Code

Testovací build už generuje správnou CSP: `connect-src … https://*.umami.is`. Commitnu a pushnu. Vercel z GitHubu nasadí novou verzi sám.

<details><summary>Nástroje (1)</summary>

- `Bash` – Commit CSP fix, update docs and push to trigger deploy

</details>

### 🤖 Claude Code

Pushnuto. Počkám, až Vercel nasadí novou verzi. Poznám ji podle změněné CSP hlavičky.

<details><summary>Nástroje (2)</summary>

- `ToolSearch`
- `Bash` – Wait until Vercel serves the fixed CSP

</details>

### 🤖 Claude Code

Čekám na nasazení. Jakmile Vercel začne posílat novou hlavičku, ověřím v prohlížeči, že eventy do Umami opravdu odcházejí.

### 👤 Tom

> <task-notification>
> <task-id>bcycmgt7s</task-id>
> <tool-use-id>toolu_01A23nNWECKEVtUuiSMrfdB2</tool-use-id>
> <output-file>/private/tmp/claude-501/-Users-tomasruzicka-Documents-DEV-MY-PROJECTS-CLIENTELO/9f764277-a6c3-4712-8514-ff3a500ed018/tasks/bcycmgt7s.output</output-file>
> <status>completed</status>
> <summary>Background command "Wait until Vercel serves the fixed CSP" completed (exit code 0)</summary>
> </task-notification>

<details><summary>Nástroje (1)</summary>

- `Bash` – Read deploy wait result

</details>

### 🤖 Claude Code

Nová verze je nasazená. Ověřím v prohlížeči, že stránka teď data do Umami posílá a CSP nic neblokuje.

<details><summary>Nástroje (5)</summary>

- `Prohlížeč: navigate` – https://etf-reality-check.vercel.app/?utm_source=claude_test&utm_medium=deploy_check
- `Prohlížeč: javascript_tool`
- `Prohlížeč: read_network_requests`
- `Prohlížeč: read_console_messages`
- `Prohlížeč: javascript_tool`

</details>

### 🤖 Claude Code

Umami na produkci funguje. Aktuální stránka má opravenou CSP a skript odeslal na `gateway.umami.is/api/send` dva požadavky, oba s odpovědí 200. Byly to nejspíš zobrazení stránky a odpověď v kvízu. Chyby v konzoli byly opravdu z předchozího načtení se starou hlavičkou.

**Stav nasazení:** https://etf-reality-check.vercel.app

| Kontrola | Výsledek |
|---|---|
| Stránka, `/zasady-ochrany-udaju` | 200 |
| `/api/lead` (GET) | 405, POST nebyl zkoušen |
| Bezpečnostní hlavičky a CSP | ✅ |
| Umami skript (správné ID, `data-domains` = produkční doména) | ✅ |
| Odesílání do Umami | ✅ po opravě |

**Co jsem opravil.** Umami Cloud načítá skript z `cloud.umami.is`, ale data posílá na `gateway.umami.is`. Moje CSP povolovala jen první doménu, takže do Umami po nasazení nedorazilo nic. Teď CSP povoluje poddomény `*.umami.is` (`connect-src`), ale jen u Umami Cloud; test hlídá, že výjimku nedostane podobně pojmenovaná cizí doména. Commit `b95a88e` jsem pushnul a Vercel ho nasadil asi za 30 s. Rozhodnutí je v `docs/decisions.md` a tech-spec jsem aktualizoval.

**Pozor na statistiky:** moje kontrolní návštěvy jsou v Umami s `utm_source=claude_test`. Při vyhodnocování je odfiltruj.

**Ještě neověřeno na produkci:**
1. **Uložení leadu do produkční databáze.** Tech-spec 7.3 chce testovací lead v produkci a snímek tabulky do README. Mám poslat jeden testovací e-mail (`[e-mail]`, `utm_source=claude_test`)? Do produkční tabulky přibude řádek, proto se ptám.
2. **Funnel v Umami** (`rc_answer → rc_form_view → …`) si založ v jeho administraci. Eventy budou vidět v Realtime.
3. **Test na skutečném telefonu** (iOS Safari, Android Chrome) musíš udělat ty, já mám jen emulovanou šířku obrazovky.

Další krok: 9 (hero A/B podle UTM a `ads/`), nebo 7 (PDF)?

### 👤 Tom

> udelej export nove části teto konverzace
