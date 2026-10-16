"use client";

import { useEffect, useRef, useState } from "react";

// Plynulý přechod čísla (např. částky na kartách při posunu jezdce). Vlastní requestAnimationFrame
// místo animačního enginu – pár řádků, nic navíc ke stažení. S prefers-reduced-motion skočí rovnou.

export function useAnimatedNumber(target: number, { from = target, durationMs = 500 } = {}): number {
  const [value, setValue] = useState(from);
  const current = useRef(from);

  useEffect(() => {
    const start = current.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === target) {
      current.current = target;
      setValue(target);
      return;
    }
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3; // ease-out
      current.current = start + (target - start) * eased;
      setValue(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
