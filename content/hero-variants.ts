// H1 a podnadpis pro reklamu A a B (brief kap. 9). Liší se jen hero.
// Podnadpisy jsou zkrácené o závěrečnou otázku: jediná otázka v hero je otázka kvízu (Tom 15. 10. 2026).
// Hero B: částku i počet let dosadí volající z `projection.ts` při výchozích jezdcích
// (`defaultInput`), naformátované přes `shared/lib/format.ts`. Nikdy ručně.

import { fact, loss, type RichText } from "@/shared/lib/rich-text";

export type HeroVariantId = "a" | "b";

/** Slovo nadpisu s velikostí (Tom 16. 10.: asymetrie „NENÍ etf / jako ETF“ = rozdíl v poplatcích). */
export type HeroWord = { text: string; size: "big" | "small" };

export type HeroValues = {
  /** Rozdíl ztráty na poplatcích mezi `comparedFundIds`, např. výstup `formatCzk()`. */
  feeDifference: string;
  /** Doba z výchozích jezdců, např. výstup `formatYears()`. */
  years: string;
};

export type HeroVariant = {
  id: HeroVariantId;
  utmContent: string;
  motivation: string;
  h1: (values: HeroValues) => string;
  /** Volitelně H1 po řádcích a slovech s velikostí; jinak se vykreslí `h1` jako prostý text. */
  h1Words?: HeroWord[][];
  /** Podnadpis po řádcích s barevně odlišenými klíčovými slovy; poslední řádek = pointa. */
  subtitle: (values: HeroValues) => RichText[];
};

export const heroVariants: Record<HeroVariantId, HeroVariant> = {
  a: {
    id: "a",
    utmContent: "ad_a",
    motivation: "Není ETF jako ETF – zvědavost: jde to vůbec koupit?",
    h1: () => "NENÍ ETF JAKO ETF",
    h1Words: [
      [
        { text: "NENÍ", size: "big" },
        { text: "ETF", size: "small" },
      ],
      [
        { text: "JAKO", size: "small" },
        { text: "ETF", size: "big" },
      ],
    ],
    // Tom 16. 10. 2026: věty s tečkou. Tom 15. 10. 2026: tři řádky místo „VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem.“
    subtitle: () => [
      [fact("VOO, IVV, SPYM a SPY"), " jsou populární americká ETF."],
      ["Všechny sledují stejný index ", fact("S&P\u00a0500"), "."],
      ["Liší se ", loss("poplatkem (TER)"), "."],
    ],
  },
  b: {
    id: "b",
    utmContent: "ad_b",
    // Návrh ke schválení (brief kap. 16, bod 1).
    motivation: "Poplatek v korunách – strach z přeplácení",
    h1: ({ feeDifference }) => `STEJNÝ S&P\u00a0500, ROZDÍL ${feeDifference}`,
    subtitle: ({ years }) => [["Tolik dělá ", loss("rozdíl v poplatku"), ` mezi fondy na stejný index za ${years}.`]],
  },
};

/** Výchozí varianta bez UTM (brief kap. 9). */
export const defaultHeroVariant: HeroVariantId = "a";

/**
 * Dvojice fondů pro částku v hero B: [dražší, levnější]. Pracovně SPY vs. SPYM (brief kap. 9),
 * čeká na schválení Tomem (brief kap. 16, bod 1).
 */
export const heroBComparedFundIds = ["spy", "spym"] as const;
