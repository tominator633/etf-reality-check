import type { Metadata } from "next";
import Script from "next/script";
import { umamiConfig } from "@/features/analytics";
import { copy } from "@content/copy";
import { fontVariables } from "@/shared/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

const umami = umamiConfig();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={fontVariables}>
      <body>
        {children}
        {umami && (
          <Script
            src={umami.src}
            data-website-id={umami.websiteId}
            data-domains={umami.domains}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
