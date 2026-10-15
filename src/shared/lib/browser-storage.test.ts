import { afterEach, describe, expect, it, vi } from "vitest";
import { readStored, removeStored, writeStored } from "./browser-storage";
import { readQuizAnswer, storeQuizAnswer } from "./quiz-answer-storage";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}
afterEach(() => vi.unstubAllGlobals());

describe("browser-storage", () => {
  it("zapisuje a čte zvlášť session a local", () => {
    vi.stubGlobal("window", { sessionStorage: memoryStorage(), localStorage: memoryStorage() });
    writeStored("session", "k", "s");
    writeStored("local", "k", "l");
    expect(readStored("session", "k")).toBe("s");
    expect(readStored("local", "k")).toBe("l");
    removeStored("session", "k");
    expect(readStored("session", "k")).toBeNull();
  });

  it("bez window nebo při zákazu úložiště nevyhodí chybu a čtení vrátí null", () => {
    expect(readStored("session", "k")).toBeNull();
    const denied = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); }, removeItem: () => { throw new Error("denied"); } };
    vi.stubGlobal("window", { sessionStorage: denied, localStorage: denied });
    expect(() => writeStored("session", "k", "v")).not.toThrow();
    expect(() => removeStored("local", "k")).not.toThrow();
    expect(readStored("local", "k")).toBeNull();
  });
});

describe("quiz-answer-storage", () => {
  it("uloží a přečte odpověď, cizí hodnotu ignoruje", () => {
    const session = memoryStorage();
    vi.stubGlobal("window", { sessionStorage: session, localStorage: memoryStorage() });
    storeQuizAnswer("ne");
    expect(readQuizAnswer()).toBe("ne");
    session.setItem("rc_quiz_answer", "<script>");
    expect(readQuizAnswer()).toBeNull();
  });
});
