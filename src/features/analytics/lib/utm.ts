// UTM parametry: při prvním načtení se uloží do sessionStorage (tech-spec 8), aby se poslaly
// s leadem i po případné změně URL. Bez úložiště se čtou z aktuální URL.

export type Utm = Record<"source" | "medium" | "campaign" | "content", string | null>;
const KEY = "rc_utm";
const EMPTY: Utm = { source: null, medium: null, campaign: null, content: null };

export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search);
  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
  };
}

const hasAny = (utm: Utm) => Object.values(utm).some((value) => value !== null);

/** UTM z URL (a uloží je), jinak uložené z dřívějška. Validuje a sanitizuje až server. */
export function getUtm(search: string = typeof window === "undefined" ? "" : window.location.search): Utm {
  const fromUrl = parseUtm(search);
  try {
    if (hasAny(fromUrl)) {
      sessionStorage.setItem(KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = sessionStorage.getItem(KEY);
    return stored ? { ...EMPTY, ...(JSON.parse(stored) as Partial<Utm>) } : EMPTY;
  } catch {
    return hasAny(fromUrl) ? fromUrl : EMPTY;
  }
}
