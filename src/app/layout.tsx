import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETF Reality Check",
  description: "[[CHYBÍ TEXT: popis stránky pro vyhledávače]]",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
