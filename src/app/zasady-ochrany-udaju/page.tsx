import type { Metadata } from "next";
import { copy } from "@content/copy";
import { CONSENT_VERSION } from "@/features/lead";
import styles from "../page.module.css";

export const metadata: Metadata = { title: copy.privacy.title, robots: { index: false } };

// Zásady zpracování osobních údajů (tech-spec 7.1). Fakta o tom, co web dělá, jsou vyplněná;
// správce, účely, právní základ a doba uložení jsou placeholdery pro Toma.
export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <h1>{copy.privacy.title}</h1>
      {copy.privacy.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      <p>
        {copy.lead.consentVersionLabel} {CONSENT_VERSION}
      </p>
    </main>
  );
}
