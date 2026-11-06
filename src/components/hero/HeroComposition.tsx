import type { ReactNode } from "react";
import { COLLECTION_ANCHOR } from "@/cinematic/moments";
import { KineticTitle } from "../motion/KineticTitle";
import { Wind } from "../motion/Wind";

interface HeroCompositionProps {
  /** Panel visual (secuencia cinematográfica o fotografía fija). */
  media: ReactNode;
  /** Indicador de avance de la secuencia (solo en modo cinematográfico). */
  progress?: ReactNode;
}

/**
 * Hero: una campaña de café. Jerarquía: titular monumental, identidad,
 * propuesta y CTA; la secuencia acompaña.
 * Desktop: bloque editorial a la izquierda con el café superpuesto.
 * Móvil: titular y compra primero, el café debajo.
 */
export function HeroComposition({ media, progress }: HeroCompositionProps) {
  return (
    <div className="hero" data-hero>
      <div className="hero-media">
        <div className="hero-media-frame">{media}</div>
      </div>

      <Wind variant="hero" grains={5} className="hero-wind" />

      <div className="hero-copy">
        <p className="hero-eyebrow" data-hero-fade>
          <span className="hero-eyebrow-rule" aria-hidden />
          Café de especialidad, a tu ritmo
        </p>
        <KineticTitle
          as="h1"
          className="hero-title"
          lines={[
            { text: "UN BUEN CAFÉ.", voice: "serif" },
            { text: "CAMBIA EL RITMO.", voice: "italic", indent: 0.5 },
          ]}
        />
        <div className="hero-offer" data-hero-fade>
          <p className="hero-lead">Café de especialidad seleccionado para disfrutar a tu manera.</p>
          <div className="hero-actions">
            <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg">
              Descubrir cafés
            </a>
            <a href="#diferencia" className="link-line">
              Conocer KAZE
            </a>
          </div>
        </div>
      </div>

      {progress}
    </div>
  );
}
