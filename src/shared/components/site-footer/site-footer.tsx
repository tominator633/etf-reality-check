import { copy } from "@content/copy";
import styles from "./site-footer.module.css";

type SiteFooterProps = { privacyHref: string };

// Zdroje, metodika, upozornění a patička (brief kap. 3, sekce 6).
export function SiteFooter({ privacyHref }: SiteFooterProps) {
  const { sources, footer } = copy;
  return (
    <footer className={styles.footer}>
      <section className={styles.sources} aria-labelledby="sources-heading">
        <h2 id="sources-heading" className={styles.heading}>
          {sources.heading}
        </h2>
        <p>{sources.data}</p>
        <p>{sources.methodology}</p>
        <p className={styles.disclaimer}>{sources.disclaimer}</p>
      </section>
      <div className={styles.legal}>
        <p>{footer.operator}</p>
        <p>{footer.contact}</p>
        <p>
          <a href={privacyHref}>{footer.privacyLink}</a>
        </p>
      </div>
    </footer>
  );
}
