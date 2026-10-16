import { useEffect, useId, useRef } from "react";
import assumptions from "@data/assumptions.json";
import { copy } from "@content/copy";
import { formatCzk, formatRate, formatYears } from "@/shared/lib/format";
import type { ProjectionInput } from "../../lib/projection";
import styles from "./projection-sliders.module.css";

type Range = { min: number; max: number; step: number };

type SliderProps = {
  label: string;
  /** Jedna věta pod popiskem: co hodnota znamená (propojená přes aria-describedby). */
  hint: string;
  value: number;
  range: Range;
  format: (value: number) => string;
  onChange: (value: number) => void;
};

function Slider({ label, hint, value, range, format, onChange }: SliderProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const input = useRef<HTMLInputElement>(null);
  const progress = ((value - range.min) / (range.max - range.min)) * 100;

  // Výplň stopy (WebKit) přes CSS proměnnou nastavenou mimo JSX – bez inline stylu.
  useEffect(() => {
    input.current?.style.setProperty("--progress", `${progress}%`);
  }, [progress]);

  return (
    <div className={styles.slider}>
      <div className={styles.labelRow}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className={styles.value}>
          {format(value)}
        </output>
      </div>
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>
      <input
        ref={input}
        id={id}
        type="range"
        className={styles.range}
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        aria-valuetext={format(value)}
        aria-describedby={hintId}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type ProjectionSlidersProps = {
  input: ProjectionInput;
  onChange: (input: Partial<ProjectionInput>) => void;
  summary: ReturnType<typeof copy.sliders.summary> | null;
};

// 3 nativní jezdce, souhrn v řádcích (aria-live) a povinná věta o modelovém výpočtu (brief kap. 5).
export function ProjectionSliders({ input, onChange, summary }: ProjectionSlidersProps) {
  return (
    <div className={styles.sliders}>
      {/* Pořadí jako věta: kolik → jak dlouho → s jakým výnosem (Tom 16. 10.) */}
      <Slider
        {...copy.sliders.monthly}
        value={input.monthly}
        range={assumptions.monthly}
        format={formatCzk}
        onChange={(monthly) => onChange({ monthly })}
      />
      <Slider
        {...copy.sliders.years}
        value={input.years}
        range={assumptions.years}
        format={formatYears}
        onChange={(years) => onChange({ years })}
      />
      <Slider
        {...copy.sliders.grossReturn}
        value={input.grossReturn}
        range={assumptions.grossAnnualReturn}
        format={formatRate}
        onChange={(grossReturn) => onChange({ grossReturn })}
      />
      <div className={styles.summary} aria-live="polite">
        {summary && (
          <>
            <p className={styles.summaryHeading}>{summary.heading}</p>
            <dl className={styles.rows}>
              {summary.rows.map((row) => (
                <div key={row.label} className={styles.row}>
                  <dt className={styles.rowText}>
                    <span className={styles.rowLabel}>{row.label}</span>
                    <span className={styles.rowNote}>{row.note}</span>
                  </dt>
                  <dd className={`${styles.amount} ${styles[row.tone]}`}>{row.amount}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.footnote}>{summary.footnote}</p>
          </>
        )}
      </div>
      <p className={styles.disclaimer}>{copy.sliders.disclaimer}</p>
    </div>
  );
}
