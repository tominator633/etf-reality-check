import { z } from "zod";
import { sanitizeEmail, sanitizeText } from "@/shared/lib/sanitize";

// Jedno schéma leadu pro klienta i server (tech-spec 7.1–7.2). Vstup se nejdřív sanitizuje
// (shared/lib/sanitize.ts), pak validuje allowlistem. Jen chyba v e-mailu vrací 400 – ostatní
// pole se při neplatné hodnotě nahradí bezpečným výchozím stavem, aby se kvůli UTM neztratil lead.

export const EMAIL_MAX_LENGTH = 254;
const EMAIL_LOCAL_MAX_LENGTH = 64;
const UTM_MAX_LENGTH = 100;
const HONEYPOT_MAX_LENGTH = 200;

export const emailSchema = z.preprocess(
  sanitizeEmail,
  z
    .email()
    .max(EMAIL_MAX_LENGTH)
    .refine((email) => email.split("@")[0].length <= EMAIL_LOCAL_MAX_LENGTH),
);

// UTM: jen písmena, číslice a _ - . + mezera; cokoli jiného → null.
const utmValue = z.preprocess(
  (raw) => sanitizeText(raw, UTM_MAX_LENGTH) || null,
  z.string().regex(/^[A-Za-z0-9_.+\- ]+$/).nullable(),
).catch(null);

export const utmSchema = z
  .object({ source: utmValue, medium: utmValue, campaign: utmValue, content: utmValue })
  .catch({ source: null, medium: null, campaign: null, content: null });

export const leadRequestSchema = z.object({
  email: emailSchema,
  // Honeypot: cokoli jiného než prázdný řetězec = bot (ne-řetězec se převede na neprázdnou značku).
  website: z.preprocess((raw) => (raw === undefined ? "" : typeof raw === "string" ? raw : "bot"), z.string().max(HONEYPOT_MAX_LENGTH)).catch("bot"),
  variant: z.enum(["a", "b"]).catch("a"),
  utm: utmSchema.default({ source: null, medium: null, campaign: null, content: null }),
  quiz: z.object({ answer: z.enum(["ano", "ne"]) }).nullable().catch(null).default(null),
  startedAt: z.number().int().positive().nullable().catch(null).default(null),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;
export type LeadErrorCode = "invalid_email" | "invalid_request" | "rate_limited" | "server_error";
export type LeadResponse = { ok: true; guideUrl: string } | { ok: false; code: LeadErrorCode };
