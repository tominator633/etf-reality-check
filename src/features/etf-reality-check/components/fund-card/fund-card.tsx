import { copy } from "@content/copy";
import { formatCzk, formatDate, formatTer } from "@/shared/lib/format";
import type { FundView } from "../../lib/view-model";
import styles from "./fund-card.module.css";

type FundCardProps =
  | { variant?: "full"; fund: FundView; feeCost: number | null; lowestTer: boolean }
  | { variant: "compact"; fund: FundView };

// Plná karta: ticker, správce, ACC/DIST (u UCITS), TER se zdrojem a jedno velké číslo „přijdete o X Kč“.
// Malá karta (nad otázkou, před odpovědí): jen ticker a TER; zdroj TER je v řádku pod řadou karet.
export function FundCard(props: FundCardProps) {
  const { fund } = props;
  const { feeCost: feeText, unverified } = copy.fundCard;
  const typeClass = fund.type === "US" ? styles.us : styles.ucits;
  const ter = fund.ter === null ? unverified : formatTer(fund.ter);

  if (props.variant === "compact") {
    return (
      <article className={`${styles.card} ${styles.compact} ${typeClass}`}>
        <p className={styles.ticker}>{fund.ticker}</p>
        <p className={styles.ter}>
          {copy.fundCard.terLabel} <span className={styles.compactValue}>{ter}</span>
        </p>
      </article>
    );
  }

  const { feeCost, lowestTer } = props;

  return (
    <article className={`${styles.card} ${typeClass}`}>
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
        {copy.fundCard.terLabel} {ter}
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
