// Všechny texty stránky. Zdroj: brief.md kap. 4, 5, 7 (doslova), drobné UI texty z tech-spec
// (kapitola u každého). Čísla se sem nepíšou: částky a hodnoty jezdců dosazuje volající
// už naformátované přes `shared/lib/format.ts` (z `projection.ts` a `data/`).
// Chybějící text = viditelný placeholder `[[CHYBÍ TEXT: …]]`.
// Texty označené „Claude 16. 10.“ doplnil Claude podle kontextu (Tom: „doplnit smysluplně“) – k revizi.
// Právní údaje (provozovatel, právní základ a doba zpracování) záměrně zůstávají placeholdery.

import { fact, gain, loss } from "@/shared/lib/rich-text";

export const missingText = (what: string) => `[[CHYBÍ TEXT: ${what}]]`;

export const copy = {
  meta: {
    title: "ETF Reality Check",
    // Claude 16. 10.
    description:
      "Radí vám americká videa koupit VOO nebo SPY? Jednou otázkou zjistíte, jestli je v Česku koupíte, jaká mají evropská dvojčata a o kolik vás modelově připraví poplatky.",
  },

  quiz: {
    // Tom 15. 10. 2026 (zkráceno proti brief kap. 4, tickery a index říká podnadpis hero)
    question: "Můžete si je koupit v Česku?",
    answers: { ano: "ANO", ne: "NE" },
    // výsledek u zvoleného tlačítka: symbol + text pro čtečky (barva nesmí být jediný nositel významu)
    result: {
      correct: { symbol: "✓", label: "správně" },
      wrong: { symbol: "✗", label: "špatně" },
    },
  },

  reveal: {
    // brief kap. 4: „stejné pro obě odpovědi, liší se jen první řádek“ – doplnil Claude 16. 10.
    firstLine: {
      ano: "Tady je háček.",
      ne: "Přesně tak.",
    },
    body: [
      "Většinou ne. Americká ETF nemají dokument ",
      fact("KID"),
      ", který pravidla EU vyžadují, takže je drobný investor z EU obvykle nekoupí. Každé z nich má ale ",
      gain("evropské dvojče"),
      " na stejný index. A ",
      loss("poplatky se liší"),
      ".",
    ],
  },

  preview: {
    // řádek pod malými kartami nad otázkou: TER tam nemá místo pro vlastní odkaz na zdroj
    terSource: (date: string) => `TER podle dokumentů správců, ověřeno ${date}.`,
  },

  pairGrid: {
    // brief kap. 4
    usHeading: "USA · v ČR obvykle nekoupíte",
    ucitsHeading: "Evropské dvojče · koupíte",
  },

  fundCard: {
    // brief kap. 4 a tech-spec 6.3
    terLabel: "TER",
    distribution: { ACC: "akum.", DIST: "dist." },
    lowestTerBadge: "nejnižší TER",
    // odznak americké karty (Tom 16. 10. „V ČR nekoupíte“; „obvykle“ kvůli výjimkám, brief kap. 4)
    usBadge: "V ČR obvykle nekoupíte",
    // „přijdete o {částka} na poplatcích“ – částka se v UI zvýrazní, proto zvlášť
    feeCost: { before: "přijdete o", after: "na poplatcích" },
    // tech-spec 4.4: neověřená hodnota se nikdy nevykreslí jako 0
    unverified: "— (neověřeno)",
    // tech-spec 6.3 (source-note u TER a u tvrzení o KID)
    sourcePrefix: "Zdroj:",
    // krátký odkaz na zdroj TER na kartě; celý popis zdroje je v aria-label a title
    sourceLink: "zdroj",
  },

  sliders: {
    // brief kap. 5 (popisky jezdců); hodnoty a jednotky přes format.ts
    grossReturn: "Modelový výnos před TER",
    years: "Doba",
    monthly: "Měsíčně",
    // brief kap. 4 – částky dosadí volající jako naformátované řetězce (včetně „Kč“)
    summary: (values: { invested: string; grossValue: string; minFeeCost: string; maxFeeCost: string }) => [
      "Vložíte ",
      fact(values.invested),
      ". Bez poplatků by to modelově bylo ",
      fact(values.grossValue),
      ", poplatky z toho uberou ",
      loss(`${values.minFeeCost} až ${values.maxFeeCost}`),
      " podle fondu.",
    ],
    // brief kap. 5 – povinná věta pod výsledkem
    disclaimer:
      "Modelový výpočet, výnos je předpoklad, ne záruka. Měsíční úročení, TER odečten od výnosu. Bez poplatků brokera, směny měn a daní.",
  },

  lead: {
    // Tom 15. 10. 2026: dvoukrokový formulář – nejdřív tlačítko, po kliknutí pole e-mail.
    // Nabídka doslova z brief kap. 7 (most + 3 body).
    offer: {
      heading: "Tohle byl jen S&P\u00a0500. Co když chcete víc než Ameriku?",
      intro: "Evropská dvojčata dalších populárních ETF a jak z nich poskládat celé portfolio najdete v taháku:",
      benefits: [
        "evropská dvojčata populárních NYSE ETF, nejen na S&P\u00a0500",
        "jak poskládat celý svět ze dvou až tří fondů",
        "na co si dát pozor u českého brokera a u daní",
      ],
    },
    cta: "CHCI KOMPLETNÍ SROVNÁNÍ V PDF",
    emailLabel: "Váš e-mail", // Claude 16. 10.
    emailPlaceholder: "vas@email.cz",
    submit: "Odeslat PDF",
    // brief kap. 7 – zobrazí se jen, když PDF existuje (features/lead/lib/guide.ts)
    downloadNote: "Tahák stáhnete hned po odeslání.",
    // brief kap. 7: zobrazit JEN při EMAIL_ENABLED=true
    emailAlsoNote: "pošleme vám ho i e-mailem",
    noSpam: "Žádný spam, odhlásit se můžete jedním kliknutím.",
    privacyLink: "zásady zpracování údajů",
    consentVersionLabel: "Verze:",
    // tech-spec 7.1 a 7.2
    submitting: "Odesílám…",
    errors: {
      invalidEmail: "Zkontrolujte prosím e-mail, musí mít tvar jmeno@domena.cz.", // Claude 16. 10.
      rateLimited: "Zkuste to prosím za chvíli.",
      serverError: "E-mail se nepodařilo odeslat. Zkuste to prosím znovu, adresa vám v poli zůstala.", // Claude 16. 10.
      retry: "Zkusit znovu",
    },
    success: {
      // Claude 16. 10.: dva texty podle toho, jestli PDF existuje (GUIDE_AVAILABLE) – nic neslibujeme navíc
      heading: "Hotovo, e-mail máme.",
      textReady: "Tahák „Z amerického videa do českého portfolia“ si můžete stáhnout hned.",
      textPending:
        "Tahák „Z amerického videa do českého portfolia“ dokončujeme. Jakmile bude hotový, stáhnete ho přímo tady na stránce.",
      // brief kap. 7
      download: "Stáhnout tahák (PDF)",
      // tech-spec 7.4: jen když e-mail opravdu odešel
      emailSent: (email: string) => `Kopii jsme poslali na ${email}.`,
    },
  },

  // brief kap. 3, tech-spec 10
  stickyCta: "Získat tahák zdarma",

  // Claude 16. 10.: témata z brief kap. 3 (TER, KID/UCITS, ACC/DIST, měnové riziko). Jen obecná fakta,
  // bez čísel a bez doporučení; tvrzení o KID opřené o PRIIPs (zdroj v datech u amerických fondů).
  faq: {
    heading: "Pojmy, které americká videa nevysvětlí",
    items: [
      {
        question: "Co je TER?",
        answer:
          "Celková roční nákladovost fondu (Total Expense Ratio) v procentech. Platí se průběžně z majetku fondu, takže ji na účtu neuvidíte jako samostatnou platbu – projeví se nižším výnosem. Proto ji na kartách přepočítáváme na koruny.",
      },
      {
        question: "Co je KID a UCITS?",
        answer:
          "KID je dokument se základními informacemi, který podle nařízení EU o PRIIPs musí mít investiční produkt nabízený drobným investorům v EU. UCITS je evropský rámec pro fondy – evropská dvojčata na této stránce jsou UCITS fondy s KID. Americká ETF KID obvykle nevydávají, proto je český broker drobnému investorovi obvykle nenabídne.",
      },
      {
        question: "Co znamená akumulační a distribuční fond?",
        answer:
          "Akumulační (akum.) fond výnosy z dividend automaticky reinvestuje, distribuční je vyplácí. Evropská dvojčata na této stránce jsou akumulační, americké fondy dividendy vyplácejí čtvrtletně. Jak se to promítne do vašich daní, záleží na vaší situaci – nejde o daňové poradenství.",
      },
      {
        question: "Co je měnové riziko?",
        answer:
          "Fondy na této stránce drží americké akcie, jejichž hodnota je v dolarech. Když koruna vůči dolaru posílí, hodnota investice v korunách klesne, i když akcie stojí na místě – a naopak. Měna, ve které fond na burze kupujete (třeba euro), na tom nic nemění, ovlivní jen náklady na směnu.",
      },
    ],
  },

  // Claude 16. 10.
  sources: {
    heading: "Zdroje a metodika",
    data: "TER, ISIN, burzy a dostupnost fondů pocházejí ze stránek a dokumentů správců (Vanguard, iShares, State Street) a z nařízení PRIIPs. Datum ověření je u každé hodnoty na kartě.",
    methodology:
      "Částky jsou modelový výpočet: pravidelný měsíční vklad na konci měsíce, roční výnos převedený na efektivní měsíční sazbu a TER odečtený od výnosu. Ztráta na poplatcích je rozdíl mezi hodnotou bez TER a s TER, zahrnuje tedy i ušlé zhodnocení. Výpočet nezahrnuje poplatky brokera, směnu měn ani daně.",
    disclaimer:
      "Stránka slouží ke vzdělávání. Nejde o investiční ani daňové poradenství ani o doporučení koupit konkrétní fond. Výnosy z minulosti ani modelové výpočty nezaručují budoucí výsledky.",
  },

  // Claude 16. 10.: fakta o tom, co web skutečně dělá (db/schema.sql, analytics). Právní volby zůstávají na Tomovi.
  privacy: {
    title: "Zásady zpracování osobních údajů",
    sections: [
      {
        heading: "Kdo údaje zpracovává",
        text: missingText("správce osobních údajů: jméno nebo firma, IČO, adresa, kontaktní e-mail"),
      },
      {
        heading: "Jaké údaje",
        text: "E-mail, který zadáte do formuláře. K němu ukládáme variantu stránky, parametry reklamy, ze které jste přišli (UTM), vaši odpověď v kvízu, čas odeslání a verzi těchto zásad. IP adresu ani údaje o prohlížeči neukládáme.",
      },
      {
        heading: "Proč",
        text: missingText("účely zpracování (zpřístupnění taháku, případně zasílání dalších e-mailů) a právní základ"),
      },
      {
        heading: "Jak dlouho",
        text: missingText("doba uložení údajů"),
      },
      {
        heading: "Kde jsou uložené",
        text: "V databázi Neon (Postgres), kterou web používá jen pro tento účel. Web běží na službě Vercel.",
      },
      {
        heading: "Měření návštěvnosti",
        text: "Používáme Umami bez cookies. Měří počty návštěv a kroků na stránce (třeba odpověď v kvízu), ne konkrétní osoby. E-mail do měření nikdy neposíláme.",
      },
      {
        heading: "Vaše práva",
        text: "Máte právo na přístup ke svým údajům, jejich opravu, výmaz, omezení zpracování a přenositelnost a právo vznést námitku. Stížnost můžete podat u Úřadu pro ochranu osobních údajů.",
      },
    ],
  },

  footer: {
    operator: missingText("provozovatel (jméno/firma, IČO)"),
    contact: missingText("kontakt na provozovatele"),
    privacyLink: "zásady zpracování údajů",
  },
} as const;
