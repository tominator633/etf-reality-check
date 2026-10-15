"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { copy } from "@content/copy";
import { readQuizAnswer } from "@/shared/lib/quiz-answer-storage";
import { EMAIL_MAX_LENGTH, emailSchema, type LeadErrorCode } from "@/shared/schemas/lead.schema";
import { readUtm, submitLead } from "../../lib/submit-lead";
import styles from "./lead-capture.module.css";

type LeadCaptureProps = { variant: "a" | "b"; emailEnabled: boolean; privacyHref: string };
type Step = "cta" | "form" | "success";

// Nabídka PDF: tlačítko → formulář s jediným polem (e-mail) → stav úspěchu až po potvrzení serveru.
// E-mail se validuje stejným schématem na klientu i na serveru (shared/schemas/lead.schema.ts).
export function LeadCapture({ variant, emailEnabled, privacyHref }: LeadCaptureProps) {
  const [step, setStep] = useState<Step>("cta");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [formError, setFormError] = useState<Exclude<LeadErrorCode, "invalid_email"> | null>(null);
  const [guideUrl, setGuideUrl] = useState<string | null>(null);
  const startedAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const inputId = useId();
  const errorId = useId();
  const { lead } = copy;

  useEffect(() => {
    if (step === "form") inputRef.current?.focus();
    if (step === "success") successRef.current?.focus();
  }, [step]);

  function open() {
    startedAt.current = Date.now();
    setStep("form");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

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
      utm: readUtm(window.location.search),
      quiz: answer ? { answer } : null,
      startedAt: startedAt.current,
    });
    setSubmitting(false);

    if (result.status === "success") {
      setGuideUrl(result.guideUrl);
      setStep("success");
    } else if (result.code === "invalid_email") {
      setFieldError(true);
      inputRef.current?.focus();
    } else {
      setFormError(result.code);
    }
  }

  if (step === "success") {
    return (
      <section id="lead" className={styles.card} aria-live="polite">
        <h2 ref={successRef} tabIndex={-1} className={styles.heading}>
          {lead.success.heading}
        </h2>
        <p>{lead.success.text}</p>
        {guideUrl && (
          <a className={styles.button} href={guideUrl} download>
            {lead.success.download}
          </a>
        )}
      </section>
    );
  }

  return (
    <section id="lead" className={styles.card}>
      <p className={styles.offer}>{lead.offer}</p>

      {step === "cta" ? (
        <button type="button" className={styles.button} onClick={open}>
          {lead.cta}
        </button>
      ) : (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <label htmlFor={inputId} className={styles.label}>
            {lead.emailLabel}
          </label>
          <input
            ref={inputRef}
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
            aria-invalid={fieldError}
            aria-describedby={fieldError ? errorId : undefined}
          />
          {fieldError && (
            <p id={errorId} className={styles.error}>
              {lead.errors.invalidEmail}
            </p>
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

          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? lead.submitting : formError === "server_error" || formError === "invalid_request" ? lead.errors.retry : lead.submit}
          </button>

          {formError && (
            <p className={styles.error} role="alert">
              {formError === "rate_limited" ? lead.errors.rateLimited : lead.errors.serverError}
            </p>
          )}

          <div className={styles.notes}>
            <p>{lead.downloadNote}</p>
            {emailEnabled && <p>{lead.emailAlsoNote}</p>}
            <p>
              {lead.noSpam} <a href={privacyHref}>{lead.privacyLink}</a>
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
