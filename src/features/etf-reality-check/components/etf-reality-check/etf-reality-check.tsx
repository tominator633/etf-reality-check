"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@content/copy";
import { formatCzk } from "@/shared/lib/format";
import { storeQuizAnswer } from "@/shared/lib/quiz-answer-storage";
import { clampInput, defaultInput, projectAll, type ProjectionInput } from "../../lib/projection";
import { allFunds, type RealityCheckView } from "../../lib/view-model";
import { AnswerReveal } from "../answer-reveal/answer-reveal";
import { FundPairGrid } from "../fund-pair-grid/fund-pair-grid";
import { ProjectionSliders } from "../projection-sliders/projection-sliders";
import { QuizStep, type Answer } from "../quiz-step/quiz-step";
import { UsFundPreview } from "../us-fund-preview/us-fund-preview";
import styles from "./etf-reality-check.module.css";

type EtfRealityCheckProps = { view: RealityCheckView };

// Kontejner kvízu: drží odpověď a jezdce. Před odpovědí malé karty amerických fondů nad otázkou,
// po odpovědi zmizí a odhalení se odkryje pod otázkou (tech-spec 6.1).
export function EtfRealityCheck({ view }: EtfRealityCheckProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [input, setInput] = useState<ProjectionInput>(defaultInput);
  const revealHeading = useRef<HTMLParagraphElement>(null);

  const funds = useMemo(() => allFunds(view), [view]);
  const projection = useMemo(
    () => projectAll(input, funds.map(({ id, ter }) => ({ id, ter }))),
    [input, funds],
  );
  const feeCosts = Object.fromEntries(projection.perFund.map(({ id, feeCost }) => [id, feeCost]));

  const knownCosts = projection.perFund.flatMap(({ feeCost }) => (feeCost === null ? [] : [feeCost]));
  const summary =
    knownCosts.length === 0
      ? null
      : copy.sliders.summary({
          invested: formatCzk(projection.invested),
          grossValue: formatCzk(projection.grossValue),
          minFeeCost: formatCzk(Math.min(...knownCosts)),
          maxFeeCost: formatCzk(Math.max(...knownCosts)),
        });

  useEffect(() => {
    if (!answer) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("reveal-start")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    revealHeading.current?.focus({ preventScroll: true });
  }, [answer]);

  return (
    <section className={styles.realityCheck}>
      {!answer && <UsFundPreview funds={view.usFunds} verifiedAt={view.verifiedAt} />}
      <QuizStep
        answer={answer}
        onAnswer={(chosen) => {
          setAnswer(chosen);
          storeQuizAnswer(chosen); // pro lead (features spolu nesdílí stav)
        }}
      />
      {answer && (
        <div id="reveal-start" className={styles.reveal}>
          <AnswerReveal answer={answer} kidSource={view.kidSource} headingRef={revealHeading} />
          <FundPairGrid groups={view.groups} feeCosts={feeCosts} lowestTerIds={view.lowestTerIds} />
          <ProjectionSliders
            input={input}
            onChange={(change) => setInput((current) => clampInput({ ...current, ...change }))}
            summary={summary}
          />
        </div>
      )}
    </section>
  );
}
