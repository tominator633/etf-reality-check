import type { NextConfig } from "next";
import { umamiOrigin } from "./src/features/analytics/lib/umami-config";

// Bezpečnostní hlavičky (tech-spec 11.4). CSP „bez nonce“ podle dokumentace Next 16
// (guides/content-security-policy): stránka zůstane staticky generovaná, Next proto potřebuje
// 'unsafe-inline' pro skripty; ve vývoji navíc 'unsafe-eval' a websocket pro hot reload.
// Umami se povolí jen z originu jeho skriptu (NEXT_PUBLIC_UMAMI_SCRIPT_URL), data posílá tamtéž.

const isDev = process.env.NODE_ENV === "development";
const umami = umamiOrigin();

const csp = [
  "default-src 'self'",
  ["script-src 'self' 'unsafe-inline'", isDev && "'unsafe-eval'", umami].filter(Boolean).join(" "),
  ["connect-src 'self'", isDev && "ws: wss:", umami].filter(Boolean).join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  !isDev && "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
