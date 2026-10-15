import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizeText } from "./sanitize";

describe("sanitizeText", () => {
  it("ořízne mezery a zkrátí na maximální délku", () => {
    expect(sanitizeText("  meta  ", 100)).toBe("meta");
    expect(sanitizeText("abcdef", 3)).toBe("abc");
  });

  it("odstraní řídicí, zero-width a bidi znaky", () => {
    expect(sanitizeText("me\u0000ta​‮﻿\n", 100)).toBe("meta");
  });

  it("sjednotí plnošířkové znaky (NFKC)", () => {
    expect(sanitizeText("ｍｅｔａ", 100)).toBe("meta");
  });

  it("ne-řetězec → prázdný řetězec", () => {
    expect(sanitizeText(42, 100)).toBe("");
    expect(sanitizeText({ toString: () => "x" }, 100)).toBe("");
    expect(sanitizeText(null, 100)).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("ořízne, převede na malá písmena a odstraní neviditelné znaky", () => {
    expect(sanitizeEmail("  Jan.Novak@Example.CZ ​")).toBe("jan.novak@example.cz");
  });

  it("nezkracuje – příliš dlouhý e-mail musí neprojít validací, ne se tiše zkrátit", () => {
    const long = `${"a".repeat(300)}@example.cz`;
    expect(sanitizeEmail(long)).toHaveLength(long.length);
  });
});
