import { describe, expect, it } from "vitest";
import { formatCzk, formatDate, formatNumber, formatRate, formatTer, formatYears } from "./format";

// Očekávané řetězce píšeme s „ “ (U+0020) a v testu je převádíme na nedělitelné mezery.
const nbsp = (text: string) => text.replace(/ /g, " ");

describe("format", () => {
  it("formatCzk: celé Kč s nedělitelnými mezerami", () => {
    expect(formatCzk(4556.57)).toBe(nbsp("4 557 Kč"));
    expect(formatCzk(1360315.9)).toBe(nbsp("1 360 316 Kč"));
    expect(formatCzk(0)).toBe(nbsp("0 Kč"));
  });

  it("formatNumber: oddělovač tisíců", () => {
    expect(formatNumber(20000)).toBe(nbsp("20 000"));
  });

  it("formatTer: procenta bez zaokrouhlení", () => {
    expect(formatTer(0.03)).toBe(nbsp("0,03 %"));
    expect(formatTer(0.0945)).toBe(nbsp("0,0945 %"));
    expect(formatTer(0.07)).toBe(nbsp("0,07 %"));
  });

  it("formatRate: desetinné číslo jako procenta", () => {
    expect(formatRate(0.06)).toBe(nbsp("6 %"));
    expect(formatRate(0.065)).toBe(nbsp("6,5 %"));
  });

  it("formatYears: český tvar", () => {
    expect(formatYears(1)).toBe(nbsp("1 rok"));
    expect(formatYears(2)).toBe(nbsp("2 roky"));
    expect(formatYears(4)).toBe(nbsp("4 roky"));
    expect(formatYears(5)).toBe(nbsp("5 let"));
    expect(formatYears(20)).toBe(nbsp("20 let"));
  });

  it("formatDate: český formát data", () => {
    expect(formatDate("2026-10-15")).toBe(nbsp("15. 10. 2026"));
    expect(formatDate("2026-01-05")).toBe(nbsp("5. 1. 2026"));
  });
});
