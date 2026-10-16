import * as m from "motion/react-m";
import { copy } from "@content/copy";
import { fadeUp, stagger } from "@/shared/lib/motion";
import type { GroupView } from "../../lib/view-model";
import { FundCard } from "../fund-card/fund-card";
import styles from "./fund-pair-grid.module.css";

type FundPairGridProps = {
  groups: GroupView[];
  feeCosts: Record<string, number | null>;
  /** Nejvyšší ztráta na poplatcích ze všech fondů – měřítko proužků na kartách. */
  maxFeeCost: number | null;
  lowestTerIds: string[];
  /** Částky naběhnou od nuly (jen při odhalení kliknutím, ne po reloadu). */
  countUp: boolean;
};

// Vlevo americké fondy, vpravo jejich UCITS dvojče. Sdílené dvojče (SPYL) je jedna karta
// přes víc řádků, nikdy dvakrát (docs/decisions.md).
// Každá dvojice má vlastní světlé pozadí (obě karty), aby bylo vidět, co k čemu patří.
const PAIR_TONES = [styles.pair1, styles.pair2, styles.pair3];

export function FundPairGrid({ groups, feeCosts, maxFeeCost, lowestTerIds, countUp }: FundPairGridProps) {
  const countFrom = countUp ? 0 : undefined;
  const share = (id: string) => {
    const cost = feeCosts[id] ?? null;
    return cost === null || !maxFeeCost ? null : cost / maxFeeCost;
  };
  return (
    <m.div className={styles.grid} variants={stagger(0, 0.12)}>
      <p className={styles.heading}>{copy.pairGrid.usHeading}</p>
      <p className={styles.heading}>{copy.pairGrid.ucitsHeading}</p>
      {groups.map((group, index) => (
        <m.div
          key={group.ucits.id}
          className={`${styles.group} ${PAIR_TONES[index % PAIR_TONES.length]}`}
          variants={fadeUp}
        >
          <div className={styles.usColumn}>
            {group.us.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                feeCost={feeCosts[fund.id] ?? null}
                feeShare={share(fund.id)}
                lowestTer={false}
                countFrom={countFrom}
              />
            ))}
          </div>
          <div className={styles.ucitsCell}>
            <FundCard
              fund={group.ucits}
              feeCost={feeCosts[group.ucits.id] ?? null}
              feeShare={share(group.ucits.id)}
              lowestTer={lowestTerIds.includes(group.ucits.id)}
              countFrom={countFrom}
            />
          </div>
        </m.div>
      ))}
    </m.div>
  );
}
