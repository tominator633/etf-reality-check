import type { Ref } from "react";
import { copy } from "@content/copy";
import { formatDate } from "@/shared/lib/format";
import type { SourceView } from "../../lib/view-model";
import type { Answer } from "../quiz-step/quiz-step";
import styles from "./answer-reveal.module.css";

type AnswerRevealProps = { answer: Answer; kidSource: SourceView | null; headingRef?: Ref<HTMLParagraphElement> };

// První řádek podle odpovědi, pak společné vysvětlení se zdrojem k tvrzení o KID/PRIIPs.
export function AnswerReveal({ answer, kidSource, headingRef }: AnswerRevealProps) {
  return (
    <div className={styles.reveal}>
      <p ref={headingRef} tabIndex={-1} className={styles.firstLine}>
        {copy.reveal.firstLine[answer]}
      </p>
      <p>{copy.reveal.body}</p>
      {kidSource && (
        <p className={styles.source}>
          {copy.fundCard.sourcePrefix}{" "}
          <a href={kidSource.url} target="_blank" rel="noreferrer">
            {kidSource.label}
          </a>
          {kidSource.asOf && `, ${formatDate(kidSource.asOf)}`}
        </p>
      )}
    </div>
  );
}
