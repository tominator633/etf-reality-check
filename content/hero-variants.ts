// H1 a podnadpis pro reklamu A a B (brief kap. 9, doslova). Liší se jen hero.
// Hero B: částku i počet let dosadí volající z `projection.ts` při výchozích jezdcích
// (`defaultInput`), naformátované přes `shared/lib/format.ts`. Nikdy ručně.

export type HeroVariantId = "a" | "b";

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
  subtitle: (values: HeroValues) => string;
};

export const heroVariants: Record<HeroVariantId, HeroVariant> = {
  a: {
    id: "a",
    utmContent: "ad_a",
    motivation: "Není ETF jako ETF – zvědavost: jde to vůbec koupit?",
    h1: () => "NENÍ ETF JAKO ETF",
    subtitle: () =>
      "VOO, IVV, SPYM a SPY sledují stejný S&P 500. Liší se poplatkem. Které z nich si koupíte u českého brokera?",
  },
  b: {
    id: "b",
    utmContent: "ad_b",
    // Návrh ke schválení (brief kap. 16, bod 1).
    motivation: "Poplatek v korunách – strach z přeplácení",
    h1: ({ feeDifference }) => `STEJNÝ S&P 500, ROZDÍL ${feeDifference}`,
    subtitle: ({ years }) =>
      `Tolik dělá rozdíl v poplatku mezi fondy na stejný index za ${years}. Které z nich si ale koupíte u českého brokera?`,
  },
};

/** Výchozí varianta bez UTM (brief kap. 9). */
export const defaultHeroVariant: HeroVariantId = "a";

/**
 * Dvojice fondů pro částku v hero B: [dražší, levnější]. Pracovně SPY vs. SPYM (brief kap. 9),
 * čeká na schválení Tomem (brief kap. 16, bod 1).
 */
export const heroBComparedFundIds = ["spy", "spym"] as const;
