import { copy } from "@content/copy";
import { formatDate } from "@/shared/lib/format";
import type { FundView } from "../../lib/view-model";
import { FundCard } from "../fund-card/fund-card";
import styles from "./us-fund-preview.module.css";

type UsFundPreviewProps = { funds: FundView[]; verifiedAt: string };

// Malé karty amerických fondů pod nadpisem (stejné fondy jako levý sloupec srovnávače).
// Kontejner je po odpovědi skryje, fondy se pak ukážou ve velkých kartách.
export function UsFundPreview({ funds, verifiedAt }: UsFundPreviewProps) {
  return (
    <div className={styles.preview}>
      <ul className={styles.cards}>
        {funds.map((fund) => (
          <li key={fund.id}>
            <FundCard variant="compact" fund={fund} />
          </li>
        ))}
      </ul>
      <p className={styles.source}>{copy.preview.terSource(formatDate(verifiedAt))}</p>
    </div>
  );
}
