import { describe, expect, it } from "vitest";
import etf from "@data/etf.json";
import { datasetSchema } from "@data/schema";
import { copy } from "@content/copy";
import { heroBComparedFundIds } from "@content/hero-variants";
import { formatCzk, formatYears } from "@/shared/lib/format";
import { buildHeroValues } from "./hero-values";
import { defaultInput, projectAll } from "./projection";
import { allFunds, buildRealityCheckView } from "./view-model";

const view = buildRealityCheckView(datasetSchema.parse(etf));

describe("buildHeroValues", () => {
  it("částka v hero B = rozdíl částek na kartách při výchozích jezdcích", () => {
    const perFund = projectAll(defaultInput, allFunds(view)).perFund;
    const [pricier, cheaper] = heroBComparedFundIds.map((id) => perFund.find((fund) => fund.id === id)!.feeCost!);
    expect(buildHeroValues(view)).toEqual({
      feeDifference: formatCzk(pricier - cheaper),
      years: formatYears(defaultInput.years),
    });
  });

  it("chybí TER některého z porovnávaných fondů → „— (neověřeno)“, nikdy 0", () => {
    const broken = structuredClone(view);
    broken.groups.flatMap((group) => group.us).find((fund) => fund.id === heroBComparedFundIds[0])!.ter = null;
    expect(buildHeroValues(broken).feeDifference).toBe(copy.fundCard.unverified);
  });
});
