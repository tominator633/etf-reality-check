import { z } from "zod";

// Závazné schéma podle tech-spec 4.2. Každá zobrazená hodnota nese zdroj a data ověření.

const isoDate = z.iso.date();

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

export function sourced<T extends z.ZodType>(value: T) {
  return z.object({
    value: value.nullable(), // null = zatím neověřeno
    unit: z.enum(["%", "USD", "EUR", "CZK", "bn USD"]).optional(),
    status: z.enum(["verified", "unverified"]),
    type: z.enum(["fact", "historical", "model"]),
    source: sourceSchema.nullable(),
    asOf: isoDate.nullable(), // ISO datum, ke kterému údaj platí
    verifiedAt: isoDate.nullable(), // ISO datum, kdy jsme údaj zkontrolovali
    note: z.string().optional(),
  });
}

export const fundSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  issuer: z.string().min(1),
  domicile: z.enum(["US", "IE", "LU"]),
  regime: z.enum(["US-registered", "UCITS"]),
  isin: sourced(z.string()),
  index: sourced(z.string()),
  ter: sourced(z.number().nonnegative()), // v procentech, 0.03 = 0,03 %
  aum: sourced(z.number().nonnegative()),
  distribution: sourced(z.enum(["ACC", "DIST"])),
  baseCurrency: sourced(z.enum(["USD", "EUR"])),
  hedged: z.boolean(),
  kidAvailableForEURetail: sourced(z.boolean()),
  relatedFundIds: z.array(z.string()),
  role: z.enum(["quiz-pair", "guide-only"]), // zobrazit v kvízu, nebo jen v taháku
  previousTicker: z.string().optional(), // např. SPYM: "SPLG" – jen pokud ověřeno
});

export const listingSchema = z.object({
  fundId: z.string(),
  ticker: z.string().min(1),
  exchange: sourced(z.string()),
  tradingCurrency: sourced(z.enum(["USD", "EUR", "GBP"])),
});

export const datasetSchema = z.object({
  datasetVersion: z.string().min(1),
  funds: z.array(fundSchema),
  listings: z.array(listingSchema),
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
  unit?: "%" | "USD" | "EUR" | "CZK" | "bn USD";
  status: "verified" | "unverified";
  type: "fact" | "historical" | "model";
  source: { label: string; url: string } | null;
  asOf: string | null;
  verifiedAt: string | null;
  note?: string;
};
export type Fund = z.infer<typeof fundSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export type Assumptions = z.infer<typeof assumptionsSchema>;
