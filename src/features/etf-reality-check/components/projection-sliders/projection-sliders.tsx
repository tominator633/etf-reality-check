import { useEffect, useId, useRef } from "react";
import assumptions from "@data/assumptions.json";
import { copy } from "@content/copy";
import { RichText } from "@/shared/components/rich-text/rich-text";
import { formatCzk, formatRate, formatYears } from "@/shared/lib/format";
import type { RichText as RichTextValue } from "@/shared/lib/rich-text";
import type { ProjectionInput } from "../../lib/projection";
import styles from "./projection-sliders.module.css";

type Range = { min: number; max: number; step: number };

type SliderProps = {
  label: string;
  value: number;
  range: Range;
  format: (value: number) => string;
  onChange: (value: number) => void;
};

function Slider({ label, value, range, format, onChange }: SliderProps) {
  const id = useId();
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
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type ProjectionSlidersProps = {
  input: ProjectionInput;
  onChange: (input: Partial<ProjectionInput>) => void;
  summary: RichTextValue | null;
};

// 3 nativní jezdce, souhrnná věta (aria-live) a povinná věta o modelovém výpočtu (brief kap. 5).
export function ProjectionSliders({ input, onChange, summary }: ProjectionSlidersProps) {
  return (
    <div className={styles.sliders}>
      <Slider
        label={copy.sliders.grossReturn}
        value={input.grossReturn}
        range={assumptions.grossAnnualReturn}
        format={formatRate}
        onChange={(grossReturn) => onChange({ grossReturn })}
      />
      <Slider
        label={copy.sliders.years}
        value={input.years}
        range={assumptions.years}
        format={formatYears}
        onChange={(years) => onChange({ years })}
      />
      <Slider
        label={copy.sliders.monthly}
        value={input.monthly}
        range={assumptions.monthly}
        format={formatCzk}
        onChange={(monthly) => onChange({ monthly })}
      />
      <p className={styles.summary} aria-live="polite">
        {summary && <RichText value={summary} />}
      </p>
      <p className={styles.disclaimer}>{copy.sliders.disclaimer}</p>
    </div>
  );
}
