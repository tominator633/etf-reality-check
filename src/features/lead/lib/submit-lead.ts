import type { LeadErrorCode, LeadResponse } from "@/shared/schemas/lead.schema";

// Odeslání leadu z prohlížeče (tech-spec 7.1–7.2). Úspěch jen po potvrzení serveru (`200 { ok: true }`).

export const SUBMIT_TIMEOUT_MS = 10_000; // Neon se po nečinnosti probouzí
const KNOWN_CODES: LeadErrorCode[] = ["invalid_email", "invalid_request", "rate_limited", "server_error"];

export type LeadPayload = {
  email: string;
  website: string;
  variant: "a" | "b";
  utm: Record<"source" | "medium" | "campaign" | "content", string | null>;
  quiz: { answer: "ano" | "ne" } | null;
  startedAt: number;
};

export type SubmitResult = { status: "success"; guideUrl: string } | { status: "error"; code: LeadErrorCode };

export async function submitLead(
  payload: LeadPayload,
  { fetchImpl = fetch, timeoutMs = SUBMIT_TIMEOUT_MS } = {},
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => null)) as LeadResponse | null;
    if (response.ok && body?.ok === true && typeof body.guideUrl === "string") {
      return { status: "success", guideUrl: body.guideUrl };
    }
    const code = body && body.ok === false && KNOWN_CODES.includes(body.code) ? body.code : "server_error";
    return { status: "error", code };
  } catch {
    // síť, timeout (abort) – pro návštěvníka stejné jako chyba serveru
    return { status: "error", code: "server_error" };
  } finally {
    clearTimeout(timer);
  }
}

/** UTM z URL stránky (jen čtení; sanitizuje a validuje server). */
export function readUtm(search: string): LeadPayload["utm"] {
  const params = new URLSearchParams(search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  };
}
