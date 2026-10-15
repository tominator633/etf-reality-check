import { readStored, writeStored } from "./browser-storage";

// Odpověď kvízu (sessionStorage). Používá ji kvíz (obnovení po reloadu) i formulář (tech-spec 7.2
// `quiz.answer`) – features spolu nesdílí stav (tech-spec 3.1). Bez úložiště se odpověď neobnoví
// a lead se odešle bez ní.

const KEY = "rc_quiz_answer";
export type QuizAnswer = "ano" | "ne";

export function storeQuizAnswer(answer: QuizAnswer): void {
  writeStored("session", KEY, answer);
}

export function readQuizAnswer(): QuizAnswer | null {
  const value = readStored("session", KEY);
  return value === "ano" || value === "ne" ? value : null;
}
