import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const saveLead = vi.fn();
vi.mock("@/features/lead/services/save-lead", () => ({ saveLead }));
const { POST } = await import("./route");

let ipCounter = 0;
function request(body: unknown, { ip = `10.0.0.${++ipCounter}`, contentType = "application/json" } = {}) {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const valid = () => ({ email: "Jan@Example.cz ", website: "", variant: "a", utm: { source: "meta" }, quiz: { answer: "ne" }, startedAt: Date.now() - 10_000 });

beforeEach(() => {
  saveLead.mockReset();
  saveLead.mockResolvedValue("created");
});

describe("POST /api/lead", () => {
  it("platný lead → 200 s odkazem na PDF, uloží sanitizovaný e-mail", async () => {
    const response = await POST(request(valid()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, guideUrl: "/tahak-etf-2026.pdf" });
    expect(saveLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jan@example.cz", quiz: { answer: "ne" }, consentVersion: "2026-10-15-draft" }),
    );
  });

  it("duplicitní e-mail → stejná odpověď 200 (neprozrazuje existenci)", async () => {
    saveLead.mockResolvedValue("duplicate");
    const response = await POST(request(valid()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, guideUrl: "/tahak-etf-2026.pdf" });
  });

  it("neplatný e-mail → 400 invalid_email, nic se neuloží", async () => {
    const response = await POST(request({ ...valid(), email: "jan@<script>" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, code: "invalid_email" });
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("honeypot vyplněný nebo odesláno do 2 s → 200, ale nic se neuloží", async () => {
    expect((await POST(request({ ...valid(), website: "spam" }))).status).toBe(200);
    expect((await POST(request({ ...valid(), startedAt: Date.now() }))).status).toBe(200);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("chyba databáze nebo chybějící DATABASE_URL → 500 server_error, žádný falešný úspěch", async () => {
    saveLead.mockRejectedValue(new Error("DATABASE_URL is not set"));
    const response = await POST(request(valid()));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, code: "server_error" });
  });

  it("šestý požadavek ze stejné IP do 10 minut → 429", async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(request(valid(), { ip: "9.9.9.9" }))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("jiný typ obsahu → 415, nevalidní JSON nebo pole → 400, příliš velké tělo → 413", async () => {
    expect((await POST(request(valid(), { contentType: "text/plain" }))).status).toBe(415);
    expect((await POST(request("{nevalidní"))).status).toBe(400);
    expect((await POST(request([1, 2]))).status).toBe(400);
    expect((await POST(request({ ...valid(), website: "x".repeat(5000) }))).status).toBe(413);
    expect(saveLead).not.toHaveBeenCalled();
  });

  it("odpověď se necachuje a neobsahuje e-mail", async () => {
    const response = await POST(request(valid()));
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.stringify(await response.json())).not.toContain("jan@");
  });
});
