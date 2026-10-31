import type { ReactNode } from "react";
import { BRAND_ANCHOR, COLLECTION_ANCHOR } from "@/cinematic/moments";

interface HeroCompositionProps {
  /** Panel visual (secuencia cinematográfica o fotografía fija). */
  media: ReactNode;
  /** Indicador de avance de la secuencia (solo en modo cinematográfico). */
  progress?: ReactNode;
}

/**
 * Hero V5 — la web es la protagonista, el café es la atmósfera.
 *
 * Desktop: zona editorial (60 %) con el titular de dos voces y la oferta;
 * zona visual (40 %) con el café contenido y fundido en el perla.
 * Móvil: titular y CTA primero, el café debajo.
 */
export function HeroComposition({ media, progress }: HeroCompositionProps) {
  return (
    <div className="hero" data-hero>
      <div className="hero-copy">
        <p className="hero-eyebrow t-label" data-hero-fade>
          Café de especialidad
        </p>
        <h1 className="hero-title" aria-label="Un buen café. Cambia el ritmo.">
          <span className="kz-line hero-title-serif" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">Un buen café.</span>
            </span>
          </span>
          <span className="kz-line hero-title-italic" aria-hidden>
            <span className="kz-line-air">
              <span className="kz-line-inner">Cambia el ritmo.</span>
            </span>
          </span>
        </h1>
        <p className="hero-lead" data-hero-fade>
          Seleccionamos cafés de especialidad de distintos tostadores para que los disfrutes en casa, a tu
          ritmo.
        </p>
        <div className="hero-actions" data-hero-fade>
          <a href={COLLECTION_ANCHOR} className="btn btn-primary btn-lg">
            Explorar cafés
          </a>
          <a href={BRAND_ANCHOR} className="link-line">
            Conocer KAZE
          </a>
        </div>
        <ul className="hero-facts" data-hero-fade aria-label="Sobre la tienda">
          <li>Café de especialidad en grano</li>
          <li>Tienda online en Argentina</li>
        </ul>
      </div>

      <div className="hero-media">
        <div className="hero-media-frame">{media}</div>
        {progress}
      </div>
    </div>
  );
}
