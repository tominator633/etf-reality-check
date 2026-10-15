// Všechny texty stránky. Zdroj: brief.md kap. 4, 5, 7 (doslova), drobné UI texty z tech-spec
// (kapitola u každého). Čísla se sem nepíšou: částky a hodnoty jezdců dosazuje volající
// už naformátované přes `shared/lib/format.ts` (z `projection.ts` a `data/`).
// Chybějící text = viditelný placeholder `[[CHYBÍ TEXT: …]]`.

export const missingText = (what: string) => `[[CHYBÍ TEXT: ${what}]]`;

export const copy = {
  meta: {
    title: "ETF Reality Check",
    description: missingText("popis stránky pro vyhledávače a sdílení"),
  },

  quiz: {
    // brief kap. 4
    question: "VOO, IVV, SPYM a SPY sledují stejný S&P 500. Můžete si je koupit u českého brokera?",
    answers: { ano: "ANO", ne: "NE" },
    // tech-spec 6.2
    hint: "Zdarma, bez registrace · 1 otázka",
  },

  reveal: {
    // brief kap. 4: „stejné pro obě odpovědi, liší se jen první řádek“ – první řádky v briefu chybí
    firstLine: {
      ano: missingText("první řádek odhalení po odpovědi ANO (nesprávně)"),
      ne: missingText("první řádek odhalení po odpovědi NE (správně)"),
    },
    body: "Většinou ne. Americká ETF nemají dokument KID, který pravidla EU vyžadují, takže je drobný investor z EU obvykle nekoupí. Každé z nich má ale evropské dvojče na stejný index. A poplatky se liší.",
    // tech-spec 6.3: odkaz na zdroj k tvrzení o KID/PRIIPs
    source: missingText("zdroj k tvrzení o KID/PRIIPs (název + URL)"),
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
    feeCost: (amount: string) => `přijdete o ${amount} na poplatcích`,
    // tech-spec 4.4: neověřená hodnota se nikdy nevykreslí jako 0
    unverified: "— (neověřeno)",
  },

  sliders: {
    // brief kap. 5 (popisky jezdců); hodnoty a jednotky přes format.ts
    grossReturn: "Modelový výnos před TER",
    years: "Doba",
    monthly: "Měsíčně",
    // brief kap. 4 – částky dosadí volající jako naformátované řetězce (včetně „Kč“)
    summary: (values: { invested: string; grossValue: string; minFeeCost: string; maxFeeCost: string }) =>
      `Vložíte ${values.invested}. Bez poplatků by to modelově bylo ${values.grossValue}, poplatky z toho uberou ${values.minFeeCost} až ${values.maxFeeCost} podle fondu.`,
    // brief kap. 5 – povinná věta pod výsledkem
    disclaimer:
      "Modelový výpočet, výnos je předpoklad, ne záruka. Měsíční úročení, TER odečten od výnosu. Bez poplatků brokera, směny měn a daní.",
  },

  lead: {
    // brief kap. 7
    heading: "Tohle byl jen S&P 500. Co když chcete víc než Ameriku?",
    intro:
      "Evropská dvojčata dalších populárních ETF a jak z nich poskládat celé portfolio najdete v taháku:",
    benefits: [
      "evropská dvojčata populárních NYSE ETF, nejen na S&P 500",
      "jak poskládat celý svět ze dvou až tří fondů",
      "na co si dát pozor u českého brokera a u daní",
    ],
    emailLabel: missingText("viditelný popisek pole e-mail"),
    emailPlaceholder: "vas@email.cz",
    submit: "Poslat tahák",
    downloadNote: "Tahák stáhnete hned po odeslání.",
    // brief kap. 7: zobrazit JEN při EMAIL_ENABLED=true
    emailAlsoNote: "pošleme vám ho i e-mailem",
    noSpam: "Žádný spam, odhlásit se můžete jedním kliknutím.",
    privacyLink: "zásady zpracování údajů",
    // tech-spec 7.1 a 7.2
    submitting: "Odesílám…",
    errors: {
      invalidEmail: missingText("chyba u pole: neplatný e-mail"),
      rateLimited: "Zkuste to prosím za chvíli.",
      serverError: missingText("chybová hláška při chybě serveru nebo sítě"),
      retry: "Zkusit znovu",
    },
    success: {
      heading: missingText("nadpis stavu po odeslání"),
      text: missingText("text stavu po odeslání"),
      // brief kap. 7
      download: "Stáhnout tahák (PDF)",
      // tech-spec 7.4: jen když e-mail opravdu odešel
      emailSent: (email: string) => `Kopii jsme poslali na ${email}.`,
    },
  },

  // brief kap. 3, tech-spec 10
  stickyCta: "Získat tahák zdarma",

  faq: {
    heading: missingText("nadpis sekce Pojmy a FAQ"),
    // brief kap. 3: TER, KID/UCITS, ACC/DIST, měnové riziko
    items: [
      { question: missingText("FAQ: otázka o TER"), answer: missingText("FAQ: odpověď o TER") },
      { question: missingText("FAQ: otázka o KID a UCITS"), answer: missingText("FAQ: odpověď o KID a UCITS") },
      { question: missingText("FAQ: otázka o ACC a DIST"), answer: missingText("FAQ: odpověď o ACC a DIST") },
      {
        question: missingText("FAQ: otázka o měnovém riziku"),
        answer: missingText("FAQ: odpověď o měnovém riziku"),
      },
    ],
  },

  sources: {
    heading: missingText("nadpis sekce Zdroje a metodika"),
    methodologyLink: missingText("text odkazu na /metodika"),
    disclaimer: missingText("upozornění: nejde o investiční ani daňové poradenství (finální znění)"),
  },

  footer: {
    operator: missingText("provozovatel (jméno/firma, IČO)"),
    contact: missingText("kontakt na provozovatele"),
    privacyLink: "zásady zpracování údajů",
  },
} as const;
