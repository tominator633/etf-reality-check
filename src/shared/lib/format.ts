// České formáty čísel a dat (tech-spec 11.3). Mezery jsou nedělitelné (U+00A0).

const NBSP = " ";

const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const ter = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 6 });
const rate = new Intl.NumberFormat("cs-CZ", { style: "percent", maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("cs-CZ", { timeZone: "UTC" });
const plural = new Intl.PluralRules("cs-CZ");

/** Částka v celých Kč: `4 557 Kč`. Zaokrouhluje až tady (tech-spec 5.1). */
export function formatCzk(value: number): string {
  return czk.format(value);
}

/** Celé číslo s oddělovačem tisíců: `1 360 316`. */
export function formatNumber(value: number): string {
  return number.format(value);
}

/** TER zadané v procentech (0.0945 = 0,0945 %), bez zaokrouhlení: `0,0945 %`. */
export function formatTer(percent: number): string {
  return `${ter.format(percent)}${NBSP}%`;
}

/** Roční sazba jako desetinné číslo (0.065 = 6,5 %): `6,5 %`. */
export function formatRate(decimal: number): string {
  return rate.format(decimal);
}

/** Počet let se správným tvarem: `1 rok`, `2 roky`, `20 let`. */
export function formatYears(years: number): string {
  const word = { one: "rok", few: "roky" }[plural.select(years) as "one" | "few"] ?? "let";
  return `${number.format(years)}${NBSP}${word}`;
}

/** ISO datum (`2026-10-15`) jako `15. 10. 2026`. */
export function formatDate(isoDate: string): string {
  return date.format(new Date(isoDate)).replace(/ /g, NBSP);
}
