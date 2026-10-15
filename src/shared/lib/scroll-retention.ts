import { readStored, writeStored } from "./browser-storage";

// Pozice scrollu po reloadu. Prohlížeč ji obnovuje hned po načtení, kdy je stránka ještě krátká
// (odhalení a formulář se obnoví až po hydrataci) – proto ruční obnovení: pozici uložíme při
// odchodu ze stránky (pagehide) a nastavíme ji, až je obnovený obsah vykreslený.

const KEY = "rc_scroll_y";

/** Zapne ruční obnovu scrollu a ukládání pozice při odchodu. Vrací úklid pro useEffect. */
export function startScrollRetention(): () => void {
  try {
    history.scrollRestoration = "manual";
  } catch {
    // starý prohlížeč – nevadí
  }
  const save = () => writeStored("session", KEY, String(Math.round(window.scrollY)));
  window.addEventListener("pagehide", save);
  return () => window.removeEventListener("pagehide", save);
}

/** Posune stránku na uloženou pozici (jen kladná konečná čísla). */
export function restoreScroll(): void {
  const y = Number(readStored("session", KEY));
  if (Number.isFinite(y) && y > 0) window.scrollTo({ top: y, behavior: "instant" });
}
