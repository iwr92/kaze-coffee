"use client";

import gsap from "gsap";
import { useRef } from "react";
import { storeConfig } from "@/config/store";
import { EditorialImage } from "./editorial/EditorialImage";
import { useScene } from "./motion/useScene";
import { StoreLink } from "./StoreLink";
import { WindLines } from "./type/WindLines";

/**
 * Ritual — cierre de la landing. La taza llena el encuadre y la tagline
 * descansa en el vacío perla. Lleva a la tienda; si Tiendanube todavía no
 * está conectada, lo dice en lugar de mostrar un botón que no va a ningún lado.
 */
export function FinalCTA() {
  const ready = Boolean(storeConfig.url);
  const ref = useRef<HTMLElement>(null);

  useScene(ref, () => {
    gsap.fromTo(
      ".ritual-media img",
      { scale: 1.12 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: ".ritual-media", start: "top bottom", end: "bottom bottom", scrub: true } },
    );
    gsap.fromTo(
      ".ritual-heading .kz-line-inner",
      { yPercent: 112, xPercent: -5 },
      {
        yPercent: 0,
        xPercent: 0,
        duration: 1.3,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".ritual-heading", start: "top 82%" },
      },
    );
    gsap.fromTo(
      ".ritual-foot",
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".ritual-heading", start: "top 70%" } },
    );
  });

  return (
    <section ref={ref} id="tienda" aria-labelledby="tienda-title" className="ritual relative z-10 scroll-mt-24 bg-pearl">
      <div className="ritual-media" aria-hidden>
        <div className="hidden md:block">
          <EditorialImage id="ritual-amplio" alt="" sizes="100vw" className="h-full w-full object-cover" />
        </div>
        <div className="md:hidden">
          <EditorialImage id="ritual-vertical" alt="" sizes="100vw" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="ritual-copy">
        <p className="t-label text-ink-muted">Tu ritual</p>
        <WindLines
          label="Café de especialidad, a tu ritmo."
          lines={[
            { text: "Café de", indent: 0 },
            { text: "especialidad,", indent: 0.6 },
            { text: "a tu ritmo.", indent: 1.5 },
          ]}
          className="ritual-heading kz-mono-lg mt-5 text-ink"
        />
        <h2 id="tienda-title" className="sr-only">
          Tienda
        </h2>
        <div className="ritual-foot mt-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <p className="t-body-lg max-w-[30ch] text-ink-muted">
            Granos de origen trazable, tostados en pequeños lotes y enviados frescos.
          </p>
          {ready ? (
            <StoreLink destination="collection" className="btn btn-primary">
              Ir a la tienda
            </StoreLink>
          ) : (
            <p className="t-caption border-l border-ink/25 pl-4 text-ink-muted">La tienda online abre pronto.</p>
          )}
        </div>
      </div>
    </section>
  );
}
