import styles from "./hero.module.css";

type HeroProps = { h1: string; subtitle: string };

// H1 + podnadpis podle varianty reklamy (server-rendered kvůli LCP). Malé karty fondů pod ním
// patří do kontejneru kvízu, protože po odpovědi mizí.
export function Hero({ h1, subtitle }: HeroProps) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{h1}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
