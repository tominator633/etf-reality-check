import { Bakbak_One, IBM_Plex_Sans_Condensed } from "next/font/google";

// next/font stáhne písma při buildu a servíruje je z vlastní domény (žádný požadavek na Google
// z prohlížeče). latin-ext kvůli české diakritice.

/** Text: jen řezy, které tokeny používají (400–700). */
export const plexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-plex-sans-condensed",
});

/** Nadpisy: Bakbak One má jediný řez 400. */
export const bakbakOne = Bakbak_One({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-bakbak-one",
});

/** Třídy s CSS proměnnými obou písem pro <html>. */
export const fontVariables = `${plexSansCondensed.variable} ${bakbakOne.variable}`;
