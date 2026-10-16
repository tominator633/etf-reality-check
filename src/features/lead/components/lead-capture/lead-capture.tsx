"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useId, useRef, useState, type FormEvent } from "react";
import { copy } from "@content/copy";
import { getUtm, track, trackOnce, useTrackInView } from "@/features/analytics";
import { press, swap } from "@/shared/lib/motion";
import { readQuizAnswer } from "@/shared/lib/quiz-answer-storage";
import { EMAIL_MAX_LENGTH, emailSchema, type LeadErrorCode } from "@/shared/schemas/lead.schema";
import { GUIDE_AVAILABLE, GUIDE_URL } from "../../lib/guide";
import { readLeadStep, storeFormOpen, storeLeadSent } from "../../lib/lead-state";
import { submitLead } from "../../lib/submit-lead";
import styles from "./lead-capture.module.css";

type LeadCaptureProps = { variant: "a" | "b"; emailEnabled: boolean; privacyHref: string };
type Step = "cta" | "form" | "success";

// Nabídka PDF: tlačítko → formulář s jediným polem (e-mail) → stav úspěchu až po potvrzení serveru.
// Otevřený formulář (sessionStorage) a odeslání (localStorage) se po reloadu obnoví (lib/lead-state.ts).
// Karta se vykresluje jen uvnitř odhalení kvízu (skládá src/app/page.tsx), tedy vždy až po odpovědi
// a jen na klientu – uložený stav proto jde přečíst rovnou při prvním vykreslení (bez hydratace).
// E-mail se validuje stejným schématem na klientu i na serveru (shared/schemas/lead.schema.ts).
export function LeadCapture({ variant, emailEnabled, privacyHref }: LeadCaptureProps) {
  const [step, setStep] = useState<Step>(readLeadStep);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [formError, setFormError] = useState<Exclude<LeadErrorCode, "invalid_email"> | null>(null);
  const [guideUrl, setGuideUrl] = useState<string | null>(() => (step === "success" ? GUIDE_URL : null));
  const startedAt = useRef(step === "form" ? Date.now() : 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const section = useRef<HTMLElement>(null);
  // Fokus se přesouvá jen po akci uživatele (otevření formuláře, úspěšné odeslání), nikdy po obnovení
  // z úložiště – to by posunulo stránku. Odolné i vůči dvojímu spuštění efektů ve Strict Mode.
  const focusAfterAction = useRef(false);
  const inputId = useId();
  const errorId = useId();
  const { lead } = copy;

  useTrackInView(section, "rc_form_view");

  // Prvek se kvůli animaci výměny vloží do stránky až po odchodu předchozího, proto fokus až
  // v okamžiku vložení (callback ref), a jen po akci uživatele.
  const focusOnMount = (element: HTMLElement | null) => {
    if (!element || !focusAfterAction.current) return;
    focusAfterAction.current = false;
    element.focus();
  };
  const setInputRef = (element: HTMLInputElement | null) => {
    inputRef.current = element;
    focusOnMount(element);
  };

  function open() {
    track("rc_cta_click", { location: "lead_card" });
    startedAt.current = Date.now();
    storeFormOpen();
    focusAfterAction.current = true;
    setStep("form");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    track("rc_form_submit"); // každý pokus; rozdíl proti rc_lead_success = chyby validace a serveru

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldError(true);
      inputRef.current?.focus();
      return;
    }

    setFieldError(false);
    setFormError(null);
    setSubmitting(true);
    const answer = readQuizAnswer();
    const result = await submitLead({
      email: parsed.data,
      website: honeypot,
      variant,
      utm: getUtm(),
      quiz: answer ? { answer } : null,
      startedAt: startedAt.current,
    });
    setSubmitting(false);

    if (result.status === "success") {
      track("rc_lead_success"); // až po potvrzeném uložení (CLAUDE.md)
      storeLeadSent();
      focusAfterAction.current = true;
      setGuideUrl(result.guideUrl);
      setStep("success");
    } else if (result.code === "invalid_email") {
      track("rc_lead_error", { code: result.code });
      setFieldError(true);
      inputRef.current?.focus();
    } else {
      track("rc_lead_error", { code: result.code });
      setFormError(result.code);
    }
  }

  const submitLabel = submitting
    ? lead.submitting
    : formError === "server_error" || formError === "invalid_request"
      ? lead.errors.retry
      : lead.submit;

  return (
    <section ref={section} id="lead" className={styles.card} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {step === "success" ? (
          <m.div key="success" className={styles.step} {...swap}>
            <h2 ref={focusOnMount} tabIndex={-1} className={styles.heading}>
              {lead.success.heading}
            </h2>
            <p>{GUIDE_AVAILABLE ? lead.success.textReady : lead.success.textPending}</p>
            {GUIDE_AVAILABLE && guideUrl && (
              <m.a
                className={styles.button}
                href={guideUrl}
                download
                onClick={() => track("rc_pdf_download")}
                {...press}
              >
                {lead.success.download}
              </m.a>
            )}
          </m.div>
        ) : (
          <m.div key="offer" className={styles.step} {...swap}>
            <h2 className={styles.heading}>{lead.offer.heading}</h2>
            <p className={styles.offer}>{lead.offer.intro}</p>
            <ul className={styles.benefits}>
              {lead.offer.benefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓ </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <AnimatePresence mode="popLayout" initial={false}>
              {step === "cta" ? (
                <m.button key="cta" type="button" className={styles.button} onClick={open} {...swap} {...press}>
                  {lead.cta}
                </m.button>
              ) : (
                <m.form key="form" className={styles.form} onSubmit={onSubmit} noValidate {...swap}>
                  <label htmlFor={inputId} className={styles.label}>
                    {lead.emailLabel}
                  </label>
                  <input
                    ref={setInputRef}
                    id={inputId}
                    className={styles.input}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={EMAIL_MAX_LENGTH}
                    placeholder={lead.emailPlaceholder}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (fieldError) setFieldError(false);
                    }}
                    onFocus={() => trackOnce("rc_form_focus", "rc_form_focus")}
                    aria-invalid={fieldError}
                    aria-describedby={fieldError ? errorId : undefined}
                  />
                  {fieldError && (
                    <m.p id={errorId} className={styles.error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      {lead.errors.invalidEmail}
                    </m.p>
                  )}

                  {/* Honeypot: člověk ho nevidí ani na něj nedojde tabulátorem, bot ho vyplní. */}
                  <div className="visually-hidden" aria-hidden="true">
                    <label>
                      website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(event) => setHoneypot(event.target.value)}
                      />
                    </label>
                  </div>

                  <m.button type="submit" className={styles.button} disabled={submitting} {...(submitting ? {} : press)}>
                    {submitLabel}
                  </m.button>

                  {formError && (
                    <m.p className={styles.error} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      {formError === "rate_limited" ? lead.errors.rateLimited : lead.errors.serverError}
                    </m.p>
                  )}

                  <div className={styles.notes}>
                    {GUIDE_AVAILABLE && <p>{lead.downloadNote}</p>}
                    {emailEnabled && <p>{lead.emailAlsoNote}</p>}
                    <p>
                      {lead.noSpam} <a href={privacyHref}>{lead.privacyLink}</a>
                    </p>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
