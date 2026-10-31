"use client";

import { useEffect } from "react";
import { SEQUENCE_BASE, type SequenceManifest, type VariantId } from "@/cinematic/manifest";
import { HeroComposition } from "../hero/HeroComposition";

/**
 * Hero sin animación (movimiento reducido, ahorro de datos o si no cargó la
 * secuencia). Misma composición; el panel muestra una fotografía fija del
 * primer momento. La página no depende del video para verse diseñada.
 */
export function StaticCinematic({
  manifest,
  variant,
}: {
  manifest: SequenceManifest | null;
  variant: VariantId;
}) {
  // Sin escenario fijo, el encabezado lleva fondo desde el inicio.
  useEffect(() => {
    document.documentElement.dataset.headerSolid = "true";
    document.documentElement.classList.remove("kz-intro-pending");
    return () => {
      delete document.documentElement.dataset.headerSolid;
    };
  }, []);

  const v = manifest?.variants[variant];
  const poster = v?.posters[0];

  return (
    <section id="top" aria-label="Kaze, café de especialidad" className="hero-static relative bg-pearl">
      <HeroComposition
        media={
          poster && v ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={SEQUENCE_BASE + poster}
              alt="Granos de café de especialidad tostados, suspendidos en el aire."
              width={v.width}
              height={v.height}
              className="hero-static-image"
            />
          ) : null
        }
      />
    </section>
  );
}
