import * as m from "motion/react-m";
import { copy } from "@content/copy";
import { press } from "@/shared/lib/motion";
import styles from "./quiz-step.module.css";

export type Answer = "ano" | "ne";
const ANSWERS: Answer[] = ["ano", "ne"];

/** Správná odpověď: americká ETF drobný investor v ČR obvykle nekoupí (brief kap. 4, czRetailAvailable v datech). */
export const CORRECT_ANSWER: Answer = "ne";

type QuizStepProps = {
  answer: Answer | null;
  onAnswer: (answer: Answer) => void;
  /** Přehrát reakci na odpověď (při kliknutí ano, po obnovení z úložiště ne). */
  animateResult: boolean;
};

// Reakce zvoleného tlačítka: správně = krátké „poskočení“, špatně = zavrtění.
const RESULT_MOTION = {
  correct: { scale: [1, 1.08, 1], transition: { duration: 0.35 } },
  wrong: { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } },
};

// Otázka + ANO/NE. Po odpovědi tlačítka zůstanou zablokovaná a zvolené se obarví:
// zeleně správně (NE), červeně špatně (ANO), vždy i se symbolem a textem pro čtečky (tech-spec 11.2).
export function QuizStep({ answer, onAnswer, animateResult }: QuizStepProps) {
  return (
    <fieldset className={styles.quiz}>
      <legend className={styles.question}>{copy.quiz.question}</legend>
      <div className={styles.buttons}>
        {ANSWERS.map((option) => {
          const chosen = answer === option;
          const result = option === CORRECT_ANSWER ? copy.quiz.result.correct : copy.quiz.result.wrong;
          const resultClass = option === CORRECT_ANSWER ? styles.correct : styles.wrong;
          const resultMotion = option === CORRECT_ANSWER ? RESULT_MOTION.correct : RESULT_MOTION.wrong;

          return (
            <m.button
              key={option}
              type="button"
              className={`${styles.button} ${chosen ? resultClass : ""}`}
              aria-pressed={chosen}
              disabled={answer !== null}
              onClick={() => onAnswer(option)}
              {...(answer === null ? press : {})}
              animate={chosen && animateResult ? resultMotion : undefined}
            >
              {chosen && <span aria-hidden="true">{result.symbol} </span>}
              {copy.quiz.answers[option]}
              {chosen && <span className="visually-hidden"> – {result.label}</span>}
            </m.button>
          );
        })}
      </div>
    </fieldset>
  );
}
