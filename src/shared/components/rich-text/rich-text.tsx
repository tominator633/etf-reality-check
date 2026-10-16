import type { RichText as RichTextValue } from "@/shared/lib/rich-text";
import styles from "./rich-text.module.css";

// Klíčová slova jako <strong> s barvou podle významu (sémanticky zdůraznění, ne jen barva).
export function RichText({ value }: { value: RichTextValue }) {
  return (
    <>
      {value.map((segment, index) =>
        typeof segment === "string" ? (
          segment
        ) : (
          <strong key={index} className={styles[segment.tone]}>
            {segment.text}
          </strong>
        ),
      )}
    </>
  );
}
