import { z } from "zod";

// Schéma dat fondů (tvar od Toma k 15. 10. 2026, nahrazuje tech-spec 4.2 – viz docs/decisions.md).
// Každá hodnota nese zdroj (URL + popisek) a datum, ke kterému platí. Neznámá hodnota = null
// bez zdroje; ověřená = hodnota se zdrojem. Datum ověření je u datasetu (`verifiedAt`),
// jednotlivá hodnota ho může přepsat.

const isoDate = z.iso.date();

export function sourced<T extends z.ZodType>(value: T) {
  return z.strictObject({
    value: value.nullable(), // null = zatím neověřeno
    sourceUrl: z.url().nullable(),
    sourceLabel: z.string().min(1).nullable(),
    asOf: isoDate.nullable(), // ISO datum, ke kterému údaj platí
    verifiedAt: isoDate.optional(), // přepíše dataset.verifiedAt
    note: z.string().optional(),
  });
}

export const listingSchema = z.strictObject({
  exchange: sourced(z.string().min(1)),
  ticker: sourced(z.string().min(1)),
  tradingCurrency: sourced(z.enum(["USD", "EUR", "GBP"])),
});

export const fundSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  issuer: z.string().min(1),
  type: z.enum(["US", "UCITS"]),
  domicile: sourced(z.enum(["US", "IE", "LU"])),
  index: sourced(z.string().min(1)),
  ter: sourced(z.number().nonnegative()), // v procentech, 0.03 = 0,03 % (tech-spec 5.2)
  isin: sourced(z.string().regex(/^[A-Z]{2}[A-Z0-9]{9}\d$/)),
  distribution: sourced(z.enum(["ACC", "DIST"])),
  baseCurrency: sourced(z.enum(["USD", "EUR"])),
  hedged: sourced(z.boolean()),
  listing: listingSchema, // kótace, kterou ukazuje UI (ticker = listing.ticker)
  czRetailAvailable: sourced(z.boolean()), // koupí ho drobný investor v ČR (KID/PRIIPs, registrace)
  relatedFundIds: z.array(z.string()),
  role: z.enum(["quiz-pair", "guide-only"]), // zobrazit v kvízu, nebo jen v taháku
  previousTicker: z.string().optional(), // např. SPYM: „SPLG“ – jen pokud ověřeno
});

export const datasetSchema = z.strictObject({
  datasetVersion: z.string().min(1),
  verifiedAt: isoDate, // kdy Tom data naposledy ověřil
  funds: z.array(fundSchema),
});

const rangeSchema = z.object({
  default: z.number(),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
});

export const assumptionsSchema = z.object({
  grossAnnualReturn: rangeSchema.extend({
    type: z.literal("model"),
    label: z.string().min(1),
    note: z.string().min(1),
  }),
  years: rangeSchema,
  monthly: rangeSchema,
});

export type Sourced<T> = {
  value: T | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  asOf: string | null;
  verifiedAt?: string;
  note?: string;
};
export type Fund = z.infer<typeof fundSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export type Assumptions = z.infer<typeof assumptionsSchema>;
