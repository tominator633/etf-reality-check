import * as m from "motion/react-m";
import { copy } from "@content/copy";
import { fadeUp, stagger } from "@/shared/lib/motion";
import type { GroupView } from "../../lib/view-model";
import { FundCard } from "../fund-card/fund-card";
import styles from "./fund-pair-grid.module.css";

type FundPairGridProps = {
  groups: GroupView[];
  feeCosts: Record<string, number | null>;
  lowestTerIds: string[];
  /** Částky naběhnou od nuly (jen při odhalení kliknutím, ne po reloadu). */
  countUp: boolean;
};

// Vlevo americké fondy, vpravo jejich UCITS dvojče. Sdílené dvojče (SPYL) je jedna karta
// přes víc řádků, nikdy dvakrát (docs/decisions.md).
export function FundPairGrid({ groups, feeCosts, lowestTerIds, countUp }: FundPairGridProps) {
  const countFrom = countUp ? 0 : undefined;
  return (
    <m.div className={styles.grid} variants={stagger(0, 0.12)}>
      <p className={styles.heading}>{copy.pairGrid.usHeading}</p>
      <p className={styles.heading}>{copy.pairGrid.ucitsHeading}</p>
      {groups.map((group) => (
        <m.div key={group.ucits.id} className={styles.group} variants={fadeUp}>
          <div className={styles.usColumn}>
            {group.us.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                feeCost={feeCosts[fund.id] ?? null}
                lowestTer={false}
                countFrom={countFrom}
              />
            ))}
          </div>
          <FundCard
            fund={group.ucits}
            feeCost={feeCosts[group.ucits.id] ?? null}
            lowestTer={lowestTerIds.includes(group.ucits.id)}
            countFrom={countFrom}
          />
        </m.div>
      ))}
    </m.div>
  );
}
