import { describe, expect, it } from "vitest";
import { copy } from "./copy";
import { heroVariants } from "./hero-variants";

// Pojistka pravidla „žádná ručně psaná čísla“: v textech nesmí být číslice,
// kromě výslovně povolených výrazů (název indexu, počet otázek kvízu).
const ALLOWED = ["S&P 500", "1 otázka"];
const SAMPLE = "§";
// Argument šablony: jako řetězec vrací SAMPLE, jako objekt má SAMPLE v každé vlastnosti.
const sampleArgument = new Proxy(
  {},
  { get: (_target, key) => (key === Symbol.toPrimitive ? () => SAMPLE : SAMPLE) },
);

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return strings(value(sampleArgument));
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function withoutAllowed(text: string): string {
  return ALLOWED.reduce((result, allowed) => result.split(allowed).join(""), text);
}

describe("content", () => {
  it.each(strings(copy).map((text) => [text]))("copy bez ručně psaných čísel: %s", (text) => {
    expect(withoutAllowed(text)).not.toMatch(/\d/);
  });

  it.each(strings(heroVariants).map((text) => [text]))("hero bez ručně psaných čísel: %s", (text) => {
    expect(withoutAllowed(text)).not.toMatch(/\d/);
  });

  it("hero B dosazuje částku i dobu z proměnných", () => {
    const values = { feeDifference: "«ČÁSTKA»", years: "«DOBA»" };
    expect(heroVariants.b.h1(values)).toContain("«ČÁSTKA»");
    expect(heroVariants.b.subtitle(values)).toContain("«DOBA»");
  });

  it("souhrnná věta pod jezdci dosazuje všechny čtyři hodnoty", () => {
    const sentence = copy.sliders.summary({ invested: "«V»", grossValue: "«H»", minFeeCost: "«MIN»", maxFeeCost: "«MAX»" });
    for (const token of ["«V»", "«H»", "«MIN»", "«MAX»"]) expect(sentence).toContain(token);
  });

  it("žádné doporučení v textech", () => {
    const all = [...strings(copy), ...strings(heroVariants)].join("\n").toLowerCase();
    for (const phrase of ["doporučujeme", "kupte", "ten si koupíte", "zaručen"]) expect(all).not.toContain(phrase);
  });
});
