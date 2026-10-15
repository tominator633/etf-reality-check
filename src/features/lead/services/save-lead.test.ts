import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const sqlMock = vi.fn();
vi.mock("@neondatabase/serverless", () => ({ neon: () => sqlMock }));
const { saveLead } = await import("./save-lead");

const lead = {
  email: "jan@example.cz",
  variant: "a" as const,
  utm: { source: "meta", medium: null, campaign: null, content: "ad_a" },
  quiz: { answer: "ne" as const },
  consentVersion: "test",
};

afterEach(() => {
  sqlMock.mockReset();
  vi.unstubAllEnvs();
});

describe("saveLead", () => {
  it("bez DATABASE_URL vyhodí chybu (route vrátí 500, žádný falešný úspěch)", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(saveLead(lead)).rejects.toThrow("DATABASE_URL");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("hodnoty posílá jako parametry tagged template, ne jako součást SQL textu", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test");
    sqlMock.mockResolvedValue([{ id: "1" }]);
    expect(await saveLead({ ...lead, email: "x'); DROP TABLE leads;--@example.cz" })).toBe("created");
    const [strings, ...values] = sqlMock.mock.calls[0];
    expect(strings.join("")).not.toContain("DROP TABLE");
    expect(values).toEqual(["x'); DROP TABLE leads;--@example.cz", "a", "meta", null, null, "ad_a", "ne", "test"]);
  });

  it("existující e-mail → duplicate", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test");
    sqlMock.mockResolvedValue([]);
    expect(await saveLead(lead)).toBe("duplicate");
  });
});
