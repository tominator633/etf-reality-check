import { describe, expect, it, vi } from "vitest";
import { submitLead, type LeadPayload } from "./submit-lead";

const payload: LeadPayload = {
  email: "jan@example.cz",
  website: "",
  variant: "a",
  utm: { source: null, medium: null, campaign: null, content: null },
  quiz: { answer: "ne" },
  startedAt: 1,
};
const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

describe("submitLead", () => {
  it("200 { ok: true } → úspěch s odkazem na PDF", async () => {
    const fetchImpl = respond(200, { ok: true, guideUrl: "/tahak-etf-2026.pdf" });
    expect(await submitLead(payload, { fetchImpl })).toEqual({ status: "success", guideUrl: "/tahak-etf-2026.pdf" });
    expect(fetchImpl).toHaveBeenCalledWith("/api/lead", expect.objectContaining({ method: "POST" }));
  });

  it("chybový kód ze serveru se předá dál", async () => {
    expect(await submitLead(payload, { fetchImpl: respond(400, { ok: false, code: "invalid_email" }) })).toEqual({
      status: "error",
      code: "invalid_email",
    });
    expect(await submitLead(payload, { fetchImpl: respond(429, { ok: false, code: "rate_limited" }) })).toEqual({
      status: "error",
      code: "rate_limited",
    });
  });

  it("200 bez ok: true, nevalidní JSON nebo síťová chyba → server_error (žádný falešný úspěch)", async () => {
    expect(await submitLead(payload, { fetchImpl: respond(200, { ok: false }) })).toEqual({ status: "error", code: "server_error" });
    const notJson = vi.fn(async () => new Response("<html>", { status: 200 }));
    expect(await submitLead(payload, { fetchImpl: notJson })).toEqual({ status: "error", code: "server_error" });
    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await submitLead(payload, { fetchImpl: offline })).toEqual({ status: "error", code: "server_error" });
  });

  it("timeout → požadavek se zruší a vrátí server_error", async () => {
    const hanging = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))),
    );
    expect(await submitLead(payload, { fetchImpl: hanging, timeoutMs: 10 })).toEqual({ status: "error", code: "server_error" });
  });
});
