import assumptions from "@data/assumptions.json";

// Modelový výpočet podle tech-spec 5.1–5.2. Měsíční vklad na konci měsíce,
// roční sazba převedená na efektivní měsíční, TER odečten od výnosu.
// Jednotky: výnos jako desetinné číslo (0.06 = 6 %), TER v procentech (0.03 = 0,03 %).

export type ProjectionInput = { monthly: number; years: number; grossReturn: number };

export type Projection = {
  grossValue: number;
  invested: number;
  perFund: { id: string; feeCost: number | null }[];
};

/** Efektivní měsíční sazba: i = (1 + r)^(1/12) − 1. */
export function monthlyRate(annualRate: number): number {
  return (1 + annualRate) ** (1 / 12) - 1;
}

/** Budoucí hodnota pravidelných měsíčních vkladů: FV = M × ((1 + i)^n − 1) / i, pro i = 0 je FV = M × n. */
export function futureValue(monthly: number, years: number, annualRate: number): number {
  const n = years * 12;
  const i = monthlyRate(annualRate);
  if (Math.abs(i) < 1e-12) return monthly * n;
  return (monthly * ((1 + i) ** n - 1)) / i;
}

/** O kolik modelově přijdete kvůli TER: FV(g) − FV(g − TER). Obsahuje i ušlé zhodnocení. */
export function feeCost(input: ProjectionInput, ter: number): number {
  const { monthly, years, grossReturn } = input;
  return futureValue(monthly, years, grossReturn) - futureValue(monthly, years, grossReturn - ter / 100);
}

export function projectAll(input: ProjectionInput, funds: { id: string; ter: number | null }[]): Projection {
  return {
    grossValue: futureValue(input.monthly, input.years, input.grossReturn),
    invested: input.monthly * input.years * 12,
    perFund: funds.map(({ id, ter }) => ({ id, feeCost: ter === null ? null : feeCost(input, ter) })),
  };
}

type Range = { default: number; min: number; max: number };

function clamp(raw: unknown, range: Range): number {
  const value = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
  if (!Number.isFinite(value)) return range.default;
  return Math.min(range.max, Math.max(range.min, value));
}

/** Ořízne vstup na rozsahy z assumptions.json; neplatná hodnota (NaN, text) → výchozí. */
export function clampInput(raw: Partial<Record<keyof ProjectionInput, unknown>>): ProjectionInput {
  return {
    monthly: clamp(raw.monthly, assumptions.monthly),
    years: clamp(raw.years, assumptions.years),
    grossReturn: clamp(raw.grossReturn, assumptions.grossAnnualReturn),
  };
}

export const defaultInput: ProjectionInput = clampInput({});
