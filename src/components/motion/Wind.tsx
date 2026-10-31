/**
 * Motivo gráfico de KAZE: ráfagas de viento (curvas SVG) y granos que viajan
 * por ellas. Es la firma del sistema de movimiento: las curvas se dibujan con
 * el scroll (DrawSVG) y los granos las recorren (MotionPath).
 *
 * En reposo (sin JS o con movimiento reducido) las curvas se ven completas y
 * los granos quedan en su lugar: el motivo funciona también como ilustración.
 */

export type WindVariant = "hero" | "section" | "closing";

/** Familias de curvas en un lienzo de 1440 × 900 (se estiran con el contenedor). */
const PATHS: Record<WindVariant, string[]> = {
  // Nacen al final del titular y viajan hacia el café (nunca cruzan la bajada).
  hero: [
    "M560 520 C 720 470, 820 600, 980 520 S 1260 300, 1480 360",
    "M600 560 C 760 520, 880 650, 1040 570 S 1300 380, 1480 430",
    "M520 480 C 680 420, 800 540, 940 470 S 1220 240, 1480 280",
  ],
  section: [
    "M-40 120 C 300 40, 620 220, 900 110 S 1300 20, 1480 80",
    "M-40 170 C 360 100, 640 260, 960 160 S 1320 70, 1480 130",
  ],
  closing: [
    "M-40 820 C 280 700, 520 860, 820 720 S 1200 520, 1480 600",
    "M-40 860 C 320 760, 600 900, 900 780 S 1260 600, 1480 680",
    "M-40 780 C 260 650, 500 800, 780 660 S 1160 450, 1480 520",
  ],
};

interface WindProps {
  variant: WindVariant;
  /** Cantidad de granos que recorren la primera curva. */
  grains?: number;
  className?: string;
  tone?: "ink" | "crema";
}

export function Wind({ variant, grains = 0, className = "", tone = "ink" }: WindProps) {
  const paths = PATHS[variant];
  return (
    <svg
      className={`wind wind-${variant} wind-${tone} ${className}`}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      data-wind={variant}
    >
      {paths.map((d, i) => (
        <path key={i} className="wind-path" d={d} data-wind-index={i} vectorEffect="non-scaling-stroke" />
      ))}
      {Array.from({ length: grains }, (_, i) => (
        <g key={i} className="wind-grain" data-grain={i}>
          {/* Grano: elipse con su surco curvo (no es el isotipo de la marca). */}
          <ellipse rx="9" ry="6.2" />
          <path d="M-6 1.2 C -2 -2.6, 2 2.6, 6 -1.2" />
        </g>
      ))}
    </svg>
  );
}
