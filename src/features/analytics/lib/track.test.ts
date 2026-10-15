import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentVariant, track, trackOnce } from "./track";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

let umamiTrack: ReturnType<typeof vi.fn>;
beforeEach(() => {
  umamiTrack = vi.fn();
  vi.stubGlobal("window", { umami: { track: umamiTrack } });
  vi.stubGlobal("document", { querySelector: () => ({ dataset: { variant: "b" } }) });
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.spyOn(console, "debug").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("track", () => {
  it("pošle event s variantou ze stránky a nejvýš jednou vlastností navíc", () => {
    track("rc_answer", { answer: "ne" });
    expect(umamiTrack).toHaveBeenCalledWith("rc_answer", { answer: "ne", variant: "b" });
    track("rc_form_submit");
    expect(umamiTrack).toHaveBeenLastCalledWith("rc_form_submit", { variant: "b" });
  });

  it("bez Umami (blokátor, nevyplněné env) ani při chybě Umami nevyhodí chybu", () => {
    vi.stubGlobal("window", {});
    expect(() => track("rc_view")).not.toThrow();
    vi.stubGlobal("window", { umami: { track: () => { throw new Error("blocked"); } } });
    expect(() => track("rc_view")).not.toThrow();
  });

  it("neznámá nebo chybějící varianta → „a“", () => {
    vi.stubGlobal("document", { querySelector: () => ({ dataset: { variant: "<script>" } }) });
    expect(currentVariant()).toBe("a");
    vi.stubGlobal("document", { querySelector: () => null });
    expect(currentVariant()).toBe("a");
  });
});

describe("trackOnce", () => {
  it("stejný klíč pošle jen jednou za relaci", () => {
    trackOnce("rc_view", "rc_view");
    trackOnce("rc_view", "rc_view");
    trackOnce("slider:years", "rc_slider_change", { slider: "years" });
    trackOnce("slider:monthly", "rc_slider_change", { slider: "monthly" });
    expect(umamiTrack.mock.calls.map(([name, data]) => [name, data.slider])).toEqual([
      ["rc_view", undefined],
      ["rc_slider_change", "years"],
      ["rc_slider_change", "monthly"],
    ]);
  });

  it("bez sessionStorage pošle jednou za načtení stránky", () => {
    vi.stubGlobal("sessionStorage", { getItem: () => { throw new Error("denied"); }, setItem: () => {} });
    trackOnce("rc_form_focus:test", "rc_form_focus");
    trackOnce("rc_form_focus:test", "rc_form_focus");
    expect(umamiTrack).toHaveBeenCalledTimes(1);
  });
});
