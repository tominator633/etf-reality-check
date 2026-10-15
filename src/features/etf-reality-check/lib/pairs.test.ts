import { describe, expect, it } from "vitest";
import etf from "@data/etf.json";
import { datasetSchema, type Dataset, type Fund } from "@data/schema";
import { buildPairs, groupByUcits, lowestTerIds, uniqueUcitsFunds } from "./pairs";

const dataset = datasetSchema.parse(etf);
const clone = (): Dataset => structuredClone(dataset);

// TER níž jsou vstupy testu, ne ověřená data.
function withTer(fund: Fund, value: number | null, sourced = true): Fund {
  return { ...fund, ter: { ...fund.ter, value, sourceUrl: sourced ? fund.ter.sourceUrl : null } };
}

const fundById = (id: string) => dataset.funds.find((fund) => fund.id === id)!;

describe("buildPairs", () => {
  it("vrací 4 páry ve správném pořadí (VOO, IVV, SPYM, SPY)", () => {
    const pairs = buildPairs(dataset);
    expect(pairs.map((pair) => [pair.us.ticker, pair.ucits.ticker])).toEqual([
      ["VOO", "VUAA"],
      ["IVV", "SXR8"],
      ["SPYM", "SPYL"],
      ["SPY", "SPYL"],
    ]);
  });

  it("ticker se bere z listing.ticker, ne z id fondu (CSPX na Xetře = SXR8)", () => {
    const cspx = buildPairs(dataset).find((pair) => pair.ucits.fund.id === "cspx")!.ucits;
    expect(cspx.ticker).toBe(cspx.fund.listing.ticker.value);
    expect(cspx.ticker).toBe("SXR8");
  });

  it("fond bez tickeru → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "vuaa")!.listing.ticker.value = null;
    expect(() => buildPairs(data)).toThrow(/vuaa nemá ticker/);
  });

  it("každý pár je oboustranný a vlevo je vždy americký fond, vpravo UCITS", () => {
    for (const { us, ucits } of buildPairs(dataset)) {
      expect(us.fund.type).toBe("US");
      expect(ucits.fund.type).toBe("UCITS");
      expect(us.fund.relatedFundIds).toContain(ucits.fund.id);
      expect(ucits.fund.relatedFundIds).toContain(us.fund.id);
    }
  });

  it("jednostranný pár → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "cspx")!.relatedFundIds = [];
    expect(() => buildPairs(data)).toThrow(/není oboustranný/);
  });

  it("sdílené dvojče, které o jednom z amerických fondů neví → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "spyl")!.relatedFundIds = ["spym"];
    expect(() => buildPairs(data)).toThrow(/spy ↔ spyl není oboustranný/);
  });

  it("americký fond bez dvojčete → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "voo")!.relatedFundIds = [];
    expect(() => buildPairs(data)).toThrow(/nemá evropské dvojče/);
  });

  it("americký fond s víc dvojčaty → výjimka", () => {
    const data = clone();
    data.funds.find((fund) => fund.id === "voo")!.relatedFundIds = ["vuaa", "cspx"];
    data.funds.find((fund) => fund.id === "cspx")!.relatedFundIds = ["ivv", "voo"];
    expect(() => buildPairs(data)).toThrow(/víc evropských dvojčat/);
  });

  it("fondy s rolí guide-only se do párů nedostanou", () => {
    const data = clone();
    for (const fund of data.funds) if (fund.id === "spy") fund.role = "guide-only";
    expect(buildPairs(data).map((pair) => pair.us.ticker)).toEqual(["VOO", "IVV", "SPYM"]);
  });
});

describe("groupByUcits a uniqueUcitsFunds – SPYL jen jednou", () => {
  const pairs = buildPairs(dataset);

  it("každý UCITS fond je v seznamu právě jednou, v pořadí párů", () => {
    expect(uniqueUcitsFunds(pairs).map((fund) => fund.ticker)).toEqual(["VUAA", "SXR8", "SPYL"]);
  });

  it("skupina SPYL obsahuje SPYM i SPY ve stejném pořadí jako páry", () => {
    expect(groupByUcits(pairs).map((group) => [group.ucits.ticker, group.us.map((us) => us.ticker)])).toEqual([
      ["VUAA", ["VOO"]],
      ["SXR8", ["IVV"]],
      ["SPYL", ["SPYM", "SPY"]],
    ]);
  });

  it("skupiny pokrývají všechny americké fondy právě jednou", () => {
    const usInGroups = groupByUcits(pairs).flatMap((group) => group.us.map((us) => us.fund.id));
    expect(usInGroups.sort()).toEqual(pairs.map((pair) => pair.us.fund.id).sort());
  });
});

describe("lowestTerIds – odznak „nejnižší TER“", () => {
  const vuaa = fundById("vuaa");
  const cspx = fundById("cspx");
  const spyl = fundById("spyl");

  it("jediný nejnižší TER → jeden fond", () => {
    expect(lowestTerIds([withTer(vuaa, 0.07), withTer(cspx, 0.05), withTer(spyl, 0.03)])).toEqual(["spyl"]);
  });

  it("shoda → odznak dostanou všechny shodné", () => {
    expect(lowestTerIds([withTer(vuaa, 0.07), withTer(cspx, 0.03), withTer(spyl, 0.03)])).toEqual(["cspx", "spyl"]);
  });

  it("sdílené dvojče předané vícekrát dostane odznak jednou", () => {
    const ucitsFromPairs = buildPairs(dataset).map((pair) => withTer(pair.ucits.fund, pair.ucits.fund.id === "spyl" ? 0.01 : 0.07));
    expect(ucitsFromPairs.filter((fund) => fund.id === "spyl")).toHaveLength(2);
    expect(lowestTerIds(ucitsFromPairs)).toEqual(["spyl"]);
  });

  it("TER bez zdroje nebo chybějící TER se nepočítá", () => {
    expect(lowestTerIds([withTer(vuaa, 0.01, false), withTer(cspx, null), withTer(spyl, 0.03)])).toEqual(["spyl"]);
    expect(lowestTerIds([withTer(vuaa, null, false)])).toEqual([]);
  });
});
