"use client";

import gsap from "gsap";
import { useRef } from "react";
import { EditorialImage } from "../editorial/EditorialImage";
import { useScene } from "../motion/useScene";
import { WindLines } from "../type/WindLines";

/** Promesas del manual de marca (brand/MANUAL-DE-MARCA.md · Esencia). */
const PROMISES = ["Tostados en pequeños lotes.", "Enviados frescos."];

/**
 * Origen — editorial asimétrico. La fotografía macro (detalle real del
 * keyframe original) se abre como una ventana; el texto llega desfasado.
 */
export function Origin() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (root) => {
    gsap.fromTo(
      ".origin-frame",
      { clipPath: "inset(18% 22% 18% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scrollTrigger: { trigger: ".origin-frame", start: "top 85%", end: "center 45%", scrub: 0.6 },
      },
    );
    gsap.fromTo(
      ".origin-frame img",
      { scale: 1.18, xPercent: -3 },
      { scale: 1, xPercent: 0, ease: "none", scrollTrigger: { trigger: ".origin-frame", start: "top bottom", end: "bottom top", scrub: true } },
    );
    gsap.fromTo(
      ".origin-heading .kz-line-inner",
      { yPercent: 112 },
      { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: ".origin-heading", start: "top 80%" } },
    );
    gsap.utils.toArray<HTMLElement>(".origin-promise", root).forEach((el) => {
      gsap.fromTo(
        el,
        { xPercent: -14, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 62%", scrub: 0.6 } },
      );
      gsap.fromTo(
        el.querySelector(".origin-rule"),
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 70%", scrub: 0.6 } },
      );
    });
  });

  return (
    <section ref={ref} id="origen" aria-labelledby="origen-title" className="origin relative z-10 bg-pearl">
      <div className="origin-grid">
        <figure className="origin-frame">
          <EditorialImage
            id="granos-macro"
            alt="Granos de café tostado en el aire, con el surco central y la piel plateada visibles."
            sizes="(max-width: 767px) 100vw, 56vw"
            className="h-full w-full object-cover"
          />
        </figure>

        <div className="origin-copy">
          <p className="t-label text-ink-muted">Origen</p>
          <WindLines
            label="Origen trazable."
            lines={[
              { text: "Origen", indent: 0 },
              { text: "trazable.", indent: 0.8 },
            ]}
            className="origin-heading kz-mono-lg mt-5 text-ink"
          />
          <p className="t-body-lg mt-8 max-w-[34ch] text-ink-muted">
            Seleccionamos cafés de especialidad de distintos tostadores. Cada uno llega con su origen, su
            proceso y su fecha de tueste a la vista.
          </p>
          <ul className="origin-promises mt-16" aria-label="Lo que promete Kaze">
            {PROMISES.map((p) => (
              <li key={p} className="origin-promise">
                <span className="origin-rule" aria-hidden />
                <span className="kz-display-sm text-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
