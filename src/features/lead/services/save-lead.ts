import "server-only";
import { neon } from "@neondatabase/serverless";
import type { LeadRequest } from "@/shared/schemas/lead.schema";

export type Lead = Pick<LeadRequest, "email" | "variant" | "utm" | "quiz"> & { consentVersion: string };

// Uložení leadu do Neonu (tech-spec 7.3). Hodnoty jen přes tagged template, nikdy skládáním řetězců.
export async function saveLead(lead: Lead): Promise<"created" | "duplicate"> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set"); // → route vrátí 500, žádný falešný úspěch
  const sql = neon(url);
  const rows = await sql`
    INSERT INTO leads (email, variant, utm_source, utm_medium, utm_campaign, utm_content,
                       quiz_answer, consent_version)
    VALUES (${lead.email}, ${lead.variant}, ${lead.utm.source}, ${lead.utm.medium},
            ${lead.utm.campaign}, ${lead.utm.content}, ${lead.quiz?.answer ?? null},
            ${lead.consentVersion})
    ON CONFLICT (email) DO NOTHING
    RETURNING id`;
  return rows.length ? "created" : "duplicate";
}
