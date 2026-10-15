import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreScroll, startScrollRetention } from "./scroll-retention";

function setup(stored: string | null) {
  const listeners = new Map<string, () => void>();
  const session = new Map<string, string>(stored === null ? [] : [["rc_scroll_y", stored]]);
  const win = {
    scrollY: 1234.4,
    scrollTo: vi.fn(),
    addEventListener: (type: string, fn: () => void) => listeners.set(type, fn),
    removeEventListener: (type: string) => listeners.delete(type),
    sessionStorage: { getItem: (k: string) => session.get(k) ?? null, setItem: (k: string, v: string) => void session.set(k, v) },
  };
  const hist = { scrollRestoration: "auto" };
  vi.stubGlobal("window", win);
  vi.stubGlobal("history", hist);
  return { win, hist, listeners, session };
}
afterEach(() => vi.unstubAllGlobals());

describe("scroll-retention", () => {
  it("při odchodu uloží pozici a přepne obnovu scrollu na ruční", () => {
    const { hist, listeners, session } = setup(null);
    const stop = startScrollRetention();
    expect(hist.scrollRestoration).toBe("manual");
    listeners.get("pagehide")!();
    expect(session.get("rc_scroll_y")).toBe("1234");
    stop();
    expect(listeners.has("pagehide")).toBe(false);
  });

  it("obnoví uloženou pozici, nesmysly a nulu ignoruje", () => {
    expect(() => restoreScroll()).not.toThrow();
    let { win } = setup("1513");
    restoreScroll();
    expect(win.scrollTo).toHaveBeenCalledWith({ top: 1513, behavior: "instant" });
    for (const bad of ["abc", "-5", "0", "Infinity", null]) {
      ({ win } = setup(bad));
      restoreScroll();
      expect(win.scrollTo).not.toHaveBeenCalled();
    }
  });
});
