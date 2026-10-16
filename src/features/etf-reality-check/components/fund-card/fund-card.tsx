import * as m from "motion/react-m";
import { useLayoutEffect, useRef } from "react";
import { copy } from "@content/copy";
import { formatCzk, formatDate, formatTer } from "@/shared/lib/format";
import { useAnimatedNumber } from "@/shared/lib/use-animated-number";
import type { FundView } from "../../lib/view-model";
import styles from "./fund-card.module.css";

type FundCardProps =
  | {
      variant?: "full";
      fund: FundView;
      feeCost: number | null;
      lowestTer: boolean;
      /** Podíl ztráty na poplatcích vůči nejdražšímu fondu (0–1) – délka proužku; null = bez proužku. */
      feeShare?: number | null;
      /** Počáteční hodnota počítadla částky (0 = načíst od nuly při odhalení); bez = rovnou výsledek. */
      countFrom?: number;
    }
  | { variant: "compact"; fund: FundView };

// Plná karta: odznak (US „V ČR obvykle nekoupíte“ / UCITS „nejnižší TER“), ticker, správce, ACC/DIST
// (u UCITS), TER se zdrojem a jedno velké číslo „přijdete o X Kč“ (ztráta = červeně).
// Nejvýhodnější evropské dvojče (nejnižší TER) je zvýrazněné zeleně.
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

  const { feeCost, lowestTer, countFrom, feeShare = null } = props;

  return (
    <article className={`${styles.card} ${typeClass} ${lowestTer ? styles.best : ""}`}>
      {fund.type === "US" && <p className={`${styles.badge} ${styles.badgeWarn}`}>{copy.fundCard.usBadge}</p>}
      {lowestTer && (
        <m.p
          className={styles.badge}
          initial={countFrom === undefined ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 18 }}
        >
          <span aria-hidden="true">✓ </span>
          {copy.fundCard.lowestTerBadge}
        </m.p>
      )}
      <p className={styles.ticker}>{fund.ticker}</p>
      <p className={styles.issuer}>
        {fund.issuer}
        {fund.type === "UCITS" && fund.distribution && ` · ${copy.fundCard.distribution[fund.distribution]}`}
      </p>
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
            {feeText.before} <FeeAmount value={feeCost} from={countFrom} /> {feeText.after}
            {feeShare !== null && <FeeBar share={feeShare} growIn={countFrom !== undefined} />}
          </>
        )}
      </p>
    </article>
  );
}

/** Částka „přijdete o …“: při odhalení naběhne od nuly, při posunu jezdce plynule přejde. */
function FeeAmount({ value, from }: { value: number; from?: number }) {
  const shown = useAnimatedNumber(value, { from: from ?? value });
  return <strong className={styles.amount}>{formatCzk(shown)}</strong>;
}

/**
 * Proužek ztráty na poplatcích (délka = podíl vůči nejdražšímu fondu). Délka jde přes CSS proměnnou
 * nastavenou mimo JSX (bez inline stylu). Při odhalení naroste od nuly, po obnovení je hned celý.
 */
function FeeBar({ share, growIn }: { share: number; growIn: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const apply = () => element.style.setProperty("--fee-share", share.toFixed(4));
    if (first.current && growIn) {
      first.current = false;
      const frame = requestAnimationFrame(apply); // až po prvním vykreslení, ať přechod začne od nuly
      return () => cancelAnimationFrame(frame);
    }
    first.current = false;
    apply();
  }, [share, growIn]);

  return (
    <span ref={bar} className={styles.bar} aria-hidden="true">
      <span className={styles.barFill} />
    </span>
  );
}
