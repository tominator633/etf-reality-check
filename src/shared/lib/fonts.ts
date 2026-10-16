import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

// next/font stáhne písma při buildu a servíruje je z vlastní domény (žádný požadavek na Google
// z prohlížeče). latin-ext kvůli české diakritice. Obě písma jsou variabilní: jeden soubor
// pokryje všechny řezy, které tokeny používají.

/** Text: Plus Jakarta Sans (variabilní 200–800), bez kurzívy. */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  style: ["normal"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

/** Nadpisy: Outfit (variabilní 100–900). */
export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-outfit",
});

/** Třídy s CSS proměnnými obou písem pro <html>. */
export const fontVariables = `${plusJakartaSans.variable} ${outfit.variable}`;
