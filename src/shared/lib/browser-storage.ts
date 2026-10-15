// Bezpečný přístup k sessionStorage / localStorage: v soukromém okně, při zákazu úložiště nebo
// na serveru se nic nestane (čtení vrátí null). Stránka musí fungovat i bez úložiště.

type Area = "session" | "local";

function storage(area: Area): Storage | null {
  try {
    return area === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readStored(area: Area, key: string): string | null {
  try {
    return storage(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(area: Area, key: string, value: string): void {
  try {
    storage(area)?.setItem(key, value);
  } catch {
    // úložiště nedostupné nebo plné – nevadí
  }
}

export function removeStored(area: Area, key: string): void {
  try {
    storage(area)?.removeItem(key);
  } catch {
    // nevadí
  }
}
