import type { HeroWord } from "@content/hero-variants";
import { RichText } from "@/shared/components/rich-text/rich-text";
import type { RichText as RichTextValue } from "@/shared/lib/rich-text";
import styles from "./hero.module.css";

type HeroProps = { h1: string; h1Words?: HeroWord[][]; subtitle: RichTextValue[] };

const WORD_TONES = [styles.word1, styles.word2, styles.word3, styles.word4];
const LINE_STYLES = [styles.lead, styles.middle, styles.punch];

// H1 + podnadpis podle varianty reklamy (server-rendered, bez animace kvůli LCP).
// Varianta A: nadpis na dva řádky, každé slovo jinou barvou, velikosti „NENÍ etf / jako ETF“
// (asymetrie = rozdíl v poplatcích u fondů na stejný index).
export function Hero({ h1, h1Words, subtitle }: HeroProps) {
  let wordIndex = 0;

  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>
        {h1Words
          ? h1Words.map((line, lineIndex) => (
              <span key={lineIndex} className={styles.line}>
                {line.map((word) => {
                  const tone = WORD_TONES[wordIndex++ % WORD_TONES.length];
                  return (
                    <span key={`${lineIndex}-${word.text}`} className={`${styles.word} ${styles[word.size]} ${tone}`}>
                      {word.text}{" "}
                    </span>
                  );
                })}
              </span>
            ))
          : h1}
      </h1>
      <p className={styles.subtitle}>
        {subtitle.map((line, index) => (
          <span key={index} className={LINE_STYLES[index] ?? styles.lead}>
            <RichText value={line} />{" "}
          </span>
        ))}
      </p>
    </header>
  );
}
