import { describe, expect, it } from "vitest";
import etf from "@data/etf.json";
import { datasetSchema } from "@data/schema";
import { allFunds, buildRealityCheckView } from "./view-model";

const dataset = datasetSchema.parse(etf);
const view = buildRealityCheckView(dataset);

describe("buildRealityCheckView", () => {
  it("skupiny: každý UCITS fond jednou, SPYL se SPYM i SPY", () => {
    expect(view.groups.map((group) => [group.ucits.ticker, group.us.map((fund) => fund.ticker)])).toEqual([
      ["VUAA", ["VOO"]],
      ["SXR8", ["IVV"]],
      ["SPYL", ["SPYM", "SPY"]],
    ]);
  });

  it("malé karty nad otázkou = americké fondy v pořadí párů, stejná data jako v levém sloupci", () => {
    expect(view.usFunds.map((fund) => fund.ticker)).toEqual(["VOO", "IVV", "SPYM", "SPY"]);
    const leftColumn = view.groups.flatMap((group) => group.us);
    for (const fund of view.usFunds) expect(leftColumn).toContainEqual(fund);
  });

  it("datum ověření je z etf.json", () => {
    expect(view.verifiedAt).toBe(dataset.verifiedAt);
  });

  it("allFunds vrací 7 fondů, žádný dvakrát", () => {
    const ids = allFunds(view).map((fund) => fund.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
  });

  it("TER a jeho zdroj jdou z dat beze změny", () => {
    for (const fund of allFunds(view)) {
      const source = dataset.funds.find((candidate) => candidate.id === fund.id)!;
      expect(fund.ter).toBe(source.ter.value);
      expect(fund.terSource).toEqual({ label: source.ter.sourceLabel, url: source.ter.sourceUrl, asOf: source.ter.asOf });
    }
  });

  it("odznak počítá jen z UCITS fondů", () => {
    const ucitsIds = view.groups.map((group) => group.ucits.id);
    expect(view.lowestTerIds.length).toBeGreaterThan(0);
    for (const id of view.lowestTerIds) expect(ucitsIds).toContain(id);
  });

  it("zdroj k tvrzení o KID je ze czRetailAvailable amerického fondu", () => {
    const voo = dataset.funds.find((fund) => fund.id === "voo")!;
    expect(view.kidSource).toEqual({
      label: voo.czRetailAvailable.sourceLabel,
      url: voo.czRetailAvailable.sourceUrl,
      asOf: voo.czRetailAvailable.asOf,
    });
  });

  it("view jde serializovat (props z Server do Client Component)", () => {
    expect(JSON.parse(JSON.stringify(view))).toEqual(view);
  });
});
