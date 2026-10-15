import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assumptionsSchema, datasetSchema } from "../data/schema.ts";

// Kontrola dat podle tech-spec 4.4. Běží jako `prebuild` a `npm run check:data`.

export type CheckResult = { errors: string[]; warnings: string[] };
export type CheckOptions = { production: boolean; today: string };

const REQUIRED_FOR_QUIZ = ["ter", "isin", "index", "distribution"] as const;
const MAX_AGE_DAYS = 90;

type SourcedLike = {
  value: unknown;
  status: "verified" | "unverified";
  source: { url: string } | null;
  verifiedAt: string | null;
};

function isSourced(value: unknown): value is SourcedLike {
  return typeof value === "object" && value !== null && "status" in value && "value" in value;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function checkData(rawDataset: unknown, rawAssumptions: unknown, options: CheckOptions): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const dataset = datasetSchema.safeParse(rawDataset);
  if (!dataset.success) {
    errors.push(`etf.json neodpovídá schématu: ${dataset.error.message}`);
  }
  const assumptions = assumptionsSchema.safeParse(rawAssumptions);
  if (!assumptions.success) {
    errors.push(`assumptions.json neodpovídá schématu: ${assumptions.error.message}`);
  } else {
    for (const [key, range] of Object.entries(assumptions.data)) {
      if (!(range.min <= range.default && range.default <= range.max)) {
        errors.push(`assumptions.${key}: výchozí hodnota mimo rozsah min–max`);
      }
    }
  }
  if (!dataset.success) return { errors, warnings };

  const { funds, listings } = dataset.data;
  const ids = new Set(funds.map((fund) => fund.id));

  if (ids.size !== funds.length) errors.push("etf.json: duplicitní id fondu");

  const checkSourced = (path: string, field: SourcedLike) => {
    if (field.status === "verified") {
      if (field.value === null) errors.push(`${path}: status "verified", ale hodnota je null`);
      if (!field.source?.url) errors.push(`${path}: status "verified" bez source.url`);
      if (!field.verifiedAt) {
        errors.push(`${path}: status "verified" bez verifiedAt`);
      } else {
        const age = daysBetween(field.verifiedAt, options.today);
        if (age < 0) errors.push(`${path}: verifiedAt ${field.verifiedAt} je v budoucnosti`);
        else if (age > MAX_AGE_DAYS) warnings.push(`${path}: ověřeno před ${age} dny (> ${MAX_AGE_DAYS})`);
      }
    } else if (field.value !== null) {
      errors.push(`${path}: neověřená hodnota musí být null (žádná čísla bez zdroje)`);
    }
  };

  for (const fund of funds) {
    for (const [key, field] of Object.entries(fund)) {
      if (isSourced(field)) checkSourced(`${fund.id}.${key}`, field);
    }

    for (const relatedId of fund.relatedFundIds) {
      const related = funds.find((candidate) => candidate.id === relatedId);
      if (!related) {
        errors.push(`${fund.id}.relatedFundIds: neexistující fond "${relatedId}"`);
      } else if (!related.relatedFundIds.includes(fund.id)) {
        errors.push(`${fund.id} ↔ ${relatedId}: pár není oboustranný`);
      }
    }

    if (fund.role === "quiz-pair") {
      for (const key of REQUIRED_FOR_QUIZ) {
        if (fund[key].status === "unverified") {
          const message = `${fund.id}.${key}: neověřeno (povinné pro kvíz)`;
          (options.production ? errors : warnings).push(message);
        }
      }
      if (!listings.some((listing) => listing.fundId === fund.id)) {
        errors.push(`${fund.id}: fond v kvízu nemá žádnou kótaci`);
      }
    }
  }

  listings.forEach((listing, index) => {
    const path = `listings[${index}] ${listing.ticker}`;
    if (!ids.has(listing.fundId)) errors.push(`${path}: neexistující fond "${listing.fundId}"`);
    checkSourced(`${path}.exchange`, listing.exchange);
    checkSourced(`${path}.tradingCurrency`, listing.tradingCurrency);
  });

  return { errors, warnings };
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8"));
}

function localIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function main() {
  const production = process.env.NODE_ENV === "production";
  const { errors, warnings } = checkData(readJson("../data/etf.json"), readJson("../data/assumptions.json"), {
    production,
    today: localIsoDate(new Date()),
  });

  console.log(`check-data (${production ? "produkce" : "vývoj"})`);
  for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.log(`  ${errors.length} chyb, ${warnings.length} varování`);

  if (errors.length > 0) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
