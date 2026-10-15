import type { Metadata } from "next";
import { copy } from "@content/copy";
import { fontVariables } from "@/shared/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
