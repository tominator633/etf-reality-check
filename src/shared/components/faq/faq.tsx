import { copy } from "@content/copy";
import { ContentIcon } from "../icons/content-icon";
import styles from "./faq.module.css";

// Pojmy a FAQ (brief kap. 3, sekce 5): nativní <details>, bez JavaScriptu.
export function Faq() {
  return (
    <section className={styles.faq} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className={styles.heading}>
        {copy.faq.heading}
      </h2>
      {copy.faq.items.map((item) => (
        <details key={item.question} className={styles.item}>
          <summary className={styles.question}>
            <ContentIcon name={item.icon} className={styles.icon} />
            <span className={styles.questionText}>{item.question}</span>
          </summary>
          <p className={styles.answer}>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}
