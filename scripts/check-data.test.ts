import { describe, expect, it } from "vitest";
import assumptions from "../data/assumptions.json";
import dataset from "../data/etf.json";
import { checkData } from "./check-data.ts";

const TODAY = "2026-10-15";
const dev = { production: false, today: TODAY };
const prod = { production: true, today: TODAY };

const clone = <T>(value: T): T => structuredClone(value);

// Hodnoty níž jsou vstupy testu, ne ověřená data.
function verify(field: Record<string, unknown>, value: unknown, verifiedAt = TODAY) {
  Object.assign(field, {
    value,
    status: "verified",
    source: { label: "Test", url: "https://example.com/fund" },
    asOf: null,
    verifiedAt,
  });
}

function fullyVerifiedDataset() {
  const data = clone(dataset);
  for (const fund of data.funds) {
    verify(fund.ter, 0.03);
    verify(fund.isin, "TEST");
    verify(fund.index, "TEST");
    verify(fund.distribution, "ACC");
  }
  return data;
}

describe("checkData", () => {
  it("aktuální data: ve vývoji jen varování, v produkci chyby", () => {
    const inDev = checkData(dataset, assumptions, dev);
    expect(inDev.errors).toEqual([]);
    expect(inDev.warnings.length).toBeGreaterThan(0);

    const inProd = checkData(dataset, assumptions, prod);
    expect(inProd.errors.length).toBeGreaterThan(0);
  });

  it("plně ověřený dataset projde i v produkci", () => {
    expect(checkData(fullyVerifiedDataset(), assumptions, prod)).toEqual({ errors: [], warnings: [] });
  });

  it("ověřená hodnota bez zdroje → chyba", () => {
    const data = fullyVerifiedDataset();
    data.funds[0].ter.source = null as never;
    expect(checkData(data, assumptions, dev).errors).toContainEqual(expect.stringContaining("bez source.url"));
  });

  it("ověřená hodnota bez verifiedAt → chyba", () => {
    const data = fullyVerifiedDataset();
    data.funds[0].ter.verifiedAt = null as never;
    expect(checkData(data, assumptions, dev).errors).toContainEqual(expect.stringContaining("bez verifiedAt"));
  });

  it("neověřená hodnota, která není null → chyba", () => {
    const data = clone(dataset);
    (data.funds[0].ter as { value: unknown }).value = 0.03;
    expect(checkData(data, assumptions, dev).errors).toContainEqual(
      expect.stringContaining("neověřená hodnota musí být null"),
    );
  });

  it("jednostranný pár → chyba", () => {
    const data = fullyVerifiedDataset();
    data.funds.find((fund) => fund.id === "vuaa")!.relatedFundIds = [];
    expect(checkData(data, assumptions, dev).errors).toContainEqual(expect.stringContaining("není oboustranný"));
  });

  it("odkaz na neexistující fond → chyba", () => {
    const data = fullyVerifiedDataset();
    data.funds[0].relatedFundIds = ["neexistuje"];
    expect(checkData(data, assumptions, dev).errors).toContainEqual(expect.stringContaining("neexistující fond"));
  });

  it("verifiedAt v budoucnosti → chyba, starší než 90 dní → varování", () => {
    const future = fullyVerifiedDataset();
    verify(future.funds[0].ter, 0.03, "2026-10-16");
    expect(checkData(future, assumptions, prod).errors).toContainEqual(expect.stringContaining("v budoucnosti"));

    const old = fullyVerifiedDataset();
    verify(old.funds[0].ter, 0.03, "2026-07-01");
    const result = checkData(old, assumptions, prod);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toContainEqual(expect.stringContaining("ověřeno před"));
  });

  it("data mimo schéma → chyba", () => {
    const data = clone(dataset) as unknown as { funds: { domicile: string }[] };
    data.funds[0].domicile = "XX";
    expect(checkData(data, assumptions, dev).errors).toContainEqual(expect.stringContaining("neodpovídá schématu"));
  });

  it("výchozí hodnota předpokladu mimo rozsah → chyba", () => {
    const broken = clone(assumptions);
    broken.years.default = broken.years.max + 1;
    expect(checkData(dataset, broken, dev).errors).toContainEqual(expect.stringContaining("assumptions.years"));
  });
});
