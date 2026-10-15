import styles from "./hero.module.css";

type HeroProps = { h1: string; subtitle: string; tickers: string[] };

// H1 + podnadpis podle varianty reklamy + čipy tickerů (server-rendered kvůli LCP).
export function Hero({ h1, subtitle, tickers }: HeroProps) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{h1}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <ul className={styles.chips}>
        {tickers.map((ticker) => (
          <li key={ticker} className={styles.chip}>
            {ticker}
          </li>
        ))}
      </ul>
    </header>
  );
}
