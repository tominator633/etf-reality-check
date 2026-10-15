import { describe, expect, it } from "vitest";
import etf from "@data/etf.json";
import { datasetSchema, type Dataset, type Fund } from "@data/schema";
import { buildPairs, lowestTerIds } from "./pairs";

const dataset = datasetSchema.parse(etf);
const clone = (): Dataset => structuredClone(dataset);

// TER níž jsou vstupy testu, ne ověřená data.
function withTer(fund: Fund, value: number | null, status: "verified" | "unverified" = "verified"): Fund {
  return { ...fund, ter: { ...fund.ter, value, status } };
}

describe("buildPairs", () => {
  it("vrací 4 páry ve správném pořadí (VOO, IVV, SPYM, SPY)", () => {
    const pairs = buildPairs(dataset);
    expect(pairs.map((pair) => [pair.us.ticker, pair.ucits.ticker])).toEqual([
      ["VOO", "VUAA"],
      ["IVV", "CSPX"],
      ["SPYM", "SPYL"],
      ["SPY", "SPY5"],
    ]);
  });

  it("každý pár je oboustranný a vlevo je vždy americký fond, vpravo UCITS", () => {
    for (const { us, ucits } of buildPairs(dataset)) {
      expect(us.fund.regime).toBe("US-registered");
      expect(ucits.fund.regime).toBe("UCITS");
      expect(us.fund.relatedFundIds).toContain(ucits.fund.id);
      expect(ucits.fund.relatedFundIds).toContain(us.fund.id);
    }
  });

  it("jednostranný pár → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "cspx")!.relatedFundIds = [];
    expect(() => buildPairs(data)).toThrow(/není oboustranný/);
  });

  it("americký fond bez dvojčete → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "voo")!.relatedFundIds = [];
    expect(() => buildPairs(data)).toThrow(/nemá evropské dvojče/);
  });

  it("fondy s rolí guide-only se do párů nedostanou", () => {
    const data = clone();
    for (const fund of data.funds) if (fund.id === "spy" || fund.id === "spy5") fund.role = "guide-only";
    expect(buildPairs(data).map((pair) => pair.us.ticker)).toEqual(["VOO", "IVV", "SPYM"]);
  });
});

describe("lowestTerIds – odznak „nejnižší TER“", () => {
  const ucits = buildPairs(dataset).map((pair) => pair.ucits.fund);
  const [vuaa, cspx, spyl, spy5] = ucits;

  it("jediný nejnižší TER → jeden fond", () => {
    expect(lowestTerIds([withTer(vuaa, 0.07), withTer(cspx, 0.07), withTer(spyl, 0.03), withTer(spy5, 0.05)])).toEqual([
      "spyl",
    ]);
  });

  it("shoda → odznak dostanou všechny shodné", () => {
    expect(lowestTerIds([withTer(vuaa, 0.07), withTer(cspx, 0.07), withTer(spyl, 0.03), withTer(spy5, 0.03)])).toEqual([
      "spyl",
      "spy5",
    ]);
  });

  it("neověřené nebo chybějící TER se nepočítá", () => {
    expect(lowestTerIds([withTer(vuaa, 0.01, "unverified"), withTer(cspx, null), withTer(spyl, 0.03)])).toEqual(["spyl"]);
    expect(lowestTerIds([withTer(vuaa, null, "unverified")])).toEqual([]);
  });
});
