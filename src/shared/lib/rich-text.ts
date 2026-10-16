// Text s barevně odlišenými klíčovými slovy (Tom 16. 10.): fakta indigo, ztráta červeně,
// nejvýhodnější evropské dvojče zeleně. Texty v content/ zůstávají čistá data, barvy řeší CSS.

export type Tone = "fact" | "loss" | "gain";
export type RichSegment = string | { text: string; tone: Tone };
export type RichText = readonly RichSegment[];

export const fact = (text: string): RichSegment => ({ text, tone: "fact" });
export const loss = (text: string): RichSegment => ({ text, tone: "loss" });
export const gain = (text: string): RichSegment => ({ text, tone: "gain" });

/** Prostý text (meta, aria-label, testy). */
export function plainText(rich: RichText): string {
  return rich.map((segment) => (typeof segment === "string" ? segment : segment.text)).join("");
}
