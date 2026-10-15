import { describe, expect, it } from "vitest";
import assumptions from "../data/assumptions.json";
import dataset from "../data/etf.json";
import { checkData, isValidIsin } from "./check-data.ts";

const TODAY = "2026-10-15";
const dev = { production: false, today: TODAY };
const prod = { production: true, today: TODAY };

// Testy mění kopii aktuálních dat; hodnoty, které dosazují, jsou vstupy testu, ne ověřená data.
const clone = () => structuredClone(dataset);
const fund = (data: ReturnType<typeof clone>, id: string) => data.funds.find((candidate) => candidate.id === id)!;
const errorsOf = (data: unknown, options = dev) => checkData(data, assumptions, options).errors;

describe("checkData", () => {
  it("aktuální data projdou i v produkci", () => {
    expect(checkData(dataset, assumptions, prod)).toEqual({ errors: [], warnings: [] });
  });

  it("neověřená povinná hodnota: ve vývoji varování, v produkci chyba", () => {
    const data = clone();
    Object.assign(fund(data, "voo").isin, { value: null, sourceUrl: null, sourceLabel: null });
    const inDev = checkData(data, assumptions, dev);
    expect(inDev.errors).toEqual([]);
    expect(inDev.warnings).toContainEqual(expect.stringContaining("voo.isin: neověřeno"));
    expect(errorsOf(data, prod)).toContainEqual(expect.stringContaining("voo.isin: neověřeno"));
  });

  it("hodnota bez sourceUrl nebo sourceLabel → chyba", () => {
    const noUrl = clone();
    (fund(noUrl, "voo").ter as { sourceUrl: string | null }).sourceUrl = null;
    expect(errorsOf(noUrl)).toContainEqual(expect.stringContaining("voo.ter: hodnota bez sourceUrl"));

    const noLabel = clone();
    (fund(noLabel, "spyl").listing.exchange as { sourceLabel: string | null }).sourceLabel = null;
    expect(errorsOf(noLabel)).toContainEqual(expect.stringContaining("spyl.listing.exchange: hodnota bez sourceLabel"));
  });

  it("chybějící ticker → chyba i ve vývoji", () => {
    const data = clone();
    Object.assign(fund(data, "cspx").listing.ticker, { value: null, sourceUrl: null, sourceLabel: null });
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("cspx.listing.ticker: chybí ticker"));
  });

  it("TER zapsaný jako zlomek (0.0003 místo 0.03) → chyba", () => {
    const data = clone();
    fund(data, "voo").ter.value = 0.0003;
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("voo.ter: 0.0003 vypadá jako zlomek"));
  });

  it("ISIN s neplatnou kontrolní číslicí → chyba", () => {
    const data = clone();
    fund(data, "voo").isin.value = "US9229083633";
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("voo.isin: US9229083633 nemá platnou kontrolní číslici"));
  });

  it("dostupnost v ČR v rozporu s nadpisem sloupce → chyba", () => {
    const data = clone();
    fund(data, "spyl").czRetailAvailable.value = false;
    fund(data, "spy").czRetailAvailable.value = true;
    const errors = errorsOf(data);
    expect(errors).toContainEqual(expect.stringContaining("spyl.czRetailAvailable: false odporuje"));
    expect(errors).toContainEqual(expect.stringContaining("spy.czRetailAvailable: true odporuje"));
  });

  it("jednostranný pár → chyba", () => {
    const data = clone();
    fund(data, "vuaa").relatedFundIds = [];
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("voo ↔ vuaa: pár není oboustranný"));
  });

  it("sdílené dvojče (SPYL ↔ SPYM i SPY) projde, jednostranné sdílení ne", () => {
    expect(fund(clone(), "spyl").relatedFundIds).toEqual(["spym", "spy"]);
    const data = clone();
    fund(data, "spyl").relatedFundIds = ["spym"];
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("spy ↔ spyl: pár není oboustranný"));
  });

  it("americký fond v kvízu bez dvojčete nebo s víc dvojčaty → chyba", () => {
    const none = clone();
    fund(none, "voo").relatedFundIds = [];
    fund(none, "vuaa").relatedFundIds = [];
    expect(errorsOf(none)).toContainEqual(
      expect.stringContaining("voo: americký fond v kvízu musí mít právě jedno UCITS dvojče (má 0)"),
    );

    const two = clone();
    fund(two, "voo").relatedFundIds = ["vuaa", "cspx"];
    fund(two, "cspx").relatedFundIds = ["ivv", "voo"];
    expect(errorsOf(two)).toContainEqual(expect.stringContaining("(má 2)"));
  });

  it("odkaz na neexistující fond → chyba", () => {
    const data = clone();
    fund(data, "voo").relatedFundIds = ["neexistuje"];
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("neexistující fond"));
  });

  it("datum ověření v budoucnosti → chyba, starší než 90 dní → varování", () => {
    const future = clone();
    future.verifiedAt = "2026-10-16";
    expect(errorsOf(future, prod)).toContainEqual(expect.stringContaining("je v budoucnosti"));

    const old = clone();
    old.verifiedAt = "2026-07-01";
    const result = checkData(old, assumptions, prod);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toContainEqual(expect.stringContaining("ověřeno před"));
  });

  it("asOf v budoucnosti → chyba", () => {
    const data = clone();
    fund(data, "spyl").ter.asOf = "2026-12-01";
    expect(errorsOf(data)).toContainEqual(expect.stringContaining("spyl.ter: asOf 2026-12-01 je v budoucnosti"));
  });

  it("data mimo schéma (neznámé pole nebo hodnota) → chyba", () => {
    const badEnum = clone() as unknown as { funds: { type: string }[] };
    badEnum.funds[0].type = "XX";
    expect(errorsOf(badEnum)).toContainEqual(expect.stringContaining("neodpovídá schématu"));

    const extraField = clone() as unknown as { funds: Record<string, unknown>[] };
    extraField.funds[0].regime = "US-registered";
    expect(errorsOf(extraField)).toContainEqual(expect.stringContaining("neodpovídá schématu"));
  });

  it("výchozí hodnota předpokladu mimo rozsah → chyba", () => {
    const broken = structuredClone(assumptions);
    broken.years.default = broken.years.max + 1;
    expect(checkData(dataset, broken, dev).errors).toContainEqual(expect.stringContaining("assumptions.years"));
  });
});

describe("isValidIsin", () => {
  it("přijme ISINy z dat a odmítne změněnou číslici nebo špatný formát", () => {
    for (const candidate of dataset.funds) expect(isValidIsin(candidate.isin.value)).toBe(true);
    expect(isValidIsin("IE00B5BMR088")).toBe(false);
    expect(isValidIsin("IE00B5BMR08")).toBe(false);
  });
});
