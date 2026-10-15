import type { Dataset, Fund } from "@data/schema";
import { buildPairs, groupByUcits, lowestTerIds, type PairedFund } from "./pairs";

// Data pro kvíz připravená na serveru: jen to, co UI zobrazuje (do prohlížeče nejde celý etf.json).

export type SourceView = { label: string; url: string; asOf: string | null };

export type FundView = {
  id: string;
  ticker: string;
  issuer: string;
  type: Fund["type"];
  distribution: "ACC" | "DIST" | null;
  ter: number | null; // v procentech (0.03 = 0,03 %)
  terSource: SourceView | null;
};

export type GroupView = { ucits: FundView; us: FundView[] };

export type RealityCheckView = {
  groups: GroupView[];
  /** Americké tickery v pořadí párů (čipy v hero). */
  usTickers: string[];
  /** UCITS fondy s odznakem „nejnižší TER“. */
  lowestTerIds: string[];
  /** Zdroj k tvrzení, že americká ETF drobný investor v EU obvykle nekoupí (czRetailAvailable). */
  kidSource: SourceView | null;
};

function toSource(field: Fund["ter"] | Fund["czRetailAvailable"]): SourceView | null {
  if (field.value === null || !field.sourceUrl || !field.sourceLabel) return null;
  return { label: field.sourceLabel, url: field.sourceUrl, asOf: field.asOf };
}

function toFundView({ fund, ticker }: PairedFund): FundView {
  return {
    id: fund.id,
    ticker,
    issuer: fund.issuer,
    type: fund.type,
    distribution: fund.distribution.value,
    ter: fund.ter.value,
    terSource: toSource(fund.ter),
  };
}

export function buildRealityCheckView(dataset: Dataset): RealityCheckView {
  const pairs = buildPairs(dataset);
  const groups = groupByUcits(pairs);
  const firstUs = pairs[0]?.us.fund;

  return {
    groups: groups.map((group) => ({ ucits: toFundView(group.ucits), us: group.us.map(toFundView) })),
    usTickers: pairs.map((pair) => pair.us.ticker),
    lowestTerIds: lowestTerIds(groups.map((group) => group.ucits.fund)),
    kidSource: firstUs ? toSource(firstUs.czRetailAvailable) : null,
  };
}

/** Všechny fondy kvízu, každý jednou (vstup pro projectAll a souhrnnou větu). */
export function allFunds(view: RealityCheckView): FundView[] {
  return view.groups.flatMap((group) => [...group.us, group.ucits]);
}
