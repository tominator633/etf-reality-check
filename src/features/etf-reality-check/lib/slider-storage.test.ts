import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import assumptions from "@data/assumptions.json";
import { readProjectionInput, storeProjectionInput } from "./slider-storage";

let session: Map<string, string>;
beforeEach(() => {
  session = new Map();
  vi.stubGlobal("window", {
    sessionStorage: { getItem: (k: string) => session.get(k) ?? null, setItem: (k: string, v: string) => void session.set(k, v) },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("slider-storage", () => {
  it("uloží a obnoví nastavení jezdců", () => {
    storeProjectionInput({ monthly: 5000, years: 25, grossReturn: 0.07 });
    expect(readProjectionInput()).toEqual({ monthly: 5000, years: 25, grossReturn: 0.07 });
  });

  it("nic uloženo → null", () => {
    expect(readProjectionInput()).toBeNull();
  });

  it("podvržené nebo poškozené hodnoty ořízne na rozsahy, nevalidní JSON → null", () => {
    session.set("rc_projection_input", JSON.stringify({ monthly: 1e9, years: "x", grossReturn: -5 }));
    expect(readProjectionInput()).toEqual({
      monthly: assumptions.monthly.max,
      years: assumptions.years.default,
      grossReturn: assumptions.grossAnnualReturn.min,
    });
    session.set("rc_projection_input", "{nevalidní");
    expect(readProjectionInput()).toBeNull();
    session.set("rc_projection_input", "[1,2]");
    expect(readProjectionInput()).toBeNull();
  });
});
