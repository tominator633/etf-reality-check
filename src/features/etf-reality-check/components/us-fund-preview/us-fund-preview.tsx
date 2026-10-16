import { copy } from "@content/copy";
import { formatDate } from "@/shared/lib/format";
import type { GroupView } from "../../lib/view-model";
import { FundCard } from "../fund-card/fund-card";
import styles from "./us-fund-preview.module.css";

type UsFundPreviewProps = { groups: GroupView[]; verifiedAt: string };

// Stejné tóny dvojic jako ve srovnávači (pozadí karty a tmavší ticker), ať karty i reklama sedí.
const PAIR_TONES = [styles.pair1, styles.pair2, styles.pair3];

// Malé karty amerických fondů pod nadpisem (stejné fondy jako levý sloupec srovnávače).
// Kontejner je po odpovědi skryje, fondy se pak ukážou ve velkých kartách.
export function UsFundPreview({ groups, verifiedAt }: UsFundPreviewProps) {
  return (
    <div className={styles.preview}>
      <ul className={styles.cards}>
        {groups.flatMap((group, index) =>
          group.us.map((fund) => (
            <li key={fund.id} className={PAIR_TONES[index % PAIR_TONES.length]}>
              <FundCard variant="compact" fund={fund} />
            </li>
          )),
        )}
      </ul>
      <p className={styles.source}>{copy.preview.terSource(formatDate(verifiedAt))}</p>
    </div>
  );
}
