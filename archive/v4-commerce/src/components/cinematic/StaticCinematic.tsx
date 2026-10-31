"use client";

import { useEffect } from "react";
import { SEQUENCE_BASE, type SequenceManifest, type VariantId } from "@/cinematic/manifest";
import { MOMENTS } from "@/cinematic/moments";

/**
 * Versión ligera: sin scrubbing. Se usa con movimiento reducido, con ahorro
 * de datos o si no se pudo cargar la secuencia. Cuenta lo mismo con cuatro
 * fotografías fijas de los momentos clave (unos 100 KB en total en móvil).
 */
export function StaticCinematic({
  manifest,
  variant,
}: {
  manifest: SequenceManifest | null;
  variant: VariantId;
}) {
  // Sin escenario a pantalla completa, el encabezado lleva fondo desde el inicio.
  useEffect(() => {
    document.documentElement.dataset.headerSolid = "true";
    return () => {
      delete document.documentElement.dataset.headerSolid;
    };
  }, []);

  const posters = manifest?.variants[variant].posters ?? [];
  // Mensajes 1–3 ↔ pósters 1 (granos), 3 (molienda) y 5 (la taza terminada).
  const imageFor = [posters[0], posters[2], posters[4]];

  return (
    <div id="top">
      {MOMENTS.map((m, i) => {
        const Heading = i === 0 ? "h1" : "h2";
        const src = imageFor[i];
        return (
          <section
            key={m.id}
            aria-label={m.label}
            className="relative grid min-h-svh items-center gap-8 bg-pearl px-5 pb-16 pt-28 md:grid-cols-12 md:px-12"
          >
            <div className="md:col-span-5">
              <p className="t-label text-ink-muted">{m.label}</p>
              <Heading className={`mt-4 text-ink ${i === 0 ? "t-display-xl" : "t-display"}`}>{m.title}</Heading>
              {m.body && <p className="t-body-lg mt-5 max-w-[30ch] text-ink-muted">{m.body}</p>}
              {m.cta && (
                <div className="mt-8">
                  <a href={m.cta.href} className="btn btn-primary">
                    {m.cta.label}
                  </a>
                </div>
              )}
            </div>
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={SEQUENCE_BASE + src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full md:col-span-7"
                width={manifest?.variants[variant].width}
                height={manifest?.variants[variant].height}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
