import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readLeadStep, storeFormOpen, storeLeadSent } from "./lead-state";

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};
beforeEach(() => vi.stubGlobal("window", { sessionStorage: memory(), localStorage: memory() }));
afterEach(() => vi.unstubAllGlobals());

describe("lead-state", () => {
  it("výchozí stav je tlačítko (cta)", () => {
    expect(readLeadStep()).toBe("cta");
  });

  it("otevřený formulář se obnoví jako form", () => {
    storeFormOpen();
    expect(readLeadStep()).toBe("form");
  });

  it("odeslání má přednost před otevřeným formulářem", () => {
    storeFormOpen();
    storeLeadSent();
    expect(readLeadStep()).toBe("success");
  });

  it("bez úložiště vždy cta", () => {
    vi.stubGlobal("window", {});
    storeLeadSent();
    expect(readLeadStep()).toBe("cta");
  });
});
