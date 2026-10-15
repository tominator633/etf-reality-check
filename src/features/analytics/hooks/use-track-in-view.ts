"use client";

import { useEffect, type RefObject } from "react";
import { trackOnce, type EventName } from "../lib/track";

/**
 * Pošle event jednou za relaci, když je prvek aspoň z poloviny ve viewportu (tech-spec 9.2).
 * `when`: další podmínka – dokud neplatí, prvek se sleduje dál a event se pošle při dalším
 * zobrazení (např. formulář až po odpovědi, aby seděl funnel rc_answer → rc_form_view).
 */
export function useTrackInView(
  ref: RefObject<Element | null>,
  name: Extract<EventName, "rc_view" | "rc_form_view">,
  when: () => boolean = () => true,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && when()) {
          trackOnce(name, name);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, name, when]);
}
