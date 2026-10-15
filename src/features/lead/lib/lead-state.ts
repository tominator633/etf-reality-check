import { readStored, writeStored } from "@/shared/lib/browser-storage";

// Stav formuláře po reloadu (tech-spec 7.4 „use-lead-status“):
// - „odesláno“ v localStorage – i při další návštěvě se ukáže stav úspěchu s odkazem na PDF,
// - „formulář otevřený“ v sessionStorage – jen do zavření záložky.
// Rozepsaný e-mail se neukládá (osobní údaj); po reloadu ho doplní automatické vyplňování prohlížeče.

const SENT_KEY = "rc_lead_sent";
const FORM_OPEN_KEY = "rc_lead_form_open";

export type StoredLeadStep = "cta" | "form" | "success";

export function readLeadStep(): StoredLeadStep {
  if (readStored("local", SENT_KEY) === "1") return "success";
  if (readStored("session", FORM_OPEN_KEY) === "1") return "form";
  return "cta";
}

export function storeFormOpen(): void {
  writeStored("session", FORM_OPEN_KEY, "1");
}

/** Jen po potvrzeném uložení leadu serverem. */
export function storeLeadSent(): void {
  writeStored("local", SENT_KEY, "1");
}
