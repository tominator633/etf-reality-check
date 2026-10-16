"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { copy } from "@content/copy";
import { track, trackOnce, useTrackInView } from "@/features/analytics";
import { formatCzk, formatRate, formatYears } from "@/shared/lib/format";
import { fadeUp, MotionProvider, stagger } from "@/shared/lib/motion";
import { readQuizAnswer, storeQuizAnswer } from "@/shared/lib/quiz-answer-storage";
import { restoreScroll, startScrollRetention } from "@/shared/lib/scroll-retention";
import { clampInput, defaultInput, projectAll, type ProjectionInput } from "../../lib/projection";
import { readProjectionInput, storeProjectionInput } from "../../lib/slider-storage";
import { allFunds, type RealityCheckView } from "../../lib/view-model";
import { AnswerReveal } from "../answer-reveal/answer-reveal";
import { FundPairGrid } from "../fund-pair-grid/fund-pair-grid";
import { ProjectionSliders } from "../projection-sliders/projection-sliders";
import { QuizStep, type Answer } from "../quiz-step/quiz-step";
import { UsFundPreview } from "../us-fund-preview/us-fund-preview";
import styles from "./etf-reality-check.module.css";

type EtfRealityCheckProps = {
  view: RealityCheckView;
  /** Obsah na konci odhalení (formulář) – zobrazí se jen spolu se srovnáním, nikdy bez něj. */
  afterReveal?: ReactNode;
};

// Názvy jezdců v analytice (tech-spec 9.2); hodnota jezdce se neposílá.
const SLIDER_NAMES = { grossReturn: "return", years: "years", monthly: "monthly" } as const;
const SLIDER_DEBOUNCE_MS = 1000;

// Kontejner kvízu: drží odpověď a jezdce. Před odpovědí malé karty amerických fondů nad otázkou,
// po odpovědi zmizí a odhalení se odkryje pod otázkou (tech-spec 6.1). Odpověď i jezdce se
// ukládají do sessionStorage a po reloadu obnoví (bez posunu stránky, fokusu a eventů).
export function EtfRealityCheck({ view, afterReveal }: EtfRealityCheckProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [input, setInput] = useState<ProjectionInput>(defaultInput);
  const revealHeading = useRef<HTMLParagraphElement>(null);
  const section = useRef<HTMLElement>(null);
  const sliderTimers = useRef(new Map<keyof ProjectionInput, ReturnType<typeof setTimeout>>());

  // true = odpověď se právě obnovila z úložiště, ne kliknutím (neposouvat, nefokusovat).
  const restoredAnswer = useRef(false);
  const [restored, setRestored] = useState(false);
  // Odkud odpověď přišla: po obnovení z úložiště se odhalení neanimuje (stránka má vypadat stejně).
  const [answeredByClick, setAnsweredByClick] = useState(false);

  useTrackInView(section, "rc_view");

  // Obnovení po reloadu. Až po hydrataci: server o úložišti prohlížeče neví.
  useEffect(() => {
    const stopScrollRetention = startScrollRetention();
    const storedInput = readProjectionInput();
    if (storedInput) setInput(storedInput);
    const storedAnswer = readQuizAnswer();
    if (storedAnswer) {
      restoredAnswer.current = true;
      setAnswer(storedAnswer);
    }
    setRestored(true);
    return stopScrollRetention;
  }, []);

  // Scroll až po vykreslení obnoveného stavu (v jednom renderu i s formulářem, který se obnovuje
  // ve stejném commitu), jinak by stránka byla ještě krátká.
  useEffect(() => {
    if (restored) restoreScroll();
  }, [restored]);

  useEffect(() => {
    const timers = sliderTimers.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  // rc_slider_change: první pohyb každého jezdce za relaci, až se jezdec na 1 s zastaví.
  function trackSlider(change: Partial<ProjectionInput>) {
    for (const key of Object.keys(change) as (keyof ProjectionInput)[]) {
      clearTimeout(sliderTimers.current.get(key));
      const slider = SLIDER_NAMES[key];
      sliderTimers.current.set(
        key,
        setTimeout(() => trackOnce(`rc_slider_change:${slider}`, "rc_slider_change", { slider }), SLIDER_DEBOUNCE_MS),
      );
    }
  }

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
          monthly: formatCzk(input.monthly),
          years: formatYears(input.years),
          grossReturn: formatRate(input.grossReturn),
          invested: formatCzk(projection.invested),
          grossValue: formatCzk(projection.grossValue),
          minFeeCost: formatCzk(Math.min(...knownCosts)),
          maxFeeCost: formatCzk(Math.max(...knownCosts)),
        });

  useEffect(() => {
    if (!answer) return;
    if (restoredAnswer.current) {
      restoredAnswer.current = false;
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("reveal-start")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    revealHeading.current?.focus({ preventScroll: true });
  }, [answer]);

  return (
    <MotionProvider>
      <section ref={section} className={styles.realityCheck}>
        <AnimatePresence initial={false} mode="popLayout">
          {!answer && (
            <m.div key="preview" exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}>
              <UsFundPreview funds={view.usFunds} verifiedAt={view.verifiedAt} />
            </m.div>
          )}
        </AnimatePresence>
        <QuizStep
          answer={answer}
          animateResult={answeredByClick}
          onAnswer={(chosen) => {
            setAnsweredByClick(true);
            setAnswer(chosen);
            storeQuizAnswer(chosen); // pro lead (features spolu nesdílí stav)
            track("rc_answer", { answer: chosen });
          }}
        />
        {answer && (
          <m.div
            id="reveal-start"
            className={styles.reveal}
            variants={stagger(0.15, 0.15)}
            initial={answeredByClick ? "hidden" : false}
            animate="show"
          >
            <m.div variants={fadeUp}>
              <AnswerReveal answer={answer} kidSource={view.kidSource} headingRef={revealHeading} />
            </m.div>
            <FundPairGrid
              groups={view.groups}
              feeCosts={feeCosts}
              maxFeeCost={knownCosts.length ? Math.max(...knownCosts) : null}
              lowestTerIds={view.lowestTerIds}
              countUp={answeredByClick}
            />
            <m.div variants={fadeUp}>
              <ProjectionSliders
              input={input}
              onChange={(change) => {
                const next = clampInput({ ...input, ...change });
                setInput(next);
                storeProjectionInput(next);
                trackSlider(change);
              }}
              summary={summary}
            />
            </m.div>
            <m.div variants={fadeUp}>{afterReveal}</m.div>
          </m.div>
        )}
      </section>
    </MotionProvider>
  );
}
