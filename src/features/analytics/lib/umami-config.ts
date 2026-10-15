// Konfigurace skriptu Umami z env (tech-spec 9.1, 12). Skript se vloží jen s ID webu, adresou
// skriptu (z tracking kódu v Umami) i adresou webu: `data-domains` omezí odesílání na produkční
// doménu, takže z localhostu se nic neposílá. Jinak track() ve vývoji jen vypisuje do konzole.

export type UmamiConfig = { src: string; websiteId: string; domains: string };

export function umamiConfig(env: Record<string, string | undefined> = process.env): UmamiConfig | null {
  const websiteId = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const src = env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  if (!websiteId || !src) return null;
  try {
    const domains = new URL(env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
    return { src, websiteId, domains };
  } catch {
    return null; // bez platné adresy webu by se posílala i data z localhostu
  }
}

/** Origin skriptu Umami pro CSP script-src; null = Umami vypnuté. */
export function umamiOrigin(env: Record<string, string | undefined> = process.env): string | null {
  const config = umamiConfig(env);
  if (!config) return null;
  try {
    return new URL(config.src).origin;
  } catch {
    return null;
  }
}

/**
 * Kam smí Umami posílat data (CSP connect-src). Umami Cloud načítá skript z cloud.umami.is,
 * ale data posílá na jinou poddoménu (na produkci 15. 10. 2026: gateway.umami.is) – proto
 * u umami.is povolíme jeho poddomény. U vlastní instance Umami jen origin skriptu.
 */
export function umamiConnectSources(env: Record<string, string | undefined> = process.env): string[] {
  const origin = umamiOrigin(env);
  if (!origin) return [];
  const { hostname } = new URL(origin);
  return hostname === "umami.is" || hostname.endsWith(".umami.is") ? [origin, "https://*.umami.is"] : [origin];
}
