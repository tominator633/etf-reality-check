import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assumptionsSchema, datasetSchema } from "../data/schema.ts";

// Kontrola dat (tech-spec 4.4, upraveno pro tvar dat od Toma). Běží jako `prebuild` a `npm run check:data`.

export type CheckResult = { errors: string[]; warnings: string[] };
export type CheckOptions = { production: boolean; today: string };

const REQUIRED_FOR_QUIZ = ["ter", "isin", "index", "distribution", "czRetailAvailable"] as const;
const MAX_AGE_DAYS = 90;
// TER je v procentech (0.03 = 0,03 %). Hodnota pod 0,01 % nejspíš omylem zůstala jako zlomek (0.0003).
const MIN_PLAUSIBLE_TER_PERCENT = 0.01;

type SourcedLike = {
  value: unknown;
  sourceUrl: string | null;
  sourceLabel: string | null;
  asOf: string | null;
  verifiedAt?: string;
};

function isSourced(value: unknown): value is SourcedLike {
  return typeof value === "object" && value !== null && "value" in value && "sourceUrl" in value;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/** Kontrolní číslice ISIN podle ISO 6166 (Luhn nad číslicemi, písmena A = 10 … Z = 35). */
export function isValidIsin(isin: string): boolean {
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) return false;
  const digits = [...isin].map((char) => (/[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char)).join("");
  let sum = 0;
  [...digits].reverse().forEach((char, index) => {
    let digit = Number(char);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  });
  return sum % 10 === 0;
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

  const { funds, verifiedAt: datasetVerifiedAt } = dataset.data;
  const ids = new Set(funds.map((fund) => fund.id));
  if (ids.size !== funds.length) errors.push("etf.json: duplicitní id fondu");

  const checkVerifiedAt = (path: string, date: string) => {
    const age = daysBetween(date, options.today);
    if (age < 0) errors.push(`${path}: datum ověření ${date} je v budoucnosti`);
    else if (age > MAX_AGE_DAYS) warnings.push(`${path}: ověřeno před ${age} dny (> ${MAX_AGE_DAYS})`);
  };
  checkVerifiedAt("etf.json verifiedAt", datasetVerifiedAt);

  const checkSourced = (path: string, field: SourcedLike) => {
    if (field.value === null) return;
    if (!field.sourceUrl) errors.push(`${path}: hodnota bez sourceUrl`);
    if (!field.sourceLabel) errors.push(`${path}: hodnota bez sourceLabel`);
    if (field.asOf && daysBetween(field.asOf, options.today) < 0) {
      errors.push(`${path}: asOf ${field.asOf} je v budoucnosti`);
    }
    if (field.verifiedAt) checkVerifiedAt(path, field.verifiedAt);
  };

  for (const fund of funds) {
    for (const [key, field] of Object.entries(fund)) {
      if (isSourced(field)) checkSourced(`${fund.id}.${key}`, field);
    }
    for (const [key, field] of Object.entries(fund.listing)) {
      checkSourced(`${fund.id}.listing.${key}`, field);
    }

    if (fund.listing.ticker.value === null) errors.push(`${fund.id}.listing.ticker: chybí ticker (UI ho zobrazuje)`);
    if (fund.isin.value !== null && !isValidIsin(fund.isin.value)) {
      errors.push(`${fund.id}.isin: ${fund.isin.value} nemá platnou kontrolní číslici (ISO 6166)`);
    }
    if (fund.ter.value !== null && fund.ter.value > 0 && fund.ter.value < MIN_PLAUSIBLE_TER_PERCENT) {
      errors.push(`${fund.id}.ter: ${fund.ter.value} vypadá jako zlomek, TER se zapisuje v procentech (0.03 = 0,03 %)`);
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
      if (fund.type === "US") {
        // Jeden UCITS fond smí být dvojčetem víc amerických fondů, americký fond má ale dvojče právě jedno.
        const twins = funds.filter(
          (candidate) =>
            candidate.role === "quiz-pair" && candidate.type === "UCITS" && fund.relatedFundIds.includes(candidate.id),
        );
        if (twins.length !== 1) {
          errors.push(`${fund.id}: americký fond v kvízu musí mít právě jedno UCITS dvojče (má ${twins.length})`);
        }
      }

      // Nadpisy sloupců tvrdí „USA · v ČR obvykle nekoupíte“ a „Evropské dvojče · koupíte“ – data je musí doložit.
      const expectedCz = fund.type === "UCITS";
      if (fund.czRetailAvailable.value !== null && fund.czRetailAvailable.value !== expectedCz) {
        errors.push(
          `${fund.id}.czRetailAvailable: ${fund.czRetailAvailable.value} odporuje nadpisu sloupce pro ${fund.type} fondy`,
        );
      }

      for (const key of REQUIRED_FOR_QUIZ) {
        if (fund[key].value === null) {
          const message = `${fund.id}.${key}: neověřeno (povinné pro kvíz)`;
          (options.production ? errors : warnings).push(message);
        }
      }
    }
  }

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
