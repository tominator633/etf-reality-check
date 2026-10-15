import { afterEach, describe, expect, it, vi } from "vitest";
import { getUtm, parseUtm } from "./utm";

const storage = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};
afterEach(() => vi.unstubAllGlobals());

describe("utm", () => {
  it("parseUtm přečte čtyři UTM, ostatní ignoruje", () => {
    expect(parseUtm("?utm_source=meta&utm_content=ad_b&gclid=x")).toEqual({
      source: "meta",
      medium: null,
      campaign: null,
      content: "ad_b",
    });
  });

  it("getUtm uloží UTM z první URL a vrátí je i bez nich v URL", () => {
    vi.stubGlobal("sessionStorage", storage());
    expect(getUtm("?utm_source=meta&utm_medium=paid_social").source).toBe("meta");
    expect(getUtm("")).toEqual({ source: "meta", medium: "paid_social", campaign: null, content: null });
  });

  it("bez úložiště vrátí UTM z URL, jinak prázdné", () => {
    vi.stubGlobal("sessionStorage", { getItem: () => { throw new Error("x"); }, setItem: () => { throw new Error("x"); } });
    expect(getUtm("?utm_source=meta").source).toBe("meta");
    expect(getUtm("")).toEqual({ source: null, medium: null, campaign: null, content: null });
  });
});
