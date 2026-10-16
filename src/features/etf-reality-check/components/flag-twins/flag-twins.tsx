import styles from "./flag-twins.module.css";

// Dekorativní metafora „americký fond a jeho evropské dvojče“: stylizovaná americká vlajka
// vzadu, evropská vpředu. Inline SVG (žádný obrázek ke stažení), aria-hidden, barvy z tokenů.

const STRIPES = 7; // stylizace: 7 pruhů místo 13
const US = { x: 6, y: 8, width: 72, height: 48 };
const EU = { x: 40, y: 50, width: 74, height: 50 };
const EU_STARS = 12;
const STAR_RING = 15;

/** Pěticípá hvězda kolem bodu (cx, cy). */
function starPath(cx: number, cy: number, outer: number, inner = outer * 0.42): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

export function FlagTwins() {
  const stripeHeight = US.height / STRIPES;
  const canton = { width: US.width * 0.42, height: stripeHeight * 4 };
  const euCenter = { x: EU.x + EU.width / 2, y: EU.y + EU.height / 2 };

  return (
    <svg className={styles.flags} viewBox="0 0 120 106" aria-hidden="true" focusable="false">
      {/* vnější <g> = vznášení (CSS transform), vnitřní = natočení (SVG transform) – jinak by se přepsaly */}
      <g className={styles.floatReverse}>
        <g className={styles.card} transform={`rotate(-8 ${US.x + US.width / 2} ${US.y + US.height / 2})`}>
          <rect className={styles.white} x={US.x} y={US.y} width={US.width} height={US.height} rx="3" />
          {Array.from({ length: Math.ceil(STRIPES / 2) }, (_, index) => (
            <rect
              key={index}
              className={styles.usRed}
              x={US.x}
              y={US.y + index * 2 * stripeHeight}
              width={US.width}
              height={stripeHeight}
            />
          ))}
          <rect className={styles.usBlue} x={US.x} y={US.y} width={canton.width} height={canton.height} />
          {Array.from({ length: 9 }, (_, index) => (
            <circle
              key={index}
              className={styles.white}
              cx={US.x + 5 + (index % 3) * ((canton.width - 10) / 2)}
              cy={US.y + 4.5 + Math.floor(index / 3) * ((canton.height - 9) / 2)}
              r="1.4"
            />
          ))}
          <rect className={styles.frame} x={US.x} y={US.y} width={US.width} height={US.height} rx="3" />
        </g>
      </g>
      <g className={styles.float}>
        <g className={styles.card} transform={`rotate(6 ${euCenter.x} ${euCenter.y})`}>
          <rect className={styles.euBlue} x={EU.x} y={EU.y} width={EU.width} height={EU.height} rx="3" />
          {Array.from({ length: EU_STARS }, (_, index) => {
            const angle = (2 * Math.PI * index) / EU_STARS;
            return (
              <path
                key={index}
                className={styles.euYellow}
                d={starPath(euCenter.x + STAR_RING * Math.sin(angle), euCenter.y - STAR_RING * Math.cos(angle), 2.6)}
              />
            );
          })}
          <rect className={styles.frame} x={EU.x} y={EU.y} width={EU.width} height={EU.height} rx="3" />
        </g>
      </g>
    </svg>
  );
}
