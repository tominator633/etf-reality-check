import { readStored, writeStored } from "@/shared/lib/browser-storage";
import { clampInput, type ProjectionInput } from "./projection";

// Nastavení jezdců v sessionStorage, aby po reloadu zůstal srovnávač stejný.
// Uložená hodnota se při čtení znovu ořízne na rozsahy (clampInput) – nevěříme úložišti.

const KEY = "rc_projection_input";

export function storeProjectionInput(input: ProjectionInput): void {
  writeStored("session", KEY, JSON.stringify(input));
}

export function readProjectionInput(): ProjectionInput | null {
  const raw = readStored("session", KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return clampInput(parsed as Partial<Record<keyof ProjectionInput, unknown>>);
  } catch {
    return null;
  }
}
