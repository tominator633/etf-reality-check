import { copy } from "@content/copy";
import { heroBComparedFundIds, type HeroValues } from "@content/hero-variants";
import { formatCzk, formatYears } from "@/shared/lib/format";
import { defaultInput, feeCost } from "./projection";
import { allFunds, type RealityCheckView } from "./view-model";

/**
 * Hodnoty pro šablony hero: rozdíl ztráty na poplatcích mezi fondy hero B a doba,
 * obojí při výchozích jezdcích – stejný výpočet jako karty pod ním. Bez TER některého z fondů je
 * částka „— (neověřeno)“ jako na kartách (produkční build bez TER neprojde přes check-data).
 */
export function buildHeroValues(view: RealityCheckView): HeroValues {
  const funds = allFunds(view);
  const [pricier, cheaper] = heroBComparedFundIds.map((id) => funds.find((fund) => fund.id === id)?.ter ?? null);
  const feeDifference =
    pricier === null || cheaper === null
      ? copy.fundCard.unverified
      : formatCzk(feeCost(defaultInput, pricier) - feeCost(defaultInput, cheaper));

  return { feeDifference, years: formatYears(defaultInput.years) };
}
