import styles from "./hero.module.css";

type HeroProps = { h1: string; subtitle: string[] };

// Velikost řádků podnadpisu stoupá k pointě: první uvede, druhý navazuje, třetí je pointa.
const LINE_STYLES = [styles.lead, styles.middle, styles.punch];

// H1 + podnadpis podle varianty reklamy (server-rendered kvůli LCP). Malé karty fondů pod ním
// patří do kontejneru kvízu, protože po odpovědi mizí.
export function Hero({ h1, subtitle }: HeroProps) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{h1}</h1>
      <p className={styles.subtitle}>
        {subtitle.map((line, index) => (
          <span key={line} className={LINE_STYLES[index] ?? styles.lead}>
            {line}
          </span>
        ))}
      </p>
    </header>
  );
}
