import { copy } from "@content/copy";
import styles from "./quiz-step.module.css";

export type Answer = "ano" | "ne";
const ANSWERS: Answer[] = ["ano", "ne"];

type QuizStepProps = { answer: Answer | null; onAnswer: (answer: Answer) => void };

// Otázka + ANO/NE. Po odpovědi tlačítka zůstanou zablokovaná se zvýrazněnou volbou (tech-spec 6.1).
export function QuizStep({ answer, onAnswer }: QuizStepProps) {
  return (
    <fieldset className={styles.quiz}>
      <legend className={styles.question}>{copy.quiz.question}</legend>
      <div className={styles.buttons}>
        {ANSWERS.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.button}
            aria-pressed={answer === option}
            disabled={answer !== null}
            onClick={() => onAnswer(option)}
          >
            {copy.quiz.answers[option]}
          </button>
        ))}
      </div>
      <p className={styles.hint}>{copy.quiz.hint}</p>
    </fieldset>
  );
}
