"use client";

import { domAnimation, LazyMotion, MotionConfig, type Transition, type Variants } from "motion/react";
import type { ReactNode } from "react";

// Animace (motion, dříve framer-motion). Jen průhlednost a posun (transform) – nemění rozměry,
// takže nevzniká posun obsahu (CLS). Obsah vykreslený serverem se neanimuje (LCP). Uživatelé
// s prefers-reduced-motion dostanou stav bez pohybu (MotionConfig reducedMotion="user").
// Engine (domAnimation) se načítá spolu s kvízem, ne líně: kdyby se líně načtený engine nestáhl,
// zůstalo by odhalení neviditelné. Měření (Lighthouse, docs/decisions.md): načítání se nezhoršilo.


export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

const EASE: Transition["ease"] = [0.2, 0, 0, 1];

/** Rodič, který postupně odkrývá potomky. */
export const stagger = (delayChildren = 0, staggerChildren = 0.1): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Potomek: vyjede zespodu a zprůhlední se. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Výměna obsahu na stejném místě (CTA → formulář → úspěch). */
export const swap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: EASE } },
};

/** Jemná odezva tlačítek na dotyk a najetí myší. */
export const press = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };
