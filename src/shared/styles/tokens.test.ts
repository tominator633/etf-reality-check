import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Kontrast textových kombinací podle WCAG 2.x (AA: text ≥ 4,5 : 1, prvky UI ≥ 3 : 1).
const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

// Hodnota tokenu jako hex; odkaz var(--jiny-token) se dohledá.
function token(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6}|var\\(--([a-z0-9-]+)\\))`));
  if (!match) throw new Error(`Token --${name} nemá hex hodnotu ani var()`);
  return match[2] ? token(match[2]) : match[1];
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const TEXT_PAIRS: [foreground: string, background: string][] = [
  ["color-ink", "color-bg"],
  ["color-ink", "color-bg-tint"],
  ["color-ink-muted", "color-bg-tint"],
  ["color-accent", "color-bg-tint"],
  ["color-error", "color-bg-tint"],
  ["color-on-selected", "color-selected"],
  ["color-on-highlight", "color-highlight"],
  ["color-ink", "color-surface"],
  ["color-ink-muted", "color-bg"],
  ["color-ink-muted", "color-surface"],
  ["color-accent", "color-bg"],
  ["color-accent", "color-surface"],
  ["color-on-accent-fill", "color-accent-fill"],
  ["color-on-accent-fill", "color-accent-fill-hover"],
  ["color-badge-ink", "color-badge-bg"],
  ["color-us-card-ink", "color-us-card-bg"],
  ["color-us-card-ink-muted", "color-us-card-bg"],
  ["color-accent", "color-us-card-bg"],
  ["color-error", "color-bg"],
  ["color-error", "color-surface"],
];

const UI_PAIRS: [foreground: string, background: string][] = [
  ["color-border", "color-bg"],
  ["color-border", "color-surface"],
  ["color-focus", "color-bg"],
  ["color-focus", "color-surface"],
  ["color-focus", "color-bg-tint"],
];

describe("tokens.css – kontrast", () => {
  it.each(TEXT_PAIRS)("text %s na %s má aspoň 4,5 : 1", (fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI_PAIRS)("prvek UI %s na %s má aspoň 3 : 1", (fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });

  it("výpočet kontrastu odpovídá referenci WCAG (černá na bílé = 21 : 1)", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
});
