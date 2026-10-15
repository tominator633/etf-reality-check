// Sanitizace textového vstupu z formuláře a z URL (UTM). Nejdřív čistíme, pak validujeme
// přísným allowlistem (lead.schema.ts) – nic se nevkládá do HTML ani do SQL jako text
// (SQL jen přes tagged template), sanitizace tedy řeší neviditelné a řídicí znaky a délku.

// Řídicí znaky (C0, DEL, C1), zero-width a bidi znaky, BOM.
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F­​-‏‪-‮⁠-⁯﻿]/g;

/**
 * Vrátí očištěný text: Unicode NFKC (sjednotí např. plnošířkové znaky), bez neviditelných
 * a řídicích znaků, bez mezer na okrajích, zkrácený na `maxLength`. Ne-řetězec → "".
 */
export function sanitizeText(raw: unknown, maxLength: number): string {
  if (typeof raw !== "string") return "";
  return raw.normalize("NFKC").replace(INVISIBLE, "").trim().slice(0, maxLength);
}

/** E-mail: sanitizeText + malá písmena. Délku nezkracuje (příliš dlouhý e-mail má neprojít validací). */
export function sanitizeEmail(raw: unknown): string {
  return sanitizeText(raw, Number.MAX_SAFE_INTEGER).toLowerCase();
}
