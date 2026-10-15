import { IBM_Plex_Sans_Condensed } from "next/font/google";

// next/font stáhne písmo při buildu a servíruje ho z vlastní domény (žádný požadavek na Google
// z prohlížeče). latin-ext kvůli české diakritice; jen řezy, které tokeny používají (400–700).
export const plexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-plex-sans-condensed",
});
