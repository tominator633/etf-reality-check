import { CONSENT_VERSION } from "@/features/lead/lib/consent";
import { GUIDE_URL } from "@/features/lead/lib/guide";
import { clientIp, createRateLimiter, saveLead } from "@/features/lead/server";
import { leadRequestSchema, type LeadErrorCode, type LeadResponse } from "@/shared/schemas/lead.schema";

// POST /api/lead (tech-spec 7.2). Chyby vrací kódy, nikdy detaily; e-mail se nikam neloguje.

const MAX_BODY_BYTES = 4 * 1024;
const MIN_FILL_MS = 2000; // odesláno dřív než 2 s od otevření formuláře = bot

const allow = createRateLimiter();

function reply(body: LeadResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
const fail = (code: LeadErrorCode, status: number) => reply({ ok: false, code }, status);
const success = () => reply({ ok: true, guideUrl: GUIDE_URL });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return fail("invalid_request", 415);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail("invalid_request", 413);

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return fail("invalid_request", 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("invalid_request", 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return fail("invalid_request", 400);

  if (!allow(clientIp(request.headers), Date.now())) return fail("rate_limited", 429);

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) return fail("invalid_email", 400);
  const lead = parsed.data;

  // Honeypot nebo podezřele rychlé odeslání: tváříme se jako úspěch, nic neukládáme.
  const tooFast = lead.startedAt !== null && Date.now() - lead.startedAt < MIN_FILL_MS;
  if (lead.website !== "" || tooFast) return success();

  try {
    await saveLead({
      email: lead.email,
      variant: lead.variant,
      utm: lead.utm,
      quiz: lead.quiz,
      consentVersion: CONSENT_VERSION,
    });
  } catch (error) {
    console.error("[api/lead] uložení leadu selhalo:", error instanceof Error ? error.message : "neznámá chyba");
    return fail("server_error", 500);
  }
  // Uloženo i duplicita → 200 (neprozrazujeme, jestli e-mail už existuje).
  return success();
}
