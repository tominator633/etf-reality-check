import { copy } from "@content/copy";
import { formatCzk, formatDate, formatTer } from "@/shared/lib/format";
import type { FundView } from "../../lib/view-model";
import styles from "./fund-card.module.css";

type FundCardProps = { fund: FundView; feeCost: number | null; lowestTer: boolean };

// Ticker, správce, ACC/DIST (u UCITS), TER se zdrojem a jedno velké číslo „přijdete o X Kč“.
export function FundCard({ fund, feeCost, lowestTer }: FundCardProps) {
  const { feeCost: feeText, unverified } = copy.fundCard;

  return (
    <article className={`${styles.card} ${fund.type === "US" ? styles.us : styles.ucits}`}>
      <p className={styles.ticker}>{fund.ticker}</p>
      <p className={styles.issuer}>
        {fund.issuer}
        {fund.type === "UCITS" && fund.distribution && ` · ${copy.fundCard.distribution[fund.distribution]}`}
      </p>
      {lowestTer && (
        <p className={styles.badge}>
          <span aria-hidden="true">✓ </span>
          {copy.fundCard.lowestTerBadge}
        </p>
      )}
      <p className={styles.ter}>
        {copy.fundCard.terLabel} {fund.ter === null ? unverified : formatTer(fund.ter)}
        {fund.terSource && (
          <span className={styles.source}>
            {" · "}
            <a
              href={fund.terSource.url}
              target="_blank"
              rel="noreferrer"
              title={fund.terSource.label}
              aria-label={`${copy.fundCard.sourcePrefix} ${fund.terSource.label}`}
            >
              {copy.fundCard.sourceLink}
            </a>
            {fund.terSource.asOf && `, ${formatDate(fund.terSource.asOf)}`}
          </span>
        )}
      </p>
      <p className={styles.fee}>
        {feeCost === null ? (
          unverified
        ) : (
          <>
            {feeText.before} <strong className={styles.amount}>{formatCzk(feeCost)}</strong> {feeText.after}
          </>
        )}
      </p>
    </article>
  );
}
