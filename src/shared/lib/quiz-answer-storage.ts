// Odpověď kvízu pro lead (tech-spec 7.2 `quiz.answer`). Features spolu nesdílí stav (tech-spec 3.1),
// kvíz ji proto uloží do sessionStorage a formulář si ji přečte při odeslání. Bez úložiště
// (soukromé okno, zákaz) se lead odešle bez odpovědi.

const KEY = "rc_quiz_answer";
export type QuizAnswer = "ano" | "ne";

export function storeQuizAnswer(answer: QuizAnswer): void {
  try {
    sessionStorage.setItem(KEY, answer);
  } catch {
    // úložiště nedostupné – nevadí
  }
}

export function readQuizAnswer(): QuizAnswer | null {
  try {
    const value = sessionStorage.getItem(KEY);
    return value === "ano" || value === "ne" ? value : null;
  } catch {
    return null;
  }
}
