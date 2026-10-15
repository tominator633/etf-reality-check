import { copy } from "@content/copy";
import type { GroupView } from "../../lib/view-model";
import { FundCard } from "../fund-card/fund-card";
import styles from "./fund-pair-grid.module.css";

type FundPairGridProps = { groups: GroupView[]; feeCosts: Record<string, number | null>; lowestTerIds: string[] };

// Vlevo americké fondy, vpravo jejich UCITS dvojče. Sdílené dvojče (SPYL) je jedna karta
// přes víc řádků, nikdy dvakrát (docs/decisions.md).
export function FundPairGrid({ groups, feeCosts, lowestTerIds }: FundPairGridProps) {
  return (
    <div className={styles.grid}>
      <p className={styles.heading}>{copy.pairGrid.usHeading}</p>
      <p className={styles.heading}>{copy.pairGrid.ucitsHeading}</p>
      {groups.map((group) => (
        <div key={group.ucits.id} className={styles.group}>
          <div className={styles.usColumn}>
            {group.us.map((fund) => (
              <FundCard key={fund.id} fund={fund} feeCost={feeCosts[fund.id] ?? null} lowestTer={false} />
            ))}
          </div>
          <FundCard
            fund={group.ucits}
            feeCost={feeCosts[group.ucits.id] ?? null}
            lowestTer={lowestTerIds.includes(group.ucits.id)}
          />
        </div>
      ))}
    </div>
  );
}
