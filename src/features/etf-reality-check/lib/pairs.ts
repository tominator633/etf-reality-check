import type { Dataset, Fund } from "@data/schema";

// Páry NYSE ↔ UCITS z etf.json (přes relatedFundIds). Pořadí párů = pořadí
// amerických fondů v etf.json (VOO, IVV, SPYM, SPY, jako v reklamě A).

export type PairedFund = { fund: Fund; ticker: string };
export type FundPair = { us: PairedFund; ucits: PairedFund };

function withTicker(dataset: Dataset, fund: Fund): PairedFund {
  const listing = dataset.listings.find((candidate) => candidate.fundId === fund.id);
  if (!listing) throw new Error(`Fond ${fund.id} nemá kótaci`);
  return { fund, ticker: listing.ticker };
}

export function buildPairs(dataset: Dataset): FundPair[] {
  const quizFunds = dataset.funds.filter((fund) => fund.role === "quiz-pair");

  return quizFunds
    .filter((fund) => fund.regime === "US-registered")
    .map((us) => {
      const ucits = quizFunds.find((fund) => fund.regime === "UCITS" && us.relatedFundIds.includes(fund.id));
      if (!ucits) throw new Error(`Fond ${us.id} nemá evropské dvojče`);
      if (!ucits.relatedFundIds.includes(us.id)) throw new Error(`Pár ${us.id} ↔ ${ucits.id} není oboustranný`);
      return { us: withTicker(dataset, us), ucits: withTicker(dataset, ucits) };
    });
}

/** Id fondů s nejnižším ověřeným TER. Při shodě vrací všechny shodné; neověřené TER se nepočítá. */
export function lowestTerIds(funds: Fund[]): string[] {
  const verified = funds.filter((fund) => fund.ter.status === "verified" && fund.ter.value !== null);
  if (verified.length === 0) return [];
  const lowest = Math.min(...verified.map((fund) => fund.ter.value as number));
  return verified.filter((fund) => fund.ter.value === lowest).map((fund) => fund.id);
}
