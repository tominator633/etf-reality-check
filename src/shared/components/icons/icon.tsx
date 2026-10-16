import type { ReactNode } from "react";

// Základ vlastních SVG ikon (tech-spec 3: žádná ikonová knihovna). Velikost 1em podle okolního
// textu, barva currentColor, dekorativní (aria-hidden) – význam nese text vedle ikony.
export type IconProps = { className?: string };

export function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
