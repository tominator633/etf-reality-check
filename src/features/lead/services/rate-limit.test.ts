import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientIp, createRateLimiter } = await import("./rate-limit");

describe("createRateLimiter", () => {
  it("pustí 5 požadavků za 10 minut, šestý odmítne, po okně zase pustí", () => {
    const allow = createRateLimiter();
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) expect(allow("1.2.3.4", start + i)).toBe(true);
    expect(allow("1.2.3.4", start + 10)).toBe(false);
    expect(allow("1.2.3.4", start + 10 * 60 * 1000 + 5)).toBe(true);
  });

  it("různé IP se nepočítají dohromady", () => {
    const allow = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(allow("a", 0)).toBe(true);
    expect(allow("b", 0)).toBe(true);
    expect(allow("a", 1)).toBe(false);
  });
});

describe("clientIp", () => {
  it("bere první IP z x-forwarded-for, jinak x-real-ip, jinak unknown", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
