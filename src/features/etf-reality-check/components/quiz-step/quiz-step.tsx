import { copy } from "@content/copy";
import styles from "./quiz-step.module.css";

export type Answer = "ano" | "ne";
const ANSWERS: Answer[] = ["ano", "ne"];

/** Správná odpověď: americká ETF drobný investor v ČR obvykle nekoupí (brief kap. 4, czRetailAvailable v datech). */
export const CORRECT_ANSWER: Answer = "ne";

type QuizStepProps = { answer: Answer | null; onAnswer: (answer: Answer) => void };

// Otázka + ANO/NE. Po odpovědi tlačítka zůstanou zablokovaná a zvolené se obarví:
// zeleně správně (NE), červeně špatně (ANO), vždy i se symbolem a textem pro čtečky (tech-spec 11.2).
export function QuizStep({ answer, onAnswer }: QuizStepProps) {
  return (
    <fieldset className={styles.quiz}>
      <legend className={styles.question}>{copy.quiz.question}</legend>
      <div className={styles.buttons}>
        {ANSWERS.map((option) => {
          const chosen = answer === option;
          const result = option === CORRECT_ANSWER ? copy.quiz.result.correct : copy.quiz.result.wrong;
          const resultClass = option === CORRECT_ANSWER ? styles.correct : styles.wrong;

          return (
            <button
              key={option}
              type="button"
              className={`${styles.button} ${chosen ? resultClass : ""}`}
              aria-pressed={chosen}
              disabled={answer !== null}
              onClick={() => onAnswer(option)}
            >
              {chosen && <span aria-hidden="true">{result.symbol} </span>}
              {copy.quiz.answers[option]}
              {chosen && <span className="visually-hidden"> – {result.label}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
