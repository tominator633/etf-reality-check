import type { Dataset, Fund } from "@data/schema";

// Páry NYSE ↔ UCITS z etf.json (přes relatedFundIds). Pořadí párů = pořadí
// amerických fondů v etf.json (VOO, IVV, SPYM, SPY, jako v reklamě A).
// Každý americký fond má právě jedno UCITS dvojče, jeden UCITS fond ale může být
// dvojčetem víc amerických fondů (SPYM i SPY → SPYL). Seznamy UCITS fondů proto
// vždy ber z `groupByUcits` / `uniqueUcitsFunds`, ne z `pairs.map(p => p.ucits)`.

export type PairedFund = { fund: Fund; ticker: string };
export type FundPair = { us: PairedFund; ucits: PairedFund };
export type TwinGroup = { ucits: PairedFund; us: PairedFund[] };

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
      const twins = quizFunds.filter((fund) => fund.regime === "UCITS" && us.relatedFundIds.includes(fund.id));
      if (twins.length === 0) throw new Error(`Fond ${us.id} nemá evropské dvojče`);
      if (twins.length > 1) throw new Error(`Fond ${us.id} má víc evropských dvojčat`);
      const [ucits] = twins;
      if (!ucits.relatedFundIds.includes(us.id)) throw new Error(`Pár ${us.id} ↔ ${ucits.id} není oboustranný`);
      return { us: withTicker(dataset, us), ucits: withTicker(dataset, ucits) };
    });
}

/** Páry seskupené podle UCITS fondu: každý UCITS fond jednou, s americkými fondy v pořadí párů. */
export function groupByUcits(pairs: FundPair[]): TwinGroup[] {
  const groups = new Map<string, TwinGroup>();
  for (const { us, ucits } of pairs) {
    const group = groups.get(ucits.fund.id);
    if (group) group.us.push(us);
    else groups.set(ucits.fund.id, { ucits, us: [us] });
  }
  return [...groups.values()];
}

/** UCITS fondy bez duplicit, v pořadí prvního výskytu v párech. */
export function uniqueUcitsFunds(pairs: FundPair[]): PairedFund[] {
  return groupByUcits(pairs).map((group) => group.ucits);
}

/** Id fondů s nejnižším ověřeným TER. Při shodě vrací všechny shodné (každý jednou); neověřené TER se nepočítá. */
export function lowestTerIds(funds: Fund[]): string[] {
  const verified = funds.filter((fund) => fund.ter.status === "verified" && fund.ter.value !== null);
  if (verified.length === 0) return [];
  const lowest = Math.min(...verified.map((fund) => fund.ter.value as number));
  return [...new Set(verified.filter((fund) => fund.ter.value === lowest).map((fund) => fund.id))];
}
