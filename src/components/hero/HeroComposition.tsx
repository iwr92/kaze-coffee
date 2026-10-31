import type { ReactNode } from "react";
import { BRAND_ANCHOR, COLLECTION_ANCHOR } from "@/cinematic/moments";
import { KineticTitle } from "../motion/KineticTitle";
import { Wind } from "../motion/Wind";

interface HeroCompositionProps {
  /** Panel visual (secuencia cinematográfica o fotografía fija). */
  media: ReactNode;
  /** Indicador de avance de la secuencia (solo en modo cinematográfico). */
  progress?: ReactNode;
}

/**
 * Hero V6 — una campaña, no una landing.
 *
 * El titular se monta sobre el panel del café y una ráfaga de viento cruza
 * de un lado al otro llevando granos: texto e imagen son una sola pieza.
 * Desktop: bloque editorial compacto a la izquierda, café a la derecha
 * superpuesto. Móvil: titular y compra primero, el café debajo.
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
          Café de especialidad
        </p>
        <KineticTitle
          as="h1"
          className="hero-title"
          lines={[
            { text: "Un buen café.", voice: "serif" },
            { text: "Cambia el ritmo.", voice: "italic", indent: 0.55 },
          ]}
        />
        <div className="hero-offer" data-hero-fade>
          <p className="hero-lead">
            Cafés de especialidad de distintos tostadores, seleccionados para que los disfrutes en casa.
          </p>
          <div className="hero-actions">
            <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg">
              Explorar cafés
            </a>
            <a href={BRAND_ANCHOR} className="link-line">
              Conocer KAZE
            </a>
          </div>
        </div>
      </div>

      <ul className="hero-facts" data-hero-fade aria-label="Sobre la tienda">
        <li>Café de especialidad en grano</li>
        <li>De distintos tostadores</li>
        <li>Tienda online en Argentina</li>
      </ul>
      {progress}
    </div>
  );
}
