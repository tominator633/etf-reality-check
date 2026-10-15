import { describe, expect, it } from "vitest";
import assumptions from "@data/assumptions.json";
import { clampInput, defaultInput, feeCost, futureValue, monthlyRate, projectAll } from "./projection";

// Referenční hodnoty z tech-spec 5.3 (Python, 15. 10. 2026).
// TER v těchto testech jsou VSTUPY TESTU, ne ověřená data fondů.
const base = { monthly: 3000, years: 20, grossReturn: 0.06 };

describe("projection – případy tech-spec 5.3", () => {
  it("#1 M = 3 000, 20 let, g = 6 %, TER = 0 → FV = 1 360 315,90", () => {
    expect(futureValue(3000, 20, 0.06)).toBeCloseTo(1_360_315.9, 2);
    expect(feeCost(base, 0)).toBe(0);
  });

  it.each([
    [2, 0.02, 3_039.65],
    [3, 0.03, 4_556.57],
    [4, 0.07, 10_605.01],
    [5, 0.0945, 14_294.51],
  ])("#%i TER = %f %% → feeCost ≈ %f", (_case, ter, expected) => {
    expect(Math.abs(feeCost(base, ter) - expected)).toBeLessThanOrEqual(0.01);
  });

  it("#6 g = TER (čistý výnos 0) → FV = M × n", () => {
    const input = { monthly: 3000, years: 20, grossReturn: 0.0007 };
    const net = futureValue(input.monthly, input.years, input.grossReturn - 0.07 / 100);
    expect(net).toBeCloseTo(3000 * 20 * 12, 6);
    expect(futureValue(500, 1, 0)).toBe(6000);
  });

  it("#7 vyšší TER ⇒ vyšší feeCost (náhodné vstupy v rozsahu)", () => {
    let seed = 42;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const between = (min: number, max: number) => min + random() * (max - min);
    for (let run = 0; run < 500; run++) {
      const input = {
        monthly: between(assumptions.monthly.min, assumptions.monthly.max),
        years: Math.round(between(assumptions.years.min, assumptions.years.max)),
        grossReturn: between(assumptions.grossAnnualReturn.min, assumptions.grossAnnualReturn.max),
      };
      const lower = between(0, 1);
      const higher = lower + between(0.001, 1);
      expect(feeCost(input, higher)).toBeGreaterThan(feeCost(input, lower));
    }
  });

  it("#8 clampInput ořízne mimo rozsah, NaN a text → výchozí", () => {
    expect(clampInput({ monthly: 10, years: 99, grossReturn: 0.5 })).toEqual({
      monthly: assumptions.monthly.min,
      years: assumptions.years.max,
      grossReturn: assumptions.grossAnnualReturn.max,
    });
    expect(clampInput({ monthly: NaN, years: "abc", grossReturn: undefined })).toEqual({
      monthly: assumptions.monthly.default,
      years: assumptions.years.default,
      grossReturn: assumptions.grossAnnualReturn.default,
    });
    expect(clampInput({ monthly: "5000", years: Infinity })).toMatchObject({
      monthly: 5000,
      years: assumptions.years.default,
    });
    expect(clampInput({})).toEqual(defaultInput);
  });

  it("#9 fond s ter: null → feeCost: null, žádná výjimka", () => {
    const result = projectAll(base, [
      { id: "a", ter: 0.03 },
      { id: "b", ter: null },
    ]);
    expect(result.perFund[1]).toEqual({ id: "b", feeCost: null });
    expect(result.perFund[0].feeCost).toBeCloseTo(4_556.57, 2);
    expect(result.invested).toBe(3000 * 20 * 12);
    expect(result.grossValue).toBeCloseTo(1_360_315.9, 2);
  });

  it("#10 převod na měsíční sazbu: 100 000 jednorázově, 10 let, 6 % → 179 084,77", () => {
    expect(100_000 * (1 + monthlyRate(0.06)) ** (10 * 12)).toBeCloseTo(179_084.77, 2);
  });
});

describe("projection – výchozí vstup", () => {
  it("odpovídá assumptions.json", () => {
    expect(defaultInput).toEqual({
      monthly: assumptions.monthly.default,
      years: assumptions.years.default,
      grossReturn: assumptions.grossAnnualReturn.default,
    });
  });
});
