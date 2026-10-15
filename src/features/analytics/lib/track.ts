// Vlastní eventy Umami (tech-spec 9.2). Každá vlastnost se v Umami počítá jako další event,
// proto max 2 vlastnosti: `variant` (doplní se sama) + nejvýš jedna podle eventu.
// track() nikdy nevyhodí chybu; e-mail ani hodnoty jezdců se neposílají.

export type EventProps = {
  rc_view: undefined;
  rc_answer: { answer: "ano" | "ne" };
  rc_slider_change: { slider: "return" | "years" | "monthly" };
  rc_cta_click: { location: "lead_card" | "sticky" };
  rc_form_view: undefined;
  rc_form_focus: undefined;
  rc_form_submit: undefined;
  rc_lead_success: undefined;
  rc_lead_error: { code: string };
  rc_pdf_download: undefined;
};
export type EventName = keyof EventProps;

type Umami = { track: (name: string, data?: Record<string, string>) => unknown };
declare global {
  interface Window {
    umami?: Umami;
  }
}

/** Varianta hero ze stránky (`data-variant` na <main>), výchozí „a“. */
export function currentVariant(): string {
  if (typeof document === "undefined") return "a";
  const variant = document.querySelector<HTMLElement>("[data-variant]")?.dataset.variant;
  return variant === "b" ? "b" : "a";
}

export function track<Name extends EventName>(
  name: Name,
  ...[props]: EventProps[Name] extends undefined ? [] : [EventProps[Name]]
): void {
  try {
    const data = { ...(props ?? {}), variant: currentVariant() };
    if (process.env.NODE_ENV !== "production") console.debug("[track]", name, data);
    window.umami?.track(name, data);
  } catch {
    // analytika nesmí rozbít stránku
  }
}

const sentThisPage = new Set<string>();

/** Pošle event jen jednou za relaci (sessionStorage; bez úložiště jednou za načtení stránky). */
export function trackOnce<Name extends EventName>(
  key: string,
  name: Name,
  ...rest: EventProps[Name] extends undefined ? [] : [EventProps[Name]]
): void {
  const storageKey = `rc_tracked:${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    if (sentThisPage.has(storageKey)) return;
  }
  sentThisPage.add(storageKey);
  track(name, ...rest);
}
