import type { Metadata } from "next";
import { copy } from "@content/copy";
import { CONSENT_VERSION } from "@/features/lead";
import styles from "../page.module.css";

export const metadata: Metadata = { title: copy.privacy.title, robots: { index: false } };

// Kostra stránky, na kterou odkazuje formulář (tech-spec 7.1). Obsah dodá Tom.
export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <h1>{copy.privacy.title}</h1>
      <p>{copy.privacy.body}</p>
      <p>{copy.footer.operator}</p>
      <p>
        {copy.lead.consentVersionLabel} {CONSENT_VERSION}
      </p>
    </main>
  );
}
